import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router"
import { getMockInterview, submitAnswer, finishMockInterview } from "../services/mockInterview.api"
import "../style/mockInterview.scss"

const MockInterviewSession = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [session, setSession] = useState(null)
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [currentAnswer, setCurrentAnswer] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [evaluating, setEvaluating] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    const timerRef = useRef(null)
    const arenaEndRef = useRef(null)

    // Load initial session
    useEffect(() => {
        let isMounted = true

        const loadSession = async () => {
            try {
                const data = await getMockInterview(id)
                if (isMounted) {
                    setSession(data.session)
                    setSecondsLeft(data.remainingSeconds || 0)

                    // If already completed, redirect directly to report
                    if (data.session.status === "completed") {
                        navigate(`/mock-interview/${id}/report`)
                    }
                }
            } catch (err) {
                console.error("Failed to load interview session:", err)
                if (isMounted) setErrorMsg(err.message || "Failed to load session.")
            }
        }

        loadSession()

        return () => {
            isMounted = false
        }
    }, [id, navigate])

    // Timer countdown
    useEffect(() => {
        if (secondsLeft <= 0) return

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    handleTimeExpired()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [secondsLeft > 0])

    const handleTimeExpired = async () => {
        if (evaluating) return
        setEvaluating(true)
        try {
            await finishMockInterview(id)
            navigate(`/mock-interview/${id}/report`)
        } catch (err) {
            console.error("Error auto-finishing on expiration:", err)
            navigate(`/mock-interview/${id}/report`)
        }
    }

    const handleSubmitAnswer = async () => {
        if (!currentAnswer.trim() || submitting || evaluating) return

        setSubmitting(true)
        setErrorMsg(null)

        try {
            const res = await submitAnswer(id, currentAnswer.trim())
            setCurrentAnswer("")

            if (res.isCompleted) {
                // Auto-concluded by server
                setEvaluating(true)
                navigate(`/mock-interview/${id}/report`)
                return
            }

            // Update session transcript and remaining time
            const updatedData = await getMockInterview(id)
            setSession(updatedData.session)
            if (updatedData.remainingSeconds !== undefined) {
                setSecondsLeft(updatedData.remainingSeconds)
            }

            arenaEndRef.current?.scrollIntoView({ behavior: "smooth" })
        } catch (err) {
            console.error("Error submitting answer:", err)
            setErrorMsg(err.message || "Failed to submit answer. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleConcludeEarly = async () => {
        const confirmEnd = window.confirm("Are you sure you want to conclude the interview early? Your answers will now be evaluated.")
        if (!confirmEnd) return

        setEvaluating(true)
        try {
            await finishMockInterview(id)
            navigate(`/mock-interview/${id}/report`)
        } catch (err) {
            console.error("Error concluding interview:", err)
            setErrorMsg(err.message || "Failed to conclude interview.")
            setEvaluating(false)
        }
    }

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault()
            handleSubmitAnswer()
        }
    }

    const formatTime = (totalSecs) => {
        const mins = Math.floor(totalSecs / 60)
        const secs = totalSecs % 60
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }

    const getTimerClass = () => {
        if (secondsLeft < 120) return "timer--critical"
        if (secondsLeft < 300) return "timer--warning"
        return "timer--normal"
    }

    if (evaluating) {
        return (
            <main className="loading-screen" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
                <h1 style={{ fontSize: "1.8rem", color: "#f8fafc", marginBottom: "0.5rem" }}>Interview Completed</h1>
                <p style={{ color: "#94a3b8", maxWidth: "450px", marginBottom: "1.5rem" }}>
                    PrepAI is synthesizing your full session across 6 evaluation dimensions (Technical, Problem Solving, Communication, Relevance, Depth, Project Experience)...
                </p>
                <div style={{ color: "#e11d48", fontWeight: "600" }}>Generating your comprehensive report...</div>
            </main>
        )
    }

    if (!session) {
        return (
            <main className="loading-screen" style={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h1>Loading mock interview session...</h1>
            </main>
        )
    }

    // Get the latest interviewer question
    const latestInterviewerEntry = [...session.transcript].reverse().find(t => t.role === "interviewer")
    const previousTurns = session.transcript.slice(0, session.transcript.length - 1)

    return (
        <div className="mock-session-page">
            {/* TOP BAR */}
            <div className="session-topbar">
                <div className="role-info">
                    <h2>{session.targetRole}</h2>
                    <div className="badge-row">
                        <span className="session-badge">{session.interviewType}</span>
                        <span className="session-badge">{session.difficulty}</span>
                        <span className="session-badge">{session.duration} min</span>
                    </div>
                </div>

                <div className="timer-container">
                    <div className={`countdown-timer ${getTimerClass()}`}>
                        <span>⏱</span>
                        <span>{formatTime(secondsLeft)}</span>
                    </div>

                    <button
                        type="button"
                        className="conclude-btn"
                        onClick={handleConcludeEarly}
                    >
                        Conclude Interview
                    </button>
                </div>
            </div>

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

            {/* ARENA */}
            <main className="interview-arena">
                {/* PREVIOUS CONVERSATION HISTORY (COLLAPSIBLE / CONDENSED) */}
                {previousTurns.length > 0 && (
                    <div style={{ opacity: 0.85, marginBottom: "0.5rem" }}>
                        <details style={{ background: "#13151f", border: "1px solid #282f42", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
                            <summary style={{ color: "#94a3b8", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                                View Earlier Interview Dialogue ({previousTurns.length} turns)
                            </summary>
                            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {previousTurns.map((turn, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: "0.75rem",
                                            borderRadius: "0.5rem",
                                            background: turn.role === "interviewer" ? "#181b26" : "#202636",
                                            borderLeft: turn.role === "interviewer" ? "3px solid #e11d48" : "3px solid #38bdf8",
                                            fontSize: "0.9rem",
                                            lineHeight: 1.5
                                        }}
                                    >
                                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", marginBottom: "0.25rem", textTransform: "uppercase" }}>
                                            {turn.role === "interviewer" ? "Interviewer" : "Your Answer"}
                                        </div>
                                        <div style={{ color: "#e2e8f0", whiteSpace: "pre-wrap" }}>
                                            {turn.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}

                {/* CURRENT INTERVIEWER QUESTION */}
                {latestInterviewerEntry && (
                    <div className="interviewer-card">
                        <div className="interviewer-avatar">AI</div>
                        <div className="interviewer-content">
                            <div className="interviewer-meta">
                                <span>Interviewer &bull; Topic: {latestInterviewerEntry.topic || "Discussion"}</span>
                                <span>{latestInterviewerEntry.questionType || "Question"}</span>
                            </div>
                            <div className="interviewer-text">
                                {latestInterviewerEntry.text}
                            </div>
                        </div>
                    </div>
                )}

                {/* CANDIDATE ANSWER INPUT */}
                <div className="candidate-card">
                    <div className="candidate-header">
                        <span>Your Answer</span>
                        <span>{currentAnswer.length} characters &bull; {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                    </div>

                    <textarea
                        placeholder="Type your structured answer here... (Tip: Mention practical examples, architectural trade-offs, and your thought process)"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={submitting || evaluating}
                    />

                    <div className="candidate-footer">
                        <span className="tip-text">
                            Press <strong>Ctrl + Enter</strong> (or Cmd + Enter) to submit answer
                        </span>

                        <button
                            type="button"
                            className="submit-btn"
                            onClick={handleSubmitAnswer}
                            disabled={submitting || evaluating || !currentAnswer.trim()}
                        >
                            {submitting ? "Analyzing & Generating Follow-up..." : "Submit Answer"}
                        </button>
                    </div>
                </div>

                <div ref={arenaEndRef} />
            </main>
        </div>
    )
}

export default MockInterviewSession
