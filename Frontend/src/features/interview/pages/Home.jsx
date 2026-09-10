import React, { useState, useRef, useEffect } from "react"
import "../style/home.scss"
import { useInterview } from "../hooks/useInterview"
import { useNavigate, Link } from "react-router"
import { getAllMockInterviews } from "../../mockInterview/services/mockInterview.api"

const Home = () => {
    const { loading, generateReport, reports } = useInterview()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeName, setResumeName] = useState("")
    const [mockInterviews, setMockInterviews] = useState([])
    const [errorMsg, setErrorMsg] = useState(null)

    const resumeInputRef = useRef()
    const formRef = useRef()
    const navigate = useNavigate()

    // Fetch mock interview history
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

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]
        setErrorMsg(null)

        // Validation
        if (!jobDescription.trim()) {
            setErrorMsg("Please paste a target Job Description.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            setErrorMsg("Please upload a PDF Resume OR write a Self Description.")
            return
        }

        try {
            const data = await generateReport({
                jobDescription: jobDescription.trim(),
                selfDescription: selfDescription.trim(),
                resumeFile
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

    if (loading) {
        return (
            <main className="loading-screen" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
                <h1>Generating your AI interview strategy...</h1>
                <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>Analyzing job description, mapping skill gaps, and generating questions...</p>
            </main>
        )
    }

    // Calculate real performance improvement if user has 2+ completed mock interviews
    const completedMocks = mockInterviews.filter(m => m.status === "completed" && m.finalReport?.overallScore)
    let performanceComp = null
    if (completedMocks.length >= 2) {
        // latest is completedMocks[0], prior is completedMocks[1]
        const latest = completedMocks[0].finalReport
        const prior = completedMocks[1].finalReport
        const overallDelta = (latest.overallScore || 0) - (prior.overallScore || 0)
        const techDelta = (latest.technicalScore || 0) - (prior.technicalScore || 0)
        const commDelta = (latest.communicationScore || 0) - (prior.communicationScore || 0)

        performanceComp = {
            latestRole: completedMocks[0].targetRole,
            overall: { before: prior.overallScore || 0, now: latest.overallScore || 0, delta: overallDelta },
            technical: { before: prior.technicalScore || 0, now: latest.technicalScore || 0, delta: techDelta },
            communication: { before: prior.communicationScore || 0, now: latest.communicationScore || 0, delta: commDelta }
        }
    }

    return (
        <div className="home-page">
            {/* HERO HEADER */}
            <header className="page-header">
                <h1>
                    AI-Powered <span className="highlight">Interview Preparation</span> Platform
                </h1>
                <p>
                    Analyze job descriptions against your resume, master technical doubts, and practice with real-time adaptive AI mock interviews.
                </p>
            </header>

            {/* DASHBOARD FEATURE ACTION CARDS */}
            <div className="dashboard-actions">
                <div
                    className="action-card action-card--highlight"
                    onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                >
                    <div className="action-card__icon">📄</div>
                    <div className="action-card__title">Resume & JD Analysis</div>
                    <div className="action-card__desc">
                        Identify skill gaps, calculate job match score, and generate a day-wise prep plan.
                    </div>
                    <div className="action-card__cta">Analyze Profile &rarr;</div>
                </div>

                <Link to="/assistant" className="action-card">
                    <div className="action-card__icon">💬</div>
                    <div className="action-card__title">PrepAI Assistant</div>
                    <div className="action-card__desc">
                        Clarify technical concepts, system design trade-offs, and behavioral answer frameworks.
                    </div>
                    <div className="action-card__cta">Ask AI Mentor &rarr;</div>
                </Link>

                <Link to="/mock-interview" className="action-card">
                    <div className="action-card__icon">🎯</div>
                    <div className="action-card__title">AI Mock Interview</div>
                    <div className="action-card__desc">
                        Simulate a live 10, 20, or 30-minute interview with adaptive AI questioning and comprehensive grading.
                    </div>
                    <div className="action-card__cta">Start Simulation &rarr;</div>
                </Link>
            </div>

            {/* PERFORMANCE IMPROVEMENT COMPARISON (If available) */}
            {performanceComp && (
                <section className="performance-widget">
                    <div className="widget-header">
                        <h3>📈 Performance Growth Trend</h3>
                        <span className="sub-tag">Verified Progress</span>
                    </div>
                    <div className="metrics-row">
                        <div className="comp-item">
                            <div className="comp-label">Overall Interview Score</div>
                            <div className="comp-values">
                                <span className="val-before">{performanceComp.overall.before}</span>
                                <span className="val-arrow">&rarr;</span>
                                <span className="val-now">{performanceComp.overall.now}</span>
                                <span className={`val-delta ${performanceComp.overall.delta >= 0 ? "val-delta--pos" : "val-delta--neg"}`}>
                                    {performanceComp.overall.delta >= 0 ? `+${performanceComp.overall.delta}` : performanceComp.overall.delta}
                                </span>
                            </div>
                        </div>

                        <div className="comp-item">
                            <div className="comp-label">Technical Knowledge</div>
                            <div className="comp-values">
                                <span className="val-before">{performanceComp.technical.before}</span>
                                <span className="val-arrow">&rarr;</span>
                                <span className="val-now">{performanceComp.technical.now}</span>
                                <span className={`val-delta ${performanceComp.technical.delta >= 0 ? "val-delta--pos" : "val-delta--neg"}`}>
                                    {performanceComp.technical.delta >= 0 ? `+${performanceComp.technical.delta}` : performanceComp.technical.delta}
                                </span>
                            </div>
                        </div>

                        <div className="comp-item">
                            <div className="comp-label">Communication Clarity</div>
                            <div className="comp-values">
                                <span className="val-before">{performanceComp.communication.before}</span>
                                <span className="val-arrow">&rarr;</span>
                                <span className="val-now">{performanceComp.communication.now}</span>
                                <span className={`val-delta ${performanceComp.communication.delta >= 0 ? "val-delta--pos" : "val-delta--neg"}`}>
                                    {performanceComp.communication.delta >= 0 ? `+${performanceComp.communication.delta}` : performanceComp.communication.delta}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ERROR NOTIFICATION BANNER */}
            {errorMsg && (
                <div style={{
                    width: "100%",
                    maxWidth: "900px",
                    background: "rgba(225, 29, 72, 0.15)",
                    border: "1px solid #e11d48",
                    color: "#fda4af",
                    padding: "0.85rem 1.25rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.95rem"
                }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* RESUME / JD ANALYSIS CARD */}
            <div className="interview-card" ref={formRef}>
                <div className="interview-card__body">
                    {/* LEFT PANEL */}
                    <div className="panel panel--left">
                        <div className="panel__header">
                            <h2>Target Job Description</h2>
                        </div>
                        <textarea
                            className="panel__textarea"
                            placeholder="Paste the full job description here (responsibilities, required skills, tech stack)..."
                            value={jobDescription}
                            onChange={(e) => {
                                setJobDescription(e.target.value)
                                if (errorMsg) setErrorMsg(null)
                            }}
                        />
                    </div>

                    {/* DIVIDER */}
                    <div className="panel-divider" />

                    {/* RIGHT PANEL */}
                    <div className="panel panel--right">
                        <div className="panel__header">
                            <h2>Your Profile</h2>
                        </div>

                        {/* RESUME UPLOAD (PDF ONLY) */}
                        <div className="upload-section">
                            <label className="section-label">
                                Upload Resume
                            </label>

                            <label className="dropzone" htmlFor="resume">
                                <p className="dropzone__title">
                                    Click to upload or drag & drop
                                </p>
                                <p className="dropzone__subtitle">
                                    PDF Only (Max 5MB)
                                </p>
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type="file"
                                    id="resume"
                                    name="resume"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            if (!file.name.toLowerCase().endsWith(".pdf")) {
                                                setErrorMsg("Please upload a PDF format resume.")
                                                return
                                            }
                                            setResumeName(file.name)
                                            if (errorMsg) setErrorMsg(null)
                                        }
                                    }}
                                />
                                {resumeName && (
                                    <p style={{ marginTop: "10px", color: "#34d399", fontWeight: "600" }}>
                                        ✓ Ready: {resumeName}
                                    </p>
                                )}
                            </label>
                        </div>

                        {/* OR */}
                        <div className="or-divider">
                            <span>OR</span>
                        </div>

                        {/* SELF DESCRIPTION */}
                        <div className="self-description">
                            <label className="section-label">
                                Quick Self Description
                            </label>
                            <textarea
                                className="panel__textarea panel__textarea--short"
                                placeholder="Write about your technical stack, projects, and years of experience..."
                                value={selfDescription}
                                onChange={(e) => {
                                    setSelfDescription(e.target.value)
                                    if (errorMsg) setErrorMsg(null)
                                }}
                            />
                        </div>

                        <div className="info-box">
                            <p>
                                Either a <strong>PDF Resume</strong> or <strong>Self Description</strong> is required.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="interview-card__footer">
                    <span className="footer-info">
                        ⚡ Powered by Groq AI Reasoning Engine
                    </span>
                    <button
                        onClick={handleGenerateReport}
                        className="generate-btn"
                    >
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* MOCK INTERVIEW HISTORY */}
            {mockInterviews && mockInterviews.length > 0 && (
                <section className="recent-reports">
                    <h2>My Mock Interview Sessions</h2>
                    <div className="reports-list">
                        {mockInterviews.map((mock) => (
                            <div
                                key={mock._id}
                                className="report-item"
                                onClick={() => {
                                    if (mock.status === "completed") {
                                        navigate(`/mock-interview/${mock._id}/report`)
                                    } else {
                                        navigate(`/mock-interview/${mock._id}`)
                                    }
                                }}
                            >
                                <h3>{mock.targetRole || "Software Engineer"}</h3>
                                <p className="report-meta">
                                    {new Date(mock.createdAt).toLocaleDateString()} &bull; {mock.duration} min &bull; {mock.interviewType}
                                </p>
                                <div className="mock-meta-row">
                                    <span className="mock-score">
                                        Score: {mock.finalReport?.overallScore ? `${mock.finalReport.overallScore}/100` : (mock.status === "in_progress" ? "In Progress" : "Completed")}
                                    </span>
                                    {mock.finalReport?.interviewReadiness && (
                                        <span className="mock-readiness">
                                            {mock.finalReport.interviewReadiness}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* RECENT INTERVIEW REPORTS */}
            {reports && reports.length > 0 && (
                <section className="recent-reports">
                    <h2>My Recent Interview Plans</h2>
                    <ul className="reports-list">
                        {reports.map((report) => (
                            <li
                                key={report._id}
                                className="report-item"
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >
                                <h3>{report.title || "Untitled Position"}</h3>
                                <p className="report-meta">
                                    Generated on {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                                <p className="match-score">
                                    Match Score: {report.matchScore}%
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* FOOTER */}
            <footer className="page-footer">
                <a href="#terms">Privacy & Security</a>
                <a href="#terms">Terms of Service</a>
                <Link to="/assistant">PrepAI Assistant</Link>
                <Link to="/mock-interview">Mock Interview</Link>
            </footer>
        </div>
    )
}

export default Home