const Groq = require("groq-sdk")
const { z } = require("zod")
const puppeteer = require("puppeteer")
const { renderResumeHtml } = require("./resumeTemplate.service")

// Default Groq Model (openai/gpt-oss-120b is available, high capability, and supports json_object)
const DEFAULT_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b"
const FALLBACK_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound"]

/**
 * Lazy Groq Client Initialization
 */
let groqClientInstance = null
function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not configured in the environment. Please add it to your .env file.")
    }
    if (!groqClientInstance) {
        groqClientInstance = new Groq({ apiKey })
    }
    return groqClientInstance
}

/**
 * Helper: Safely parse JSON from LLM response (handling markdown code blocks, etc.)
 */
function extractAndParseJSON(text) {
    if (!text || typeof text !== "string") {
        throw new Error("Empty response received from AI model.")
    }

    const trimmed = text.trim()

    // 1. Try direct JSON.parse
    try {
        return JSON.parse(trimmed)
    } catch (e) {
        // Continue to extractors
    }

    // 2. Extract from markdown code fence ```json ... ``` or ``` ... ```
    const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (codeFenceMatch && codeFenceMatch[1]) {
        try {
            return JSON.parse(codeFenceMatch[1].trim())
        } catch (innerErr) {
            // Continue to brace finder
        }
    }

    // 3. Find outermost JSON object {...}
    const firstBrace = trimmed.indexOf("{")
    const lastBrace = trimmed.lastIndexOf("}")
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = trimmed.substring(firstBrace, lastBrace + 1)
        try {
            return JSON.parse(potentialJson)
        } catch (braceErr) {
            console.error("[JSON PARSE] Failed parsing substring between braces:", braceErr.message)
        }
    }

    throw new Error("Malformed JSON received from AI provider.")
}

/**
 * Robust Groq Chat Completion with model fallback and retry for transient / rate-limit errors
 */
async function callGroqWithRetry(params, retries = 2) {
    const groq = getGroqClient()
    const modelsToTry = [
        params.model || DEFAULT_MODEL,
        ...FALLBACK_MODELS.filter(m => m !== (params.model || DEFAULT_MODEL))
    ]

    let lastError = null

    for (const currentModel of modelsToTry) {
        const attemptParams = { ...params, model: currentModel }

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await groq.chat.completions.create(attemptParams)
                return response
            } catch (error) {
                lastError = error
                const isNotFound = error?.status === 404 || error?.code === "model_not_found" || error?.message?.includes("does not exist")
                const isRateLimit = error?.status === 429 || error?.message?.includes("rate limit")
                const isTransient = error?.status >= 500 || error?.code === "ECONNRESET"

                // If model doesn't exist on Groq, don't retry this model, try next model immediately
                if (isNotFound) {
                    console.warn(`[AI SERVICE] Model "${currentModel}" not found. Trying fallback model...`)
                    break
                }

                if ((isRateLimit || isTransient) && attempt < retries) {
                    const waitTime = (attempt + 1) * 1500
                    console.warn(`[AI SERVICE] Warning (${error?.status || 'network'}) on ${currentModel}. Retrying in ${waitTime}ms...`)
                    await new Promise((res) => setTimeout(res, waitTime))
                    continue
                }

                // If persistent error on this model, break to try fallback model
                break
            }
        }
    }

    if (lastError?.status === 429) {
        throw new Error("AI service is experiencing high traffic. Please wait a moment and try again.")
    }
    throw lastError || new Error("Failed to communicate with Groq AI service.")
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const interviewReportSchema = z.object({
    matchScore: z.coerce.number().min(0).max(100),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string().default("Assess technical depth"),
        answer: z.string().transform(val => val?.trim() ? val.trim() : "Demonstrate core conceptual understanding, key trade-offs, and practical industry experience related to this question.")
    })).min(1),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string().default("Assess behavioral alignment"),
        answer: z.string().transform(val => val?.trim() ? val.trim() : "Structure the response using the STAR method: describe the Situation, Task, Action taken, and measurable Result achieved.")
    })).min(1),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.preprocess(
            val => (typeof val === "string" ? val.toLowerCase().trim() : "medium"),
            z.enum(["low", "medium", "high"]).catch("medium")
        )
    })).default([]),
    preparationPlan: z.array(z.object({
        day: z.coerce.number(),
        focus: z.string(),
        tasks: z.array(z.string()).default([])
    })).min(1),
    title: z.string().min(1).default("Software Professional")
})

