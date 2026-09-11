import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router"
import { getMockInterviewReport, downloadMockInterviewPdf } from "../services/mockInterview.api"

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
            <main className="w-full flex-1 flex flex-col items-center justify-center py-20 px-4">
                <span className="material-symbols-outlined text-4xl text-[#ff2e63] animate-spin mb-4">progress_activity</span>
                <h1 className="text-xl font-bold text-slate-800 font-headline">Synthesizing your interview evaluation...</h1>
                <p className="text-xs text-slate-500 mt-1">Evaluating transcript across 6 core performance dimensions.</p>
            </main>
        )
    }

    if (errorMsg || !session?.finalReport) {
        return (
            <main className="max-w-xl mx-auto my-16 text-center p-8 glass-card rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-2xl">error</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-headline mb-1">Unable to load evaluation report</h2>
                <p className="text-xs text-slate-500 mb-6">{errorMsg || "The report for this interview could not be found."}</p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] text-white font-semibold text-xs shadow-md shadow-[#ff2e63]/25"
                >
                    Return to Dashboard
                </Link>
            </main>
        )
    }

    const report = session.finalReport
    const dateFormatted = new Date(session.completedAt || session.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    const readiness = report.interviewReadiness || "Developing"
    const readinessBadgeColor = readiness.toLowerCase().includes("ready")
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : readiness.toLowerCase().includes("almost")
        ? "bg-sky-50 border-sky-200 text-sky-700"
        : readiness.toLowerCase().includes("developing")
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : "bg-rose-50 border-rose-200 text-rose-700"

    const dimensions = [
        { label: "Technical Knowledge", score: report.technicalScore || 0 },
        { label: "Problem Solving", score: report.problemSolvingScore || 0 },
        { label: "Communication Clarity", score: report.communicationScore || 0 },
        { label: "Answer Relevance", score: report.relevanceScore || 0 },
        { label: "Depth & Trade-offs", score: report.depthScore || 0 },
        { label: "Project Experience", score: report.projectKnowledgeScore || 0 }
    ]

    return (
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1200px] mx-auto">
            <div className="flex flex-col w-full gap-8">

                {/* ── TOP HEADER & ACTIONS ── */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 font-code text-xs text-slate-500">
                            <Link to="/" className="hover:text-slate-800 transition-colors">DASHBOARD</Link>
                            <span>/</span>
                            <span className="text-[#e11d48] font-semibold">MOCK INTERVIEW EVALUATION</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
                            PrepAI <span className="text-[#ff2e63]">Interview Report</span>
                        </h1>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-code flex-wrap">
                            <span className="font-bold text-slate-800">{session.targetRole}</span>
                            <span>•</span>
                            <span className="uppercase font-semibold text-[#e11d48]">{session.interviewType || "Mixed"}</span>
                            <span>•</span>
                            <span>{session.duration} min session</span>
                            <span>•</span>
                            <span>{dateFormatted}</span>
                        </div>
                    </div>

                    {/* Action buttons (Clean, no black spots, proper spacing) */}
                    <div className="flex items-center gap-3 flex-wrap self-start lg:self-center">
                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white font-semibold text-xs shadow-md shadow-[#ff2e63]/25 hover:shadow-[#ff2e63]/40 border border-white/20 transition-all disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-base">download</span>
                            <span>{downloading ? "Generating PDF..." : "Download PDF Report"}</span>
                        </button>

                        <Link
                            to="/mock-interview"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs shadow-xs transition-all"
                        >
                            <span className="material-symbols-outlined text-base text-[#ff2e63]">add</span>
                            <span>New Interview</span>
                        </Link>

                        <Link
                            to="/"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs shadow-xs transition-all"
                        >
                            <span>Dashboard</span>
                        </Link>
                    </div>
                </div>

                {/* ── OVERALL SCORE HERO CARD ── */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/95 shadow-md">
                    <div className="flex items-center gap-6">
                        {/* Big Score Circle */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#ff2e63] to-[#e11d48] flex flex-col items-center justify-center text-white shadow-lg shadow-[#ff2e63]/30 flex-shrink-0">
                            <span className="text-3xl sm:text-4xl font-extrabold font-code leading-none">
                                {report.overallScore || 0}
                            </span>
                            <span className="text-[11px] font-code uppercase font-semibold opacity-90 mt-0.5">
                                / 100
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-headline">
                                Overall Performance Score
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                                Aggregated evaluation across technical depth, problem-solving, communication clarity, and answer relevance.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-1.5">
                        <span className="font-code text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                            INTERVIEW READINESS
                        </span>
                        <div className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold font-code shadow-2xs ${readinessBadgeColor}`}>
                            {readiness}
                        </div>
                    </div>
                </div>

                {/* ── PERFORMANCE DIMENSIONS BREAKDOWN ── */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold font-code text-slate-700 uppercase tracking-wider">
                        Core Competency Matrix
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dimensions.map((dim, idx) => {
                            const barColor = dim.score >= 80 ? "bg-emerald-500" : dim.score >= 65 ? "bg-[#ff2e63]" : "bg-amber-500"
                            return (
                                <div key={idx} className="glass-card rounded-2xl p-4 flex flex-col gap-2.5 shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-700">{dim.label}</span>
                                        <span className="font-code text-xs font-bold text-slate-900">{dim.score} / 100</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/70">
                                        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${dim.score}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── EXECUTIVE ASSESSMENT ── */}
                {report.overallAssessment && (
                    <div className="glass-card rounded-2xl p-6 flex flex-col gap-2 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-[#ff2e63]">psychology</span>
                            <h2 className="text-sm font-bold font-code uppercase text-slate-800 tracking-wider">
                                Executive Performance Assessment
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                            {report.overallAssessment}
                        </p>
                    </div>
                )}

                {/* ── STRENGTHS & WEAKNESSES ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</span>
                            <h3 className="text-sm font-bold font-code uppercase text-emerald-700 tracking-wider">
                                Demonstrated Strengths
                            </h3>
                        </div>
                        <ul className="space-y-2 mt-1">
                            {(report.strengths || []).map((str, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span className="leading-relaxed">{str}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">⚠️</span>
                            <h3 className="text-sm font-bold font-code uppercase text-amber-700 tracking-wider">
                                Areas for Improvement
                            </h3>
                        </div>
                        <ul className="space-y-2 mt-1">
                            {(report.weaknesses || []).map((weak, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span className="leading-relaxed">{weak}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── TOPICS REQUIRING REINFORCEMENT ── */}
                {report.weakTopics && report.weakTopics.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-rose-500">menu_book</span>
                            <h2 className="text-sm font-bold font-code uppercase text-slate-800 tracking-wider">
                                Topics Requiring Reinforcement
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {report.weakTopics.map((topic, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-code text-xs font-semibold">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── RECOMMENDED PREPARATION STEPS ── */}
                {report.recommendations && report.recommendations.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-[#ff2e63]">rocket_launch</span>
                            <h2 className="text-sm font-bold font-code uppercase text-slate-800 tracking-wider">
                                Recommended Action Steps
                            </h2>
                        </div>
                        <ul className="space-y-2.5 mt-1">
                            {report.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                                    <span className="w-5 h-5 rounded-md bg-[#ff2e63]/10 text-[#ff2e63] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <span className="leading-relaxed">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── FULL DIALOGUE TRANSCRIPT ── */}
                {session.transcript && session.transcript.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 shadow-xs">
                        <details className="group">
                            <summary className="list-none flex items-center justify-between cursor-pointer font-bold text-sm text-slate-900 font-headline">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-[#ff2e63]">forum</span>
                                    <span>View Complete Interview Transcript ({session.transcript.length} turns)</span>
                                </span>
                                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                                    expand_more
                                </span>
                            </summary>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                                {session.transcript.map((turn, idx) => {
                                    const isInterviewer = turn.role === "interviewer"
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-2xl border ${
                                                isInterviewer
                                                    ? "bg-slate-50/80 border-slate-200/80 border-l-4 border-l-[#ff2e63]"
                                                    : "bg-white border-slate-200 border-l-4 border-l-sky-500"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-[10px] font-code font-bold uppercase mb-1.5">
                                                <span className={isInterviewer ? "text-[#ff2e63]" : "text-sky-600"}>
                                                    {isInterviewer ? `Interviewer (${turn.topic || "Question"})` : "Candidate"}
                                                </span>
                                                <span className="text-slate-400">
                                                    {new Date(turn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                                {turn.text}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </details>
                    </div>
                )}

            </div>
        </main>
    )
}

export default MockInterviewReport
