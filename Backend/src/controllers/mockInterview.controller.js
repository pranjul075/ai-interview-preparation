const mockInterviewModel = require("../models/mockInterview.model")
const interviewReportModel = require("../models/interviewReport.model")
const userModel = require("../models/user.model")
const {
    generateFirstInterviewQuestion,
    generateNextInterviewQuestion,
    evaluateMockInterviewSession,
    generateMockInterviewPdf
} = require("../services/ai.service")

/**
 * @name startMockInterview
 * @route POST /api/mock-interview/start
 * @description Start a new time-aware mock interview session
 * @access Private
 */
async function startMockInterview(req, res) {
    try {
        const {
            interviewReportId,
            targetRole,
            interviewType = "mixed",
            duration = 20,
            difficulty = "adaptive"
        } = req.body

        // Validate duration
        const parsedDuration = parseInt(duration, 10)
        if (![10, 20, 30].includes(parsedDuration)) {
            return res.status(400).json({
                message: "Interview duration must be 10, 20, or 30 minutes."
            })
        }

        // Validate type and difficulty
        const validTypes = ["technical", "hr", "mixed", "job_specific"]
        const validDifficulties = ["easy", "medium", "hard", "adaptive"]

        if (!validTypes.includes(interviewType)) {
            return res.status(400).json({ message: "Invalid interview type." })
        }
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ message: "Invalid difficulty level." })
        }

        let reportContext = null
        let resolvedRole = targetRole ? targetRole.trim() : ""
        let resolvedJobDesc = ""

        if (interviewReportId) {
            reportContext = await interviewReportModel.findOne({
                _id: interviewReportId,
                user: req.user.id
            })

            if (reportContext) {
                if (!resolvedRole) resolvedRole = reportContext.title
                resolvedJobDesc = reportContext.jobDescription || ""
            }
        }

        if (!resolvedRole) {
            resolvedRole = "Software Engineer"
        }

        const startedAt = new Date()
        const expiresAt = new Date(startedAt.getTime() + parsedDuration * 60 * 1000)

        const sessionDetails = {
            targetRole: resolvedRole,
            interviewType,
            duration: parsedDuration,
            difficulty,
            jobDescription: resolvedJobDesc
        }

        // Generate opening question
        const firstQuestionData = await generateFirstInterviewQuestion({
            sessionDetails,
            reportContext
        })

        const initialTranscript = [
            {
                role: "interviewer",
                text: firstQuestionData.messageToCandidate,
                timestamp: startedAt,
                topic: firstQuestionData.topic || "Introduction",
                questionType: firstQuestionData.questionType || "intro",
                interviewerNote: firstQuestionData.interviewerNote || ""
            }
        ]

        const newSession = await mockInterviewModel.create({
            user: req.user.id,
            interviewReport: reportContext ? reportContext._id : null,
            targetRole: resolvedRole,
            jobDescription: resolvedJobDesc,
            interviewType,
            duration: parsedDuration,
            difficulty,
            status: "in_progress",
            startedAt,
            expiresAt,
            transcript: initialTranscript,
            currentQuestionIndex: 0
        })

        res.status(201).json({
            message: "Mock interview session started successfully.",
            session: newSession,
            firstQuestion: firstQuestionData
        })

    } catch (error) {
        console.error("Error starting mock interview:", error)
        res.status(500).json({
            message: error.message || "Failed to start mock interview. Please try again."
        })
    }
}

/**
 * @name submitAnswer
 * @route POST /api/mock-interview/:id/answer
 * @description Submit candidate answer and get dynamic interviewer follow-up
 * @access Private
 */
async function submitAnswer(req, res) {
    try {
        const { id } = req.params
        const { answer } = req.body

        if (!answer || !answer.trim()) {
            return res.status(400).json({
                message: "Please enter your answer before submitting."
            })
        }

        const session = await mockInterviewModel.findOne({
            _id: id,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview session not found or unauthorized."
            })
        }

        if (session.status === "completed") {
            return res.status(400).json({
                message: "This interview has already been completed.",
                isCompleted: true
            })
        }

        const now = new Date()
        const isTimeExpired = now > new Date(session.expiresAt)

        // Append candidate's answer
        session.transcript.push({
            role: "candidate",
            text: answer.trim(),
            timestamp: now
        })

        // Check time expiration
        if (isTimeExpired) {
            // Auto finish interview
            return await autoFinishAndRespond(session, res)
        }

        // Calculate remaining minutes
        const remainingMs = new Date(session.expiresAt).getTime() - now.getTime()
        const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000))

        // Retrieve report context if linked
        let reportContext = null
        if (session.interviewReport) {
            reportContext = await interviewReportModel.findById(session.interviewReport)
        }

        // Generate next question
        const nextQ = await generateNextInterviewQuestion({
            sessionDetails: {
                targetRole: session.targetRole,
                interviewType: session.interviewType,
                duration: session.duration,
                difficulty: session.difficulty,
                jobDescription: session.jobDescription
            },
            reportContext,
            transcript: session.transcript,
            remainingMinutes
        })

        // Append interviewer question
        session.transcript.push({
            role: "interviewer",
            text: nextQ.messageToCandidate,
            timestamp: new Date(),
            topic: nextQ.topic,
            questionType: nextQ.questionType,
            interviewerNote: nextQ.interviewerNote
        })

        session.currentQuestionIndex += 1
        await session.save()

        res.status(200).json({
            message: "Answer received.",
            nextQuestion: nextQ,
            remainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
            currentQuestionIndex: session.currentQuestionIndex,
            isCompleted: false
        })

    } catch (error) {
        console.error("Error submitting answer:", error)
        res.status(500).json({
            message: error.message || "Error processing your answer. Please try again."
        })
    }
}