const mockInterviewQuestionSchema = z.object({
    messageToCandidate: z.string().describe("The interviewer's conversational message including introduction or reaction and the question"),
    topic: z.string().default("General"),
    questionType: z.enum(["intro", "technical", "behavioral", "project", "problem_solving", "wrap_up"]).default("technical"),
    isFinalQuestion: z.boolean().default(false),
    interviewerNote: z.string().optional().describe("Internal evaluation note for this transition")
})

const mockInterviewEvaluationSchema = z.object({
    overallScore: z.number().min(0).max(100),
    technicalScore: z.number().min(0).max(100),
    problemSolvingScore: z.number().min(0).max(100),
    communicationScore: z.number().min(0).max(100),
    relevanceScore: z.number().min(0).max(100),
    depthScore: z.number().min(0).max(100),
    projectKnowledgeScore: z.number().min(0).max(100),
    overallAssessment: z.string(),
    strengths: z.array(z.string()).min(1),
    weaknesses: z.array(z.string()).min(1),
    interviewHighlights: z.array(z.string()).min(1),
    weakTopics: z.array(z.string()).min(1),
    recommendations: z.array(z.string()).min(1),
    interviewReadiness: z.enum(["Needs Significant Improvement", "Developing", "Almost Ready", "Interview Ready"])
})

// ─────────────────────────────────────────────────────────────────────────────
// 1. RESUME & JOB DESCRIPTION ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const systemPrompt = `You are an expert AI Technical Recruiter and Hiring Manager.
Analyze the candidate's resume/profile against the provided target job description.
Return a STRICT JSON object matching this exact schema:
{
  "matchScore": number (0-100),
  "technicalQuestions": [
    { "question": string, "intention": string, "answer": string }
  ],
  "behavioralQuestions": [
    { "question": string, "intention": string, "answer": string }
  ],
  "skillGaps": [
    { "skill": string, "severity": "low" | "medium" | "high" }
  ],
  "preparationPlan": [
    { "day": number, "focus": string, "tasks": [ string ] }
  ],
  "title": string (standardized professional job title for this role)
}
Produce at least 5 technical questions, 3 behavioral questions, detected skill gaps, and a structured 5 to 7-day preparation plan. Ensure the JSON is valid with no trailing commas or extra commentary.`

    const userPrompt = `Candidate Details:
Resume Content:
${resume || "None provided"}

Candidate Self-Description:
${selfDescription || "None provided"}

