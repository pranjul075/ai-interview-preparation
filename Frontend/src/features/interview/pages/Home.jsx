import React, { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router"
import { useInterview } from "../hooks/useInterview"
import { useAuth } from "../../auth/hooks/useAuth"
import { getAllMockInterviews } from "../../mockInterview/services/mockInterview.api"

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [mockInterviews, setMockInterviews] = useState([])
    const [errorMsg, setErrorMsg] = useState(null)

    const fileInputRef = useRef(null)

    useEffect(() => {
        const fetchMockHistory = async () => {
            try {
                const res = await getAllMockInterviews()
                if (res?.interviews) {
                    setMockInterviews(res.interviews)
                }
            } catch (err) {
                console.error("Could not fetch mock interviews:", err)
            }
        }
        fetchMockHistory()
    }, [])

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setErrorMsg(null)
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const loadSample = (type) => {
        if (type === "ai-engineer") {
            setJobDescription(`Role: AI Engineer / ML Infrastructure
Requirements:
- 3+ years experience with Python, PyTorch, and REST API architectures
- Strong foundation in SQL query optimization and database indexing
- Familiarity with containerization (Docker, Kubernetes) and AWS cloud deployments
- Experience building LLM pipelines, RAG systems, and evaluating latency trade-offs
- Proven track record optimizing GPU inference batch sizing and vLLM serving
- Familiarity with LangChain, LlamaIndex, and distributed vector database indexing
- B.S. or equivalent in Computer Science, Software Engineering, or related technical field`)
        } else if (type === "backend-swe") {
            setJobDescription(`Role: Senior Backend Software Engineer (Distributed Systems)
Requirements:
- 5+ years crafting high-throughput microservices using Go, Rust, or Java / Node.js
- Deep knowledge of event streaming topologies (Apache Kafka, RabbitMQ)
- Mastery over PostgreSQL internals, shard keys, and non-blocking I/O
- Solid experience architecting zero-trust gRPC endpoints and observability stacks (Prometheus/Grafana)
- Familiarity with Terraform, CI/CD pipelines, and high-availability multiregion failover`)
        } else if (type === "full-stack") {
            setJobDescription(`Role: Full Stack Engineer (TypeScript / Next.js / Node)
Requirements:
- 4+ years shipping production React, Next.js, and TypeScript codebases
- Proficiency building robust Node.js / Express or NestJS microservices
- Strong CSS architecture skills, Tailwind CSS mastery, and web performance profiling
- Experience integrating database caching (Redis), MongoDB / PostgreSQL
- Familiarity with modern authentication patterns and REST/GraphQL APIs`)
        }
    }

    const handleGenerateReport = async () => {
        setErrorMsg(null)

        if (!jobDescription.trim()) {
            setErrorMsg("Please paste a target Job Description.")
            return
        }

        if (!selectedFile && !selfDescription.trim()) {
            setErrorMsg("Please upload a PDF Resume OR write a Self Description.")
            return
        }

        try {
            const data = await generateReport({
                jobDescription: jobDescription.trim(),
                selfDescription: selfDescription.trim(),
                resumeFile: selectedFile || undefined
            })

            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            } else {
                setErrorMsg("Failed to generate report. Please try again.")
            }
        } catch (error) {
            console.error(error)
            setErrorMsg(error.message || "Server error while generating interview report.")
        }
    }

    const scrollToResume = () => {
        const el = document.getElementById("resume-workspace")
        if (el) el.scrollIntoView({ behavior: "smooth" })
    }

    const scrollToHistory = () => {
        const el = document.getElementById("history-section")
        if (el) el.scrollIntoView({ behavior: "smooth" })
    }

    const charCount = jobDescription.length
    const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0

    return (
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] mx-auto">
            <div className="flex flex-col w-full gap-8">

                {/* ── 1. HERO GREETING & LAUNCHPAD HEADER ── */}
                <section className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 lg:p-10 border border-white/95 shadow-[0_12px_32px_rgba(99,102,241,0.06)]">
                    <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#ff2e63]/12 via-[#f43f5e]/05 to-transparent blur-3xl pointer-events-none" />
                    <div className="absolute left-1/3 -bottom-20 w-60 h-60 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="flex flex-col gap-2 max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200/80 shadow-xs w-fit text-[#e11d48] font-code text-xs uppercase tracking-wider font-semibold">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff2e63] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff2e63]" />
                                </span>
                                <span>Interview Preparation Hub · Ready to Practice</span>
                            </div>

                            <div className="flex flex-col gap-1 mt-1">
                                <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight font-extrabold">
                                    Welcome back{user?.username ? `, ${user.username}` : ""} 👋
                                </h1>
                                <div className="flex items-center gap-2 text-xs font-code text-slate-500 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>Session Ready • Account active</span>
                                </div>
                            </div>

                            <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
                                Choose a dedicated module below to launch your session. Each workspace is tailored for deep practice, skill diagnostics, and real-time interview simulations.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start lg:self-center">
                            <button
                                onClick={scrollToResume}
                                className="px-4 py-2.5 rounded-2xl glass-inner-subtle flex items-center gap-2 font-code text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-xs"
                            >
                                <span className="material-symbols-outlined text-[#e11d48] text-base">flash_on</span>
                                <span>Analyze Resume Below</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── 2. THE 3 HIGH-IMPACT ACTION CARDS ── */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card 1: Resume & Job Analysis */}
                    <div className="glass-card-interactive group rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-white/95">
                        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-rose-500/10 via-pink-500/05 to-transparent blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-[#ff2e63]/10 border border-[#ff2e63]/25 flex items-center justify-center text-[#e11d48] shadow-sm group-hover:bg-[#ff2e63] group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">description</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[#e11d48] font-code text-[11px] uppercase font-semibold">
                                    ATS &amp; Roadmap
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#e11d48] transition-colors font-headline">
                                    Resume &amp; Job Analysis
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Analyze your resume against target job descriptions, calculate skill match scores, and get customized day-wise preparation roadmaps.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ATS Scan
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-rose-500">route</span> Day-wise Roadmap
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-slate-400">check_circle</span> Skill Gap Matrix
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200/70 mt-6 relative z-10">
                            <button
                                onClick={scrollToResume}
                                className="flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white font-semibold text-sm shadow-md shadow-[#ff2e63]/25 hover:shadow-lg hover:shadow-[#ff2e63]/40 border border-white/20 transition-all active:scale-[0.98]"
                            >
                                <span>Go to Resume Workspace</span>
                                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 2: AI Mock Interview */}
                    <div className="glass-card-interactive group rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-white/95 ring-2 ring-[#ff2e63]/20 shadow-[0_12px_36px_rgba(255,46,99,0.08)]">
                        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#ff2e63]/15 via-purple-500/08 to-transparent blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff2e63] to-[#ff6b8b] flex items-center justify-center text-white shadow-md shadow-[#ff2e63]/30 group-hover:scale-105 transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">timer</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-code text-[11px] uppercase font-semibold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live AI Interview
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#ff2e63] transition-colors font-headline">
                                    AI Virtual Interview
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Practice real-time adaptive technical, system design, or behavioral interviews with automated grading and instant interactive feedback.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-[#e11d48]">smart_toy</span> Adaptive AI Questions
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-slate-400">timelapse</span> 10/20/30 Min Sessions
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-amber-500">grade</span> Scorecard &amp; Report
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200/70 mt-6 relative z-10">
                            <Link
                                to="/mock-interview"
                                className="flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white font-semibold text-sm shadow-md shadow-[#ff2e63]/25 hover:shadow-lg hover:shadow-[#ff2e63]/40 border border-white/20 transition-all active:scale-[0.98]"
                            >
                                <span>Launch Virtual Interview</span>
                                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: PrepAI Assistant */}
                    <div className="glass-card-interactive group rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-white/95">
                        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500/10 via-sky-500/05 to-transparent blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-3xl">smart_toy</span>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-code text-[11px] uppercase font-semibold">
                                    24/7 AI Mentor
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors font-headline">
                                    PrepAI Assistant
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Get 24/7 AI mentoring, clarify tricky algorithmic problems, understand architecture trade-offs, and master behavioral frameworks.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-indigo-500">psychology</span> Algo Clarifications
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-slate-400">architecture</span> Trade-offs
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200/70 font-code text-xs text-slate-700 font-medium">
                                    <span className="material-symbols-outlined text-xs text-amber-500">star</span> STAR Framework
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200/70 mt-6 relative z-10">
                            <Link
                                to="/assistant"
                                className="flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 font-semibold text-sm border border-slate-200 hover:border-indigo-300 shadow-sm transition-all active:scale-[0.98]"
                            >
                                <span>Open PrepAI Assistant</span>
                                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform text-indigo-600">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── 3. RESUME & JOB ANALYSIS WORKSPACE (DUAL GRID) ── */}
                <section id="resume-workspace" className="flex flex-col gap-6 pt-4">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-code text-xs text-[#e11d48] tracking-wider uppercase font-semibold">
                            <span className="h-2 w-2 rounded-full bg-[#ff2e63] shadow-[0_0_8px_#ff2e63] animate-pulse" />
                            <span>Cognitive Diagnostic Console</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
                            AI Resume &amp; Job Analysis
                        </h2>
                        <p className="text-sm text-slate-600">
                            Understand how well your profile matches the target role and uncover actionable skill gaps before your interview.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
                            <span className="material-symbols-outlined text-xl text-rose-500">error</span>
                            <div className="flex-1">
                                <p className="font-semibold text-rose-900">Analysis Error</p>
                                <p className="text-rose-700 mt-0.5">{errorMsg}</p>
                            </div>
                            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-700">
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>
                    )}

                    {/* Dual Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                        {/* Left Column: Candidate Source */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-code text-xs uppercase text-slate-500 font-semibold tracking-wider">Candidate Source</span>
                                    <span className="px-2 py-0.5 rounded-md bg-[#ff2e63]/10 border border-[#ff2e63]/25 text-[#e11d48] font-code text-xs font-semibold">RESUME</span>
                                </div>
                                <span className="font-code text-xs text-slate-400 font-medium">STEP 01/02</span>
                            </div>

                            <div className="glass-card flex flex-col gap-4 p-6 rounded-2xl min-h-[460px] justify-between">
                                {/* Dropzone */}
                                {!selectedFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group cursor-pointer p-8 rounded-xl bg-white/60 hover:bg-white/90 border-2 border-dashed border-slate-300 hover:border-[#ff2e63]/50 transition-all flex flex-col items-center justify-center text-center shadow-xs flex-1"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-[#ff2e63]/10 border border-[#ff2e63]/25 text-[#ff2e63] group-hover:scale-105 group-hover:bg-[#ff2e63]/20 transition-all shadow-md shadow-[#ff2e63]/10">
                                            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                        </div>
                                        <p className="text-base text-slate-900 font-semibold mb-1 font-headline">
                                            Drop your resume here, or <span className="text-[#e11d48] underline decoration-[#ff2e63]/40 underline-offset-4 group-hover:text-[#ff2e63]">browse files</span>
                                        </p>
                                        <p className="text-xs text-slate-500 max-w-sm mb-2">
                                            Upload your PDF resume to parse competencies and detect skill gaps.
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 font-code text-xs font-medium shadow-2xs">PDF</span>
                                            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-500 font-code text-xs font-medium shadow-2xs">&lt; 10MB</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 rounded-2xl bg-white/90 border border-emerald-200 shadow-sm flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                                    <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedFile.name}</span>
                                                    <span className="text-xs text-slate-500 font-code">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for Analysis</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={removeFile}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Remove file"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Optional Self Description */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <label htmlFor="selfDesc" className="font-semibold text-slate-700">Self Description (Optional)</label>
                                        <span className="text-slate-400 font-code text-[11px]">SUPPLEMENTAL CONTEXT</span>
                                    </div>
                                    <textarea
                                        id="selfDesc"
                                        rows={3}
                                        placeholder="Add background context, key achievements, or specific target areas..."
                                        value={selfDescription}
                                        onChange={(e) => setSelfDescription(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white/80 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff2e63]/25 focus:border-[#ff2e63] transition-all resize-none shadow-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Benchmark Target */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-code text-xs uppercase text-slate-500 font-semibold tracking-wider">Benchmark Target</span>
                                    <span className="px-2 py-0.5 rounded-md bg-[#ff2e63]/10 border border-[#ff2e63]/25 text-[#e11d48] font-code text-xs font-semibold">JOB SPEC</span>
                                </div>
                                <span className="font-code text-xs text-slate-400 font-medium">STEP 02/02</span>
                            </div>

                            <div className="glass-card flex flex-col rounded-2xl min-h-[460px] overflow-hidden justify-between">
                                {/* Header with presets */}
                                <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-white/70 border-b border-slate-200/80 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-[#ff2e63]">terminal</span>
                                        <span className="font-code text-xs text-slate-800 font-semibold">Paste Job Description</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-code text-[11px] text-slate-500 uppercase mr-1 font-semibold">Presets:</span>
                                        <button
                                            onClick={() => loadSample("ai-engineer")}
                                            type="button"
                                            className="px-2 py-0.5 rounded-md bg-white hover:bg-[#ff2e63] hover:text-white hover:border-[#ff2e63] border border-slate-200 text-slate-700 font-code text-xs transition-all shadow-2xs font-medium"
                                        >
                                            AI Engineer
                                        </button>
                                        <button
                                            onClick={() => loadSample("backend-swe")}
                                            type="button"
                                            className="px-2 py-0.5 rounded-md bg-white hover:bg-[#ff2e63] hover:text-white hover:border-[#ff2e63] border border-slate-200 text-slate-700 font-code text-xs transition-all shadow-2xs font-medium"
                                        >
                                            Backend SWE
                                        </button>
                                        <button
                                            onClick={() => loadSample("full-stack")}
                                            type="button"
                                            className="px-2 py-0.5 rounded-md bg-white hover:bg-[#ff2e63] hover:text-white hover:border-[#ff2e63] border border-slate-200 text-slate-700 font-code text-xs transition-all shadow-2xs font-medium"
                                        >
                                            Full Stack
                                        </button>
                                    </div>
                                </div>

                                {/* Textarea */}
                                <div className="flex flex-1 p-4 bg-white/50 relative">
                                    <textarea
                                        rows={12}
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the target job description or role requirements here (e.g. key responsibilities, required skills, tools)..."
                                        className="w-full bg-transparent font-code text-xs sm:text-sm text-[#1e293b] focus:outline-none resize-none leading-relaxed placeholder-slate-400 selection:bg-[#ff2e63]/20"
                                    />
                                </div>

                                {/* Textarea Footer */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 border-t border-slate-200/80 font-code text-xs text-slate-500">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-800 font-semibold">{charCount.toLocaleString()} characters</span>
                                        <span className="text-slate-300">|</span>
                                        <span>{wordCount.toLocaleString()} words</span>
                                    </div>
                                    <button
                                        onClick={() => setJobDescription("")}
                                        type="button"
                                        className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors font-medium"
                                    >
                                        <span className="material-symbols-outlined text-sm">clear_all</span>
                                        <span>Clear text</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Global Control Bar */}
                    <div className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-code text-slate-500">
                            <span className="text-amber-500">⚡</span>
                            <span>Ready to parse competencies &amp; generate custom roadmap</span>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="relative group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white font-semibold text-sm shadow-lg shadow-[#ff2e63]/25 hover:shadow-[#ff2e63]/40 border border-white/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    <span>Synthesizing Strategy...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-12">auto_awesome</span>
                                    <span>Analyze with AI →</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* ── 4. REAL INTERVIEW HISTORY & PAST REPORTS ── */}
                <section id="history-section" className="flex flex-col gap-6 pt-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-headline">
                            Session History &amp; Reports
                        </h2>
                        <p className="text-sm text-slate-600">
                            Review your past resume analyses and completed mock interview reports.
                        </p>
                    </div>

                    {/* Sub-grid: 2 columns for Resume Reports and Mock Interviews */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Col 1: Past Resume Analyses */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="font-code text-xs uppercase text-slate-600 font-bold tracking-wider">
                                    Resume Analyses ({reports?.length || 0})
                                </span>
                            </div>

                            {reports && reports.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {reports.map((report) => (
                                        <Link
                                            key={report._id}
                                            to={`/interview/${report._id}`}
                                            className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-[#ff2e63]/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-[#ff2e63]/10 border border-[#ff2e63]/25 flex items-center justify-center text-[#ff2e63] flex-shrink-0">
                                                    <span className="material-symbols-outlined text-xl">description</span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-900 truncate font-headline group-hover:text-[#ff2e63] transition-colors">
                                                        {report.title || "Interview Strategy"}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-code">
                                                        {new Date(report.createdAt).toLocaleDateString()} • {report.skillGaps?.length || 0} skill gaps identified
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-base font-bold font-code text-slate-900">
                                                        {report.matchScore ?? "--"}%
                                                    </span>
                                                    <span className="text-[10px] uppercase font-code text-slate-400 font-semibold">Match</span>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                /* Clean Empty State for New Users */
                                <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                                        <span className="material-symbols-outlined text-2xl">description</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">No resume analyses yet</h3>
                                    <p className="text-xs text-slate-500 max-w-xs mb-3">
                                        Upload your resume in the workspace above to calculate your match score and unlock your custom roadmap.
                                    </p>
                                    <button
                                        onClick={scrollToResume}
                                        className="text-xs font-semibold text-[#e11d48] hover:text-[#ff2e63] flex items-center gap-1"
                                    >
                                        <span>Start Analysis</span>
                                        <span className="material-symbols-outlined text-sm">arrow_downward</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Col 2: Past Mock Interviews */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="font-code text-xs uppercase text-slate-600 font-bold tracking-wider">
                                    Mock Interviews ({mockInterviews?.length || 0})
                                </span>
                            </div>

                            {mockInterviews && mockInterviews.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {mockInterviews.map((mock) => {
                                        const isCompleted = mock.status === "completed"
                                        const score = mock.finalReport?.overallScore
                                        return (
                                            <Link
                                                key={mock._id}
                                                to={isCompleted ? `/mock-interview/${mock._id}/report` : `/mock-interview/${mock._id}`}
                                                className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-[#ff2e63]/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                        <span className="material-symbols-outlined text-xl">
                                                            {isCompleted ? "fact_check" : "timer"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-slate-900 truncate font-headline group-hover:text-[#ff2e63] transition-colors">
                                                            {mock.targetRole || "Software Engineer"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-code">
                                                            {new Date(mock.createdAt).toLocaleDateString()} • {mock.duration} Min • {mock.difficulty}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {isCompleted ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-base font-bold font-code text-emerald-600">
                                                                {score != null ? `${score}%` : "Done"}
                                                            </span>
                                                            <span className="text-[10px] uppercase font-code text-slate-400 font-semibold">Grade</span>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-code text-xs font-semibold">
                                                            In Progress
                                                        </span>
                                                    )}
                                                    <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            ) : (
                                /* Clean Empty State for New Users */
                                <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                                        <span className="material-symbols-outlined text-2xl">timer</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">No interviews completed yet</h3>
                                    <p className="text-xs text-slate-500 max-w-xs mb-3">
                                        Practice realistic technical or behavioral questions with dynamic AI feedback.
                                    </p>
                                    <Link
                                        to="/mock-interview"
                                        className="text-xs font-semibold text-[#e11d48] hover:text-[#ff2e63] flex items-center gap-1"
                                    >
                                        <span>Start First Mock Interview</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </main>
    )
}

export default Home