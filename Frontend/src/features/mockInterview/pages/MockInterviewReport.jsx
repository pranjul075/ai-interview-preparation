import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router"
import { getMockInterviewReport, downloadMockInterviewPdf } from "../services/mockInterview.api"
import "../style/mockInterview.scss"

const MockInterviewReport = () => {
    const { id } = useParams()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        let isMounted = true

        const fetchReport = async () => {
            try {
                const data = await getMockInterviewReport(id)
                if (isMounted) {
                    setSession(data.session)
                }
            } catch (err) {
                console.error("Error fetching report:", err)
                if (isMounted) setErrorMsg(err.message || "Failed to load report.")
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchReport()

        return () => {
            isMounted = false
        }
    }, [id])

    const handleDownloadPdf = async () => {
        setDownloading(true)
        try {
            await downloadMockInterviewPdf(id)
        } catch (err) {
            alert(err.message || "Could not download PDF. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <main className="loading-screen" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <h1>Synthesizing your interview evaluation...</h1>
                <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>Evaluating complete transcript across 6 performance dimensions...</p>
            </main>
        )
    }

    if (errorMsg || !session?.finalReport) {
        return (
            <main style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
                <h2>Unable to load evaluation report</h2>
                <p style={{ color: "#94a3b8", margin: "1rem 0" }}>{errorMsg || "The report for this interview could not be found."}</p>
                <Link to="/" className="button primary-button">Return to Dashboard</Link>
            </main>
        )
    }

    const report = session.finalReport
    const dateFormatted = new Date(session.completedAt || session.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    const readinessClass = (report.interviewReadiness || "").toLowerCase().includes("ready")
        ? "readiness-badge--ready"
        : (report.interviewReadiness || "").toLowerCase().includes("developing")
            ? "readiness-badge--developing"
            : "readiness-badge--critical"

    const dimensions = [
        { label: "Technical Knowledge", score: report.technicalScore || 0 },
        { label: "Problem Solving", score: report.problemSolvingScore || 0 },
        { label: "Communication Clarity", score: report.communicationScore || 0 },
        { label: "Answer Relevance", score: report.relevanceScore || 0 },
        { label: "Depth & Trade-offs", score: report.depthScore || 0 },
        { label: "Project Experience", score: report.projectKnowledgeScore || 0 }
    ]

    return (
        <div className="mock-report-page">
            {/* TOP HEADER & ACTIONS */}
            <div className="report-top">
                <div className="title-group">
                    <h1>PrepAI <span className="highlight">Interview Report</span></h1>
                    <p>
                        {session.targetRole} &bull; {(session.interviewType || "Mixed").toUpperCase()} &bull; {session.duration} min &bull; {dateFormatted}
                    </p>
                </div>

                <div className="action-group">
                    <button
                        className="pdf-download-btn"
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>{downloading ? "Generating PDF..." : "Download PDF Report"}</span>
                    </button>

                    <Link to="/mock-interview" className="dash-btn" style={{ background: "#202636" }}>
                        New Interview
                    </Link>

                    <Link to="/" className="dash-btn">
                        Dashboard
                    </Link>
                </div>
            </div>

            {/* OVERALL SCORE HERO */}
            <div className="score-hero">
                <div className="score-box">
                    <div className="score-circle-lg">
                        <span className="val">{report.overallScore || 0}</span>
                        <span className="unit">/ 100</span>
                    </div>
                    <div className="score-details">
                        <h3>Overall Performance Score</h3>
                        <p>Aggregated across technical accuracy, communication, depth, and relevance</p>
                    </div>
                </div>

                <div className={`readiness-badge ${readinessClass}`}>
                    {report.interviewReadiness || "Developing"}
                </div>
            </div>

            {/* PERFORMANCE DIMENSIONS BREAKDOWN */}
            <div className="radar-grid">
                {dimensions.map((dim, idx) => {
                    const fillClass = dim.score >= 80 ? "fill--high" : dim.score >= 65 ? "fill--mid" : "fill--low"
                    return (
                        <div key={idx} className="metric-card">
                            <div className="metric-header">
                                <span className="label">{dim.label}</span>
                                <span className="score-num">{dim.score} / 100</span>
                            </div>
                            <div className="metric-bar">
                                <div className={`fill ${fillClass}`} style={{ width: `${dim.score}%` }} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* EXECUTIVE PERFORMANCE ASSESSMENT */}
            <div className="report-card">
                <h2>
                    <span>🎯</span> Executive Performance Assessment
                </h2>
                <p className="assessment-text">
                    {report.overallAssessment}
                </p>
            </div>

            {/* STRENGTHS & WEAKNESSES */}
            <div className="report-card">
                <div className="columns-2">
                    <div className="strengths-box">
                        <h3>✓ Demonstrated Strengths</h3>
                        <ul>
                            {(report.strengths || []).map((str, idx) => (
                                <li key={idx}>{str}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="weaknesses-box">
                        <h3>⚠️ Areas for Improvement</h3>
                        <ul>
                            {(report.weaknesses || []).map((weak, idx) => (
                                <li key={idx}>{weak}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* TOPICS REQUIRING REINFORCEMENT */}
            {report.weakTopics && report.weakTopics.length > 0 && (
                <div className="report-card">
                    <h2>
                        <span>📚</span> Topics Requiring Reinforcement
                    </h2>
                    <div className="topics-tags">
                        {report.weakTopics.map((topic, idx) => (
                            <span key={idx} className="topic-pill">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIONABLE RECOMMENDATIONS */}
            {report.recommendations && report.recommendations.length > 0 && (
                <div className="report-card">
                    <h2>
                        <span>🚀</span> Recommended Preparation Steps
                    </h2>
                    <ul className="recs-list">
                        {report.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* FULL DIALOGUE TRANSCRIPT */}
            {session.transcript && session.transcript.length > 0 && (
                <div className="report-card">
                    <details>
                        <summary style={{ cursor: "pointer", fontWeight: "700", color: "#38bdf8", fontSize: "1rem" }}>
                            View Full Interview Transcript ({session.transcript.length} turns)
                        </summary>
                        <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {session.transcript.map((turn, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: "1rem",
                                        borderRadius: "0.6rem",
                                        background: turn.role === "interviewer" ? "#13151f" : "#202636",
                                        borderLeft: turn.role === "interviewer" ? "3px solid #e11d48" : "3px solid #38bdf8",
                                        fontSize: "0.92rem",
                                        lineHeight: 1.6
                                    }}
                                >
                                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "800", marginBottom: "0.3rem", textTransform: "uppercase" }}>
                                        {turn.role === "interviewer" ? `Interviewer (Q: ${turn.topic || "Discussion"})` : "Candidate"}
                                    </div>
                                    <div style={{ color: "#f8fafc", whiteSpace: "pre-wrap" }}>
                                        {turn.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            )}
        </div>
    )
}

export default MockInterviewReport