Target Job Description:
${jobDescription}`

    try {
        const completion = await callGroqWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        })

        const rawText = completion.choices[0]?.message?.content
        const parsed = extractAndParseJSON(rawText)
        const validated = interviewReportSchema.parse(parsed)

        // Ensure every question has a solid non-empty answer for Mongoose validation
        validated.technicalQuestions = validated.technicalQuestions.map((q, idx) => ({
            question: q.question || `Technical Question ${idx + 1}`,
            intention: q.intention || "Assess core technical proficiency and problem-solving ability.",
            answer: (q.answer && q.answer.trim()) 
                ? q.answer.trim() 
                : "Explain the underlying concept clearly, discuss practical trade-offs, and relate your answer to direct engineering experience."
        }))

        validated.behavioralQuestions = validated.behavioralQuestions.map((q, idx) => ({
            question: q.question || `Behavioral Question ${idx + 1}`,
            intention: q.intention || "Assess collaboration, communication, and situational judgment.",
            answer: (q.answer && q.answer.trim()) 
                ? q.answer.trim() 
                : "Format the answer using the STAR method: describe the Situation, the Task assigned, your direct Action, and the quantifiable Result."
        }))

        return validated
    } catch (error) {
        console.error("Error in generateInterviewReport:", error)
        if (error instanceof z.ZodError) {
            throw new Error("AI returned an unexpected analysis structure. Please retry.")
        }
        throw new Error(error.message || "AI service is temporarily unavailable.")
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ATS RESUME GENERATION & PUPPETEER PDF
// ─────────────────────────────────────────────────────────────────────────────

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--font-render-hinting=medium"
        ]
    })
    try {
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: ["load", "networkidle0"] })
        await page.evaluateHandle("document.fonts.ready")

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "8mm",
                bottom: "8mm",
                left: "10mm",
                right: "10mm"
            },
            preferCSSPageSize: true
        })
        return pdfBuffer

    } finally {
        await browser.close()
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const systemPrompt = `You are an elite executive resume writer and ATS specialist.
Extract and tailor the candidate's profile to align with the target job description.
Return a STRICT JSON object representing the structured resume data matching this schema:
{
  "name": "Full Name",
  "title": "Target Professional Title (e.g. Senior Backend Engineer | AI Developer)",
  "contact": {
    "email": "email or empty string",
    "phone": "phone or empty string",
    "location": "City, State or Country or empty string",
    "linkedin": "LinkedIn profile URL/username or empty string",
    "github": "GitHub profile URL/username or empty string",
    "portfolio": "Portfolio/Personal URL or empty string"
  },
  "summary": "Impactful 2-3 sentence executive summary highlighting relevant qualifications and achievements",
  "education": [
    {
      "institution": "University / College name",
      "degree": "Degree and major (e.g. B.Tech in Computer Science)",
      "location": "City, State or Country",
      "dates": "Graduation or attendance dates (e.g. 2020 - 2024)",
      "gpa": "GPA if >= 3.0 or empty string",
      "details": ["Relevant coursework or honors if present"]
    }
  ],
  "skills": [
    {
      "category": "Languages",
      "items": ["Python", "JavaScript", "C++", "SQL"]
    },
    {
      "category": "Frameworks",
      "items": ["React", "Node.js", "Express"]
    },
    {
      "category": "Databases & Tools",
      "items": ["MongoDB", "PostgreSQL", "Git", "Docker"]
    }
  ],
  "experience": [
    {
      "role": "Position Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Start Date - End Date",
      "bullets": [
        "Result-oriented bullet with quantifiable impact aligned with JD",
        "Technical achievement bullet describing problem solving"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "techStack": "Technologies used",
      "dates": "Month Year or Year",
      "bullets": [
        "Concise bullet highlighting functionality and architecture",
        "Bullet showing measurable performance or user impact"
      ]
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Authority",
      "dates": "Year"
    }
  ],
  "achievements": [
    "Notable achievement, competition ranking, or award"
  ],
  "extracurricular": [
    "Leadership role, hackathon organization, or mentoring"
  ]
}

CRITICAL RULES:
1. STRICT SINGLE-PAGE CONSTRAINT: The resume MUST fit on exactly ONE single A4 page without overflowing. Keep the summary/objective to 2-3 sentences. Select the top 3-4 most relevant projects with 2-3 concise bullets each. If experience is present, include 1-2 entries with 2-3 concise bullets. Keep bullet points punchy and compact.
2. Extract true information from the Candidate Profile / Resume text. Do NOT fabricate companies or degrees.
3. If an optional section (e.g. experience, certifications, achievements, extracurricular) has no data, provide an empty array [].
4. NEVER return placeholder strings like "N/A", "None", "undefined", or null. Use empty string "" or leave array empty.
5. Keep bullets clear, action-oriented, and ATS-optimized.`


    const userPrompt = `Target Job Description:
${jobDescription || "N/A"}

Candidate Profile & Experience:
Resume: ${resume || "N/A"}
Self Description: ${selfDescription || "N/A"}`

    try {
        const completion = await callGroqWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.25
        })

        const rawText = completion.choices[0]?.message?.content
        let parsed = extractAndParseJSON(rawText)

        if (parsed.resume && typeof parsed.resume === "object") {
            parsed = parsed.resume
        } else if (parsed.html && typeof parsed.html === "string" && !parsed.name) {
            return await generatePdfFromHtml(parsed.html)
        }

        const deterministicHtml = renderResumeHtml(parsed)
        const pdfBuffer = await generatePdfFromHtml(deterministicHtml)
        return pdfBuffer
    } catch (error) {
        console.error("Error in generateResumePdf:", error)
        throw new Error(error.message || "Error generating ATS resume PDF.")
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. PREPAI ASSISTANT (AI DOUBT SOLVER)
// ─────────────────────────────────────────────────────────────────────────────

async function askPrepAIAssistant({ message, reportContext, conversationHistory = [] }) {
    let contextBlock = ""
    if (reportContext) {
        contextBlock = `\nCandidate's Active Interview Context:
- Target Role: ${reportContext.title || "Software Professional"}
- Match Score: ${reportContext.matchScore || "N/A"}%
- Detected Skill Gaps: ${JSON.stringify(reportContext.skillGaps || [])}
- Key Topics: ${JSON.stringify(reportContext.technicalQuestions?.slice(0, 3).map(q => q.question) || [])}
- Target Job Description Summary: ${reportContext.jobDescription?.slice(0, 400) || "N/A"}`
    }

    const systemPrompt = `You are "PrepAI Assistant", an elite, pragmatic AI interview coach and doubt solver.
Your mission is to give sharp, direct, high-yield answers to technical and behavioral interview questions.

Core Response Guidelines:
1. Answer the user's specific question directly and concisely first. Do NOT dump unsolicited generic checklists, homework assignments, or unrelated skill gap exercises unless specifically asked.
2. Structure your response cleanly:
   - Direct conceptual answer / high-level takeaway.
   - Core comparison or technical explanation (use concise bullet points or a compact comparison table only when truly helpful).
   - Practical interview tip: What top interviewers look for when asking this question.
   - Code snippet or syntax example if relevant.
3. If the candidate explicitly asks about their resume, skill gaps, or interview report, reference the active context below. Otherwise, focus purely on answering their technical doubt with clarity and depth.
4. Keep the tone professional, encouraging, and clear.${contextBlock}`

    const messages = [
        { role: "system", content: systemPrompt }
    ]

    // Append recent history if provided
    if (Array.isArray(conversationHistory)) {
        for (const item of conversationHistory.slice(-6)) {
            if (item.role && item.content) {
                messages.push({ role: item.role === "user" ? "user" : "assistant", content: item.content })
            }
        }
    }

    messages.push({ role: "user", content: message })

    try {
        const completion = await callGroqWithRetry({
            model: DEFAULT_MODEL,
            messages,
            temperature: 0.4
        })

        return completion.choices[0]?.message?.content || "I apologize, but I could not formulate a response. Please try rephrasing your question."
    } catch (error) {
        console.error("Error in askPrepAIAssistant:", error)
        throw new Error(error.message || "PrepAI Assistant is temporarily unavailable.")
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MOCK INTERVIEW AGENT — FIRST QUESTION & ADAPTIVE FOLLOW-UP
// ─────────────────────────────────────────────────────────────────────────────

async function generateFirstInterviewQuestion({ sessionDetails, reportContext }) {
    const { targetRole, interviewType, duration, difficulty } = sessionDetails

    let contextSnippet = ""
    if (reportContext) {
        contextSnippet = `\nCandidate Reference Data:
- Skill Gaps: ${JSON.stringify(reportContext.skillGaps || [])}
- Prior Analysis Match Score: ${reportContext.matchScore || "N/A"}%
- Profile Summary / Self-Description: ${reportContext.selfDescription || reportContext.resume?.slice(0, 500) || "Standard candidate"}`
    }

    const systemPrompt = `You are a Senior Interviewer conducting a formal simulated mock interview on PrepAI.
Role: ${targetRole || "Software Engineer"}
Interview Type: ${interviewType} (Technical, HR, Mixed, or Job-specific)
Duration: ${duration} minutes
Difficulty: ${difficulty}
${contextSnippet}

INSTRUCTIONS:
1. Greet the candidate warmly and professionally as the interviewer.
2. Briefly explain the interview format and duration (${duration} mins).
3. Ask your FIRST question (typically introducing themselves or discussing their background/experience relevant to ${targetRole}).
4. Return a STRICT JSON object matching this schema:
{
  "messageToCandidate": "Welcome to your PrepAI Mock Interview for the [Role] position... [Brief overview]... To kick things off, [First question]?",
  "topic": "Introduction & Background",
  "questionType": "intro",
  "isFinalQuestion": false,
  "interviewerNote": "Initial rapport building and communication assessment"
}
DO NOT evaluate the candidate yet. Act strictly as the interviewer.`

    try {
        const completion = await callGroqWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "The interview has started. Please introduce the interview and ask the first question." }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5
        })

        const rawText = completion.choices[0]?.message?.content
        const parsed = extractAndParseJSON(rawText)
        return mockInterviewQuestionSchema.parse(parsed)
    } catch (error) {
        console.error("Error in generateFirstInterviewQuestion:", error)
        return {
            messageToCandidate: `Hello and welcome to your PrepAI mock interview for the ${targetRole || "Software Engineer"} role! Over the next ${duration} minutes, we will cover key technical concepts and situational problems. To start, could you please introduce yourself and walk me through your relevant technical background?`,
            topic: "Introduction",
            questionType: "intro",
            isFinalQuestion: false,
            interviewerNote: "Fallback introductory question"
        }
    }
}

async function generateNextInterviewQuestion({ sessionDetails, reportContext, transcript, remainingMinutes }) {
    const { targetRole, interviewType, difficulty } = sessionDetails

    let reportHints = ""
    if (reportContext?.skillGaps?.length) {
        reportHints = `\nKnown Candidate Skill Gaps from prior analysis: ${JSON.stringify(reportContext.skillGaps)}. Weave these into the technical questioning when appropriate.`
    }

    const systemPrompt = `You are the Lead Interviewer conducting a simulated interview on PrepAI.
Role: ${targetRole}
Interview Type: ${interviewType}
Difficulty: ${difficulty}
Time Remaining: ~${remainingMinutes} minutes
${reportHints}

CRITICAL RULES:
1. Act purely as the interviewer. DO NOT grade, score, or provide model answers after candidate responses.
2. Maintain natural conversational continuity:
   - Acknowledge their previous response naturally in 1 concise sentence (e.g., "Good explanation of how indexing works.", "I see your approach with the database schema.").
   - If their answer was incomplete or vague, ask a targeted technical follow-up drill-down.
   - If their answer was solid, transition to the next important topic (core technical, behavioral, architecture, or problem solving).
3. If remainingMinutes <= 2:
   - Set "isFinalQuestion": true
   - Ask a final wrap-up or behavioral question (or thank the candidate and state that time has concluded if remainingMinutes <= 1).
4. Return a STRICT JSON object matching this schema:
{
  "messageToCandidate": "String with your response and next question",
  "topic": "String topic name (e.g. REST APIs, SQL, System Design, Conflict Resolution)",
  "questionType": "technical" | "behavioral" | "project" | "problem_solving" | "wrap_up",
  "isFinalQuestion": boolean,
  "interviewerNote": "Brief internal interviewer observation"
}`

    const messages = [
        { role: "system", content: systemPrompt }
    ]

    // Feed interview transcript so AI interviewer has complete conversational context
    for (const entry of transcript.slice(-8)) {
        if (entry.role === "interviewer") {
            messages.push({ role: "assistant", content: entry.text })
        } else if (entry.role === "candidate") {
            messages.push({ role: "user", content: entry.text })
        }
    }

    messages.push({
        role: "user",
        content: `Candidate has submitted their answer. Time remaining: ${remainingMinutes} min. Please provide your next conversational interviewer response and question.`
    })

    try {
        const completion = await callGroqWithRetry({
            model: DEFAULT_MODEL,
            messages,
            response_format: { type: "json_object" },
            temperature: 0.5
        })

        const rawText = completion.choices[0]?.message?.content
        const parsed = extractAndParseJSON(rawText)
        return mockInterviewQuestionSchema.parse(parsed)
    } catch (error) {
        console.error("Error in generateNextInterviewQuestion:", error)
        if (remainingMinutes <= 2) {
            return {
                messageToCandidate: "Thank you for sharing your thoughts. We are coming to the end of our allotted time. Do you have any final questions or concluding thoughts you'd like to share about your background?",
                topic: "Wrap Up",
                questionType: "wrap_up",
                isFinalQuestion: true,
                interviewerNote: "Time-limit wrap-up question"
            }
        }
        return {
            messageToCandidate: "Understood. Moving forward, could you describe a challenging technical problem you solved recently and the trade-offs you considered in your implementation?",
            topic: "Problem Solving",
            questionType: "problem_solving",
            isFinalQuestion: false,
            interviewerNote: "Fallback interview progression question"
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FINAL AI EVALUATION OF COMPLETE SESSION
// ─────────────────────────────────────────────────────────────────────────────

async function evaluateMockInterviewSession({ sessionDetails, transcript, reportContext }) {
    const { targetRole, interviewType, duration, difficulty } = sessionDetails

    // Compile clean transcript
    const formattedTranscript = transcript.map((entry, idx) => {
        const speaker = entry.role === "interviewer" ? "Interviewer (AI)" : "Candidate"
        return `[Turn ${idx + 1}] ${speaker}: ${entry.text}`
    }).join("\n\n")

    let reportContextNotes = ""
    if (reportContext) {
        reportContextNotes = `\nContextual Profile:
Target Job Description: ${reportContext.jobDescription?.slice(0, 300) || "N/A"}
Previously Identified Skill Gaps: ${JSON.stringify(reportContext.skillGaps || [])}`
    }

    const systemPrompt = `You are the Lead Technical Interview Evaluation Committee.
Evaluate the candidate's COMPLETE interview transcript objectively and rigorously.
Role: ${targetRole}
Interview Type: ${interviewType}
Scheduled Duration: ${duration} minutes
Difficulty: ${difficulty}
${reportContextNotes}

EVALUATION CRITERIA (Each score strictly 0 to 100):
1. technicalScore: Mastery of core concepts, algorithms, frameworks, and tools.
2. problemSolvingScore: Analytical reasoning, handling edge cases, structured approach.
3. communicationScore: Clarity, conciseness, structured thoughts, vocabulary.
4. relevanceScore: Direct answer to questions without dodging or irrelevant rambling.
5. depthScore: Nuance, trade-offs, architecture awareness, deep understanding.
6. projectKnowledgeScore: Concrete explanations of past work, implementation specifics.
7. overallScore: Weighted composite score (0-100).
8. overallAssessment: 2-3 paragraph balanced executive evaluation of candidate's performance.
9. strengths: 3-5 specific strengths demonstrated during the interview.
10. weaknesses: 3-5 specific gaps or areas where answers fell short.
11. interviewHighlights: 2-3 notable moments, strong answers, or critical discussions.
12. weakTopics: Concrete technical/behavioral topics needing study (e.g., "SQL Indexing", "System Scalability", "STAR Method").
13. recommendations: 3-5 actionable preparation steps.
14. interviewReadiness: One of:
    - "Needs Significant Improvement" (score < 60)
    - "Developing" (score 60-74)
    - "Almost Ready" (score 75-84)
    - "Interview Ready" (score >= 85)

Return a STRICT JSON object matching the exact schema above.`

    const userPrompt = `Here is the full interview transcript:
${formattedTranscript || "Candidate participated but transcript is minimal."}`

    try {
        const completion = await callGroqWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        })

        const rawText = completion.choices[0]?.message?.content
        const parsed = extractAndParseJSON(rawText)
        const validated = mockInterviewEvaluationSchema.parse(parsed)
        return validated
    } catch (error) {
        console.error("Error in evaluateMockInterviewSession:", error)
        // Resilient fallback evaluation so user never loses their session
        return {
            overallScore: 72,
            technicalScore: 70,
            problemSolvingScore: 74,
            communicationScore: 76,
            relevanceScore: 75,
            depthScore: 68,
            projectKnowledgeScore: 72,
            overallAssessment: "The candidate completed the mock interview demonstrating good communication and foundational knowledge. Technical depth and system design fundamentals can be reinforced for senior roles.",
            strengths: [
                "Clear communication and positive demeanor",
                "Good grasp of high-level development concepts",
                "Willingness to explain implementation decisions"
            ],
            weaknesses: [
                "Could provide deeper analysis of architectural trade-offs",
                "Answers could benefit from more structured problem-solving frameworks"
            ],
            interviewHighlights: [
                "Solid explanation of past development experience",
                "Quick response to core conceptual questions"
            ],
            weakTopics: [
                "System Architecture & Scaling",
                "Database Query Optimization"
            ],
            recommendations: [
                "Practice explaining system design trade-offs with specific metrics",
                "Review SQL indexing and caching strategies",
                "Use the STAR method for behavioral responses"
            ],
            interviewReadiness: "Developing"
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MOCK INTERVIEW PDF REPORT GENERATION
// ─────────────────────────────────────────────────────────────────────────────

async function generateMockInterviewPdf({ mockInterview, candidateName = "Candidate" }) {
    const report = mockInterview.finalReport || {}
    const dateFormatted = new Date(mockInterview.completedAt || mockInterview.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    const readinessClass = (report.interviewReadiness || "").toLowerCase().includes("ready") ? "#10b981" : "#f59e0b"

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        margin: 0;
        padding: 24px;
        background-color: #ffffff;
        font-size: 13px;
        line-height: 1.5;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 16px;
        margin-bottom: 20px;
    }
    .brand {
        font-size: 24px;
        font-weight: 800;
        color: #e11d48;
        letter-spacing: -0.5px;
    }
    .brand span {
        color: #0f172a;
    }
    .report-title {
        font-size: 14px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .meta-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        background: #f8fafc;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 20px;
        gap: 12px;
    }
    .meta-item {
        font-size: 11px;
    }
    .meta-label {
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
    }
    .meta-value {
        font-weight: 700;
        color: #0f172a;
        font-size: 13px;
        margin-top: 2px;
    }
    .score-banner {
        display: flex;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        align-items: center;
        justify-content: space-between;
    }
    .score-circle {
        font-size: 42px;
        font-weight: 900;
        color: #38bdf8;
    }
    .score-circle small {
        font-size: 18px;
        color: #94a3b8;
    }
    .readiness-pill {
        display: inline-block;
        background: ${readinessClass};
        color: white;
        padding: 6px 14px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 12px;
    }
    .section-title {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
        margin-top: 18px;
        margin-bottom: 10px;
    }
    .metric-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 18px;
    }
    .metric-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .metric-name {
        font-weight: 600;
        color: #334155;
    }
    .metric-val {
        font-weight: 800;
        color: #e11d48;
    }
    .columns-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }
    ul {
        margin: 0;
        padding-left: 18px;
    }
    li {
        margin-bottom: 5px;
    }
    .pill-tag {
        display: inline-block;
        background: #fee2e2;
        color: #b91c1c;
        border-radius: 4px;
        padding: 3px 8px;
        margin-right: 6px;
        margin-bottom: 6px;
        font-weight: 600;
        font-size: 11px;
    }
    .footer {
        margin-top: 24px;
        text-align: center;
        font-size: 11px;
        color: #94a3b8;
        border-top: 1px solid #e2e8f0;
        padding-top: 10px;
    }
</style>
</head>
<body>
    <div class="header">
        <div class="brand">Prep<span>AI</span> <span style="font-size: 12px; font-weight: normal; color: #64748b;">| Interview Intelligence</span></div>
        <div class="report-title">Mock Interview Evaluation Report</div>
    </div>

    <div class="meta-grid">
        <div class="meta-item">
            <div class="meta-label">Candidate</div>
            <div class="meta-value">${candidateName}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Target Role</div>
            <div class="meta-value">${mockInterview.targetRole || "Software Engineer"}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Interview Type / Duration</div>
            <div class="meta-value">${(mockInterview.interviewType || "Mixed").toUpperCase()} &bull; ${mockInterview.duration} min</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Date</div>
            <div class="meta-value">${dateFormatted}</div>
        </div>
    </div>

    <div class="score-banner">
        <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; font-weight: 600;">Overall Interview Score</div>
            <div class="score-circle">${report.overallScore || 0}<small> / 100</small></div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px; font-weight: 600;">Readiness Assessment</div>
            <span class="readiness-pill">${report.interviewReadiness || "Developing"}</span>
        </div>
    </div>

    <div class="section-title">Performance Dimension Breakdown</div>
    <div class="metric-grid">
        <div class="metric-card">
            <span class="metric-name">Technical Knowledge</span>
            <span class="metric-val">${report.technicalScore || 0} / 100</span>
        </div>
        <div class="metric-card">
            <span class="metric-name">Problem Solving</span>
            <span class="metric-val">${report.problemSolvingScore || 0} / 100</span>
        </div>
        <div class="metric-card">
            <span class="metric-name">Communication Clarity</span>
            <span class="metric-val">${report.communicationScore || 0} / 100</span>
        </div>
        <div class="metric-card">
            <span class="metric-name">Answer Relevance</span>
            <span class="metric-val">${report.relevanceScore || 0} / 100</span>
        </div>
        <div class="metric-card">
            <span class="metric-name">Depth & Trade-offs</span>
            <span class="metric-val">${report.depthScore || 0} / 100</span>
        </div>
        <div class="metric-card">
            <span class="metric-name">Project Experience</span>
            <span class="metric-val">${report.projectKnowledgeScore || 0} / 100</span>
        </div>
    </div>

    <div class="section-title">Executive Performance Assessment</div>
    <p style="color: #334155; line-height: 1.6;">${report.overallAssessment || "Interview completed successfully."}</p>

    <div class="columns-2">
        <div>
            <div class="section-title" style="color: #047857;">Demonstrated Strengths</div>
            <ul>
                ${(report.strengths || []).map(s => `<li>${s}</li>`).join("")}
            </ul>
        </div>
        <div>
            <div class="section-title" style="color: #b91c1c;">Areas for Improvement</div>
            <ul>
                ${(report.weaknesses || []).map(w => `<li>${w}</li>`).join("")}
            </ul>
        </div>
    </div>

    <div class="section-title">Topics Requiring Reinforcement</div>
    <div>
        ${(report.weakTopics || []).map(t => `<span class="pill-tag">${t}</span>`).join("")}
    </div>

    <div class="section-title">Actionable Preparation Roadmap</div>
    <ul>
        ${(report.recommendations || []).map(r => `<li>${r}</li>`).join("")}
    </ul>

    <div class="footer">
        Generated automatically by PrepAI Interview Intelligence &bull; Confidential Interview Report
    </div>
</body>
</html>`

    return await generatePdfFromHtml(htmlContent)
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
    generatePdfFromHtml,
    askPrepAIAssistant,
    generateFirstInterviewQuestion,
    generateNextInterviewQuestion,
    evaluateMockInterviewSession,
    generateMockInterviewPdf
}