/**
 * Helper to conclude interview and evaluate
 */
async function autoFinishAndRespond(session, res) {
    session.status = "completed"
    session.completedAt = new Date()

    let reportContext = null
    if (session.interviewReport) {
        reportContext = await interviewReportModel.findById(session.interviewReport)
    }

    const evaluation = await evaluateMockInterviewSession({
        sessionDetails: session,
        transcript: session.transcript,
        reportContext
    })

    session.finalReport = evaluation
    await session.save()

    return res.status(200).json({
        message: "Your interview time has concluded. Evaluation report generated.",
        isCompleted: true,
        session
    })
}

/**
 * @name finishMockInterview
 * @route POST /api/mock-interview/:id/finish
 * @description Manually conclude interview session and trigger final evaluation
 * @access Private
 */
async function finishMockInterview(req, res) {
    try {
        const { id } = req.params

        const session = await mockInterviewModel.findOne({
            _id: id,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview session not found or unauthorized."
            })
        }

        if (session.status === "completed" && session.finalReport?.overallScore) {
            return res.status(200).json({
                message: "Interview already evaluated.",
                session
            })
        }

        session.status = "completed"
        session.completedAt = new Date()

        let reportContext = null
        if (session.interviewReport) {
            reportContext = await interviewReportModel.findById(session.interviewReport)
        }

        const evaluation = await evaluateMockInterviewSession({
            sessionDetails: session,
            transcript: session.transcript,
            reportContext
        })

        session.finalReport = evaluation
        await session.save()

        res.status(200).json({
            message: "Mock interview concluded successfully.",
            session
        })

    } catch (error) {
        console.error("Error finishing mock interview:", error)
        res.status(500).json({
            message: error.message || "Failed to finalize interview evaluation."
        })
    }
}

/**
 * @name getMockInterviewById
 * @route GET /api/mock-interview/:id
 * @description Get interview session state, transcript, and timer
 * @access Private
 */
async function getMockInterviewById(req, res) {
    try {
        const { id } = req.params

        const session = await mockInterviewModel.findOne({
            _id: id,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview session not found or unauthorized."
            })
        }

        const now = new Date()
        const remainingSeconds = session.status === "completed"
            ? 0
            : Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - now.getTime()) / 1000))

        res.status(200).json({
            session,
            remainingSeconds
        })

    } catch (error) {
        console.error("Error fetching session:", error)
        res.status(500).json({
            message: "Server error fetching mock interview."
        })
    }
}

/**
 * @name getAllMockInterviews
 * @route GET /api/mock-interview
 * @description List all previous mock interviews for the authenticated user
 * @access Private
 */
async function getAllMockInterviews(req, res) {
    try {
        const interviews = await mockInterviewModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("targetRole interviewType duration difficulty status startedAt completedAt createdAt finalReport.overallScore finalReport.interviewReadiness finalReport.technicalScore finalReport.communicationScore")

        res.status(200).json({
            interviews
        })

    } catch (error) {
        console.error("Error fetching mock interview history:", error)
        res.status(500).json({
            message: "Server error fetching mock interview history."
        })
    }
}

/**
 * @name getMockInterviewReport
 * @route GET /api/mock-interview/:id/report
 * @description Retrieve final comprehensive evaluation report
 * @access Private
 */
async function getMockInterviewReport(req, res) {
    try {
        const { id } = req.params

        const session = await mockInterviewModel.findOne({
            _id: id,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview not found or unauthorized."
            })
        }

        if (!session.finalReport || !session.finalReport.overallScore) {
            // If not evaluated yet, evaluate now
            let reportContext = null
            if (session.interviewReport) {
                reportContext = await interviewReportModel.findById(session.interviewReport)
            }

            const evaluation = await evaluateMockInterviewSession({
                sessionDetails: session,
                transcript: session.transcript,
                reportContext
            })

            session.finalReport = evaluation
            session.status = "completed"
            session.completedAt = session.completedAt || new Date()
            await session.save()
        }

        res.status(200).json({
            message: "Report retrieved successfully.",
            session
        })

    } catch (error) {
        console.error("Error getting interview report:", error)
        res.status(500).json({
            message: "Server error fetching report."
        })
    }
}

/**
 * @name downloadMockInterviewPdf
 * @route GET /api/mock-interview/:id/report/pdf
 * @description Generate and download professional PDF evaluation report
 * @access Private
 */
async function downloadMockInterviewPdf(req, res) {
    try {
        const { id } = req.params

        const session = await mockInterviewModel.findOne({
            _id: id,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview not found or unauthorized."
            })
        }

        // Ensure evaluated
        if (!session.finalReport || !session.finalReport.overallScore) {
            let reportContext = null
            if (session.interviewReport) {
                reportContext = await interviewReportModel.findById(session.interviewReport)
            }
            session.finalReport = await evaluateMockInterviewSession({
                sessionDetails: session,
                transcript: session.transcript,
                reportContext
            })
            session.status = "completed"
            session.completedAt = session.completedAt || new Date()
            await session.save()
        }

        const candidate = await userModel.findById(req.user.id)
        const candidateName = candidate?.username || "Candidate"

        const pdfBuffer = await generateMockInterviewPdf({
            mockInterview: session,
            candidateName
        })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=PrepAI_Interview_Report_${session._id}.pdf`
        })

        res.send(pdfBuffer)

    } catch (error) {
        console.error("Error downloading interview PDF:", error)
        res.status(500).json({
            message: "Error generating interview PDF report."
        })
    }
}

module.exports = {
    startMockInterview,
    submitAnswer,
    finishMockInterview,
    getMockInterviewById,
    getAllMockInterviews,
    getMockInterviewReport,
    downloadMockInterviewPdf
}
