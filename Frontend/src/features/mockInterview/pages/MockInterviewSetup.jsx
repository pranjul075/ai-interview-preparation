import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router"
import { startMockInterview } from "../services/mockInterview.api"
import { getAllInterviewReports } from "../../interview/services/interview.api"

const DURATIONS = [
    { value: 10, label: "10 Min", sub: "Quick Practice" },
    { value: 20, label: "20 Min", sub: "Standard Session" },
    { value: 30, label: "30 Min", sub: "Full In-depth" }
]

const FOCUS_TYPES = [
    { value: "mixed", label: "Mixed", sub: "Technical + HR (Recommended)" },
    { value: "technical", label: "Technical", sub: "Code & Architecture" },
    { value: "hr", label: "HR / Behavioral", sub: "STAR & Culture fit" },
    { value: "job_specific", label: "Job Specific", sub: "Grounded in JD" }
]

const RIGORS = [
    { value: "adaptive", label: "Adaptive", sub: "Dynamically adjusts (Recommended)" },
    { value: "easy", label: "Easy", sub: "Fundamental concepts" },
    { value: "medium", label: "Medium", sub: "Standard engineering" },
    { value: "hard", label: "Hard", sub: "Rigorous deep-dives" }
]

const MockInterviewSetup = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const preselectedReportId = searchParams.get("reportId")

    const [reports, setReports] = useState([])
    const [selectedReportId, setSelectedReportId] = useState(preselectedReportId || "")
    const [customRole, setCustomRole] = useState("Full-Stack Software Engineer")
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
                    if (preselectedReportId) {
                        const match = res.interviewReports.find(r => r._id === preselectedReportId)
                        if (match) {
                            setSelectedReportId(match._id)
                            setCustomRole(match.title || "Software Engineer")
                        }
                    } else {
                        setSelectedReportId(res.interviewReports[0]._id)
                        setCustomRole(res.interviewReports[0].title || "Software Engineer")
                    }
                }
            } catch (err) {
                console.error("Error fetching reports:", err)
            }
        }
        fetchReports()
    }, [preselectedReportId])

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
            setErrorMsg(err.message || "Failed to start mock interview. Please check your connection.")
        } finally {
            setLoading(false)
        }
    }

    const durationLabel = DURATIONS.find(d => d.value === duration)?.label || `${duration} Min`
    const focusLabel = FOCUS_TYPES.find(f => f.value === interviewType)?.label || interviewType
    const rigorLabel = RIGORS.find(r => r.value === difficulty)?.label || difficulty

    return (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 space-y-9 border border-white/95 shadow-lg">

                {/* Header Title */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 font-code text-xs text-[#e11d48] uppercase tracking-wider font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#ff2e63] animate-pulse" />
                        <span>Real-Time Simulation Setup</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
                        Mock Interview Configuration
                    </h1>
                    <p className="text-sm text-slate-600">
                        Configure your adaptive session parameters. The AI interviewer will adjust question rigor dynamically.
                    </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
                        <span className="material-symbols-outlined text-xl text-rose-500">error</span>
                        <div className="flex-1">
                            <p className="font-semibold text-rose-900">Setup Error</p>
                            <p className="text-rose-700 mt-0.5">{errorMsg}</p>
                        </div>
                        <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-700">
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                )}

                {/* Section 1: BASE ON INTERVIEW PLAN */}
                <section className="space-y-3">
                    <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase font-headline">
                        Base on Interview Plan (Recommended)
                    </h2>
                    <div className="relative">
                        <select
                            value={selectedReportId}
                            onChange={(e) => handleReportChange(e.target.value)}
                            className="w-full bg-white/90 border border-slate-200 hover:border-slate-300 focus:border-[#ff2e63] focus:ring-2 focus:ring-[#ff2e63]/20 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 appearance-none cursor-pointer pr-10 outline-none transition-all shadow-sm"
                        >
                            {reports.length > 0 ? (
                                reports.map((r) => (
                                    <option key={r._id} value={r._id}>
                                        {r.title} — Match Score: {r.matchScore}% ({new Date(r.createdAt).toLocaleDateString()})
                                    </option>
                                ))
                            ) : (
                                <option value="">Custom Interview (No prior resume plan uploaded)</option>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                            <span className="material-symbols-outlined text-xl">expand_more</span>
                        </div>
                    </div>
                </section>

                {/* Section 2: TARGET JOB TITLE / ROLE */}
                <section className="space-y-3">
                    <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase font-headline">
                        Target Job Title / Role
                    </h2>
                    <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="e.g. Full-Stack Software Engineer, AI Engineer"
                        className="w-full bg-white/90 border border-slate-200 hover:border-slate-300 focus:border-[#ff2e63] focus:ring-2 focus:ring-[#ff2e63]/20 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </section>

                {/* Section 3: INTERVIEW DURATION */}
                <section className="space-y-3">
                    <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase font-headline">
                        Interview Duration
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {DURATIONS.map((d) => {
                            const isSelected = duration === d.value
                            return (
                                <div
                                    key={d.value}
                                    onClick={() => setDuration(d.value)}
                                    className={`rounded-2xl p-5 cursor-pointer text-center flex flex-col justify-center items-center group select-none transition-all ${
                                        isSelected ? "selection-card-active" : "selection-card-idle"
                                    }`}
                                >
                                    <div className={`text-base font-bold font-headline ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                                        {d.label}
                                    </div>
                                    <div className={`text-xs mt-1 ${isSelected ? "text-[#e11d48] font-medium" : "text-slate-500"}`}>
                                        {d.sub}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Section 4: INTERVIEW FOCUS TYPE */}
                <section className="space-y-3">
                    <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase font-headline">
                        Interview Focus Type
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FOCUS_TYPES.map((f) => {
                            const isSelected = interviewType === f.value
                            return (
                                <div
                                    key={f.value}
                                    onClick={() => setInterviewType(f.value)}
                                    className={`rounded-2xl p-5 cursor-pointer text-center flex flex-col justify-center items-center group select-none transition-all ${
                                        isSelected ? "selection-card-active" : "selection-card-idle"
                                    }`}
                                >
                                    <div className={`text-sm font-bold font-headline ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                                        {f.label}
                                    </div>
                                    <div className={`text-xs mt-1 leading-snug ${isSelected ? "text-[#e11d48] font-medium" : "text-slate-500"}`}>
                                        {f.sub}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Section 5: INTERVIEW RIGOR / DIFFICULTY */}
                <section className="space-y-3">
                    <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase font-headline">
                        Interview Rigor / Difficulty
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {RIGORS.map((r) => {
                            const isSelected = difficulty === r.value
                            return (
                                <div
                                    key={r.value}
                                    onClick={() => setDifficulty(r.value)}
                                    className={`rounded-2xl p-5 cursor-pointer text-center flex flex-col justify-center items-center group select-none transition-all ${
                                        isSelected ? "selection-card-active" : "selection-card-idle"
                                    }`}
                                >
                                    <div className={`text-sm font-bold font-headline ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                                        {r.label}
                                    </div>
                                    <div className={`text-xs mt-1 leading-snug ${isSelected ? "text-[#e11d48] font-medium" : "text-slate-500"}`}>
                                        {r.sub}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Section 6: ACTION FOOTER */}
                <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff2e63]/10 border border-[#ff2e63]/25 text-xs font-code text-[#e11d48] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#ff2e63] animate-pulse" />
                            <span>{durationLabel} • {focusLabel} • {rigorLabel}</span>
                        </span>
                        <span className="text-xs text-slate-500 hidden md:inline font-medium">Adaptive Prompting Active</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Link
                            to="/"
                            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-semibold shadow-sm transition-all w-full sm:w-auto text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white font-semibold text-sm shadow-lg shadow-[#ff2e63]/25 hover:shadow-[#ff2e63]/40 active:scale-[0.98] transition-all border border-white/20 w-full sm:w-auto group disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                    <span>Initializing Session...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Interview</span>
                                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </main>
    )
}

export default MockInterviewSetup
