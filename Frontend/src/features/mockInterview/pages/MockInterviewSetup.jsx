import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { startMockInterview } from "../services/mockInterview.api"
import { getAllInterviewReports } from "../../interview/services/interview.api"
import "../style/mockInterview.scss"

const DURATIONS = [
    { value: 10, label: "10 Min", sub: "Quick Practice" },
    { value: 20, label: "20 Min", sub: "Standard Session" },
    { value: 30, label: "30 Min", sub: "Full In-depth" }
]

const INTERVIEW_TYPES = [
    { value: "mixed", label: "Mixed", sub: "Technical + HR (Recommended)" },
    { value: "technical", label: "Technical", sub: "Code & Architecture" },
    { value: "hr", label: "HR / Behavioral", sub: "STAR & Culture fit" },
    { value: "job_specific", label: "Job Specific", sub: "Grounded in JD" }
]

const DIFFICULTIES = [
    { value: "adaptive", label: "Adaptive", sub: "Dynamically adjusts (Recommended)" },
    { value: "easy", label: "Easy", sub: "Fundamental concepts" },
    { value: "medium", label: "Medium", sub: "Standard engineering" },
    { value: "hard", label: "Hard", sub: "Rigorous deep-dives" }
]

const MockInterviewSetup = () => {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [selectedReportId, setSelectedReportId] = useState("")
    const [customRole, setCustomRole] = useState("Full Stack Developer")
    const [duration, setDuration] = useState(20)
    const [interviewType, setInterviewType] = useState("mixed")
    const [difficulty, setDifficulty] = useState("adaptive")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await getAllInterviewReports()
                if (res?.interviewReports?.length) {
                    setReports(res.interviewReports)
                    setSelectedReportId(res.interviewReports[0]._id)
                    setCustomRole(res.interviewReports[0].title || "Software Engineer")
                }
            } catch (err) {
                console.error("Error fetching reports:", err)
            }
        }
        fetchReports()
    }, [])

    const handleReportChange = (reportId) => {
        setSelectedReportId(reportId)
        if (reportId) {
            const found = reports.find(r => r._id === reportId)
            if (found?.title) setCustomRole(found.title)
        }
    }

    const handleStart = async () => {
        setLoading(true)
        setErrorMsg(null)

        try {
            const data = await startMockInterview({
                interviewReportId: selectedReportId || undefined,
                targetRole: customRole.trim() || "Software Engineer",
                interviewType,
                duration,
                difficulty
            })

            if (data?.session?._id) {
                navigate(`/mock-interview/${data.session._id}`)
            } else {
                setErrorMsg("Failed to start session. Please try again.")
            }
        } catch (err) {
            console.error(err)
            setErrorMsg(err.message || "Failed to start mock interview. Check your network or GROQ_API_KEY.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mock-setup-page">
            <header className="setup-header">
                <h1>PrepAI <span className="highlight">Mock Interview</span></h1>
                <p>Simulate a realistic interview session tailored to your resume, target role, and detected skill gaps.</p>
            </header>

            <div className="setup-card">
                {errorMsg && (
                    <div style={{
                        background: "rgba(225, 29, 72, 0.15)",
                        border: "1px solid #e11d48",
                        color: "#fda4af",
                        padding: "0.85rem 1.2rem",
                        borderRadius: "0.6rem",
                        marginBottom: "1.5rem",
                        fontSize: "0.92rem"
                    }}>
                        {errorMsg}
                    </div>
                )}

                {/* Report Context Selection */}
                <div className="form-section">
                    <label className="section-title">Base On Interview Plan (Recommended)</label>
                    <select
                        className="select-input"
                        value={selectedReportId}
                        onChange={(e) => handleReportChange(e.target.value)}
                    >
                        {reports.length > 0 ? (
                            reports.map((r) => (
                                <option key={r._id} value={r._id}>
                                    {r.title} — Match Score: {r.matchScore}% ({new Date(r.createdAt).toLocaleDateString()})
                                </option>
                            ))
                        ) : (
                            <option value="">No previous plans found (Using manual role)</option>
                        )}
                        <option value="">Custom Role / Standalone Practice</option>
                    </select>
                </div>

                {/* Target Role */}
                <div className="form-section">
                    <label className="section-title">Target Job Title / Role</label>
                    <input
                        type="text"
                        className="text-input"
                        placeholder="e.g. Backend Engineer, Full Stack Developer, Data Scientist"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        required
                    />
                </div>

                {/* Duration */}
                <div className="form-section">
                    <label className="section-title">Interview Duration</label>
                    <div className="options-grid">
                        {DURATIONS.map((d) => (
                            <button
                                key={d.value}
                                type="button"
                                className={`option-btn ${duration === d.value ? "option-btn--selected" : ""}`}
                                onClick={() => setDuration(d.value)}
                            >
                                <div style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>{d.label}</div>
                                <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>{d.sub}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interview Type */}
                <div className="form-section">
                    <label className="section-title">Interview Focus Type</label>
                    <div className="options-grid">
                        {INTERVIEW_TYPES.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                className={`option-btn ${interviewType === t.value ? "option-btn--selected" : ""}`}
                                onClick={() => setInterviewType(t.value)}
                            >
                                <div style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>{t.label}</div>
                                <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>{t.sub}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="form-section">
                    <label className="section-title">Interview Rigor / Difficulty</label>
                    <div className="options-grid">
                        {DIFFICULTIES.map((diff) => (
                            <button
                                key={diff.value}
                                type="button"
                                className={`option-btn ${difficulty === diff.value ? "option-btn--selected" : ""}`}
                                onClick={() => setDifficulty(diff.value)}
                            >
                                <div style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>{diff.label}</div>
                                <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>{diff.sub}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <div className="start-action">
                    <button
                        className="start-btn"
                        onClick={handleStart}
                        disabled={loading}
                    >
                        {loading ? "Initializing AI Interviewer & Session..." : "Start Mock Interview"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MockInterviewSetup
