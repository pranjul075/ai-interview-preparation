import React, { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router"
import { useInterview } from "../hooks/useInterview"

const Interview = () => {
    const { interviewId } = useParams()
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState("technical")
    const [checkedTasks, setCheckedTasks] = useState({})

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    if (loading || !report) {
        return (
            <main className="w-full flex-1 flex flex-col items-center justify-center py-20 px-4">
                <span className="material-symbols-outlined text-4xl text-[#ff2e63] animate-spin mb-4">progress_activity</span>
                <h1 className="text-xl font-bold text-slate-800 font-headline">Loading your interview strategy...</h1>
                <p className="text-xs text-slate-500 mt-1">Retrieving AI diagnostic scorecard, skill gaps, and custom syllabus.</p>
            </main>
        )
    }

    const matchScore = report.matchScore || 0
    const circumference = 2 * Math.PI * 66
    const strokeDashoffset = circumference - (matchScore / 100) * circumference

    const toggleTask = (taskId) => {
        setCheckedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }))
    }

    const totalTasks = report.preparationPlan?.reduce((acc, d) => acc + (d.tasks?.length || 0), 0) || 0
    const completedTasksCount = Object.values(checkedTasks).filter(Boolean).length
    const taskPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0

    return (
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] mx-auto">
            <div className="flex flex-col w-full gap-8">

                {/* ── TOP HEADER & ACTIONS ── */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 font-code text-xs text-slate-500">
                            <Link to="/" className="hover:text-slate-800 transition-colors">RESUME ANALYSIS</Link>
                            <span>/</span>
                            <span className="text-[#e11d48] font-semibold">MATCH REPORT</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                                {matchScore >= 80 ? "STRONG MATCH" : matchScore >= 60 ? "MODERATE FIT" : "GAP REMEDIATION"}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
                            {report.title || "Target Role Analysis Report"}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-code flex-wrap">
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <span className="material-symbols-outlined text-sm text-[#ff2e63]">verified</span>
                                Real Score: {matchScore}%
                            </span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{report.technicalQuestions?.length || 0} Technical Questions</span>
                            <span>•</span>
                            <span>{report.behavioralQuestions?.length || 0} Behavioral Questions</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap self-start lg:self-center">
                        <button
                            onClick={() => getResumePdf(interviewId)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs shadow-xs transition-all"
                        >
                            <span className="material-symbols-outlined text-base">download</span>
                            <span>Export Resume (PDF)</span>
                        </button>
                        <Link
                            to={`/mock-interview?reportId=${interviewId}`}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white font-semibold text-xs shadow-md shadow-[#ff2e63]/25 hover:shadow-[#ff2e63]/40 border border-white/20 transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-base">timer</span>
                            <span>Practice Mock Interview</span>
                        </Link>
                    </div>
                </div>

                {/* ── SUMMARY SECTION: SCORE RING & INSIGHTS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Score Ring Card */}
                    <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-4 z-10">
                            <span className="font-code text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                Profile Match Diagnostic
                            </span>
                            <span className="flex items-center gap-1.5 font-code text-xs text-slate-700 bg-white/90 border border-slate-200 px-3 py-1 rounded-full font-semibold shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                SCORE CALCULATED
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 my-auto z-10">
                            {/* Circular SVG Ring */}
                            <div className="relative flex-shrink-0 w-44 h-44 flex items-center justify-center">
                                <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="66"
                                        fill="transparent"
                                        stroke="#e2e8f0"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="66"
                                        fill="transparent"
                                        stroke="#ff2e63"
                                        strokeWidth="12"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        style={{ transition: "stroke-dashoffset 1s ease" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {matchScore}%
                                    </span>
                                    <span className="font-code text-[10px] text-slate-400 uppercase -mt-0.5 font-semibold">
                                        Overall Match
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 text-center sm:text-left">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[#e11d48] w-fit mx-auto sm:mx-0 shadow-2xs">
                                    <span className="material-symbols-outlined text-sm">insights</span>
                                    <span className="font-code text-xs font-semibold">
                                        {matchScore >= 80 ? "High Compatibility" : matchScore >= 60 ? "Moderate Alignment" : "Skill Gap Focus Required"}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                                    Calculated by comparing keywords, stack proficiencies, and experience depth against the parsed job requirements.
                                </p>
                            </div>
                        </div>

                        {/* Sub Metrics Strip */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-200/70 z-10">
                            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 flex flex-col gap-1 shadow-xs">
                                <span className="font-code text-[10px] text-slate-500 font-semibold uppercase">SKILL GAPS</span>
                                <span className="font-code text-base text-slate-900 font-bold">{report.skillGaps?.length || 0} Areas</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 flex flex-col gap-1 shadow-xs">
                                <span className="font-code text-[10px] text-slate-500 font-semibold uppercase">TECHNICAL DRILLS</span>
                                <span className="font-code text-base text-slate-900 font-bold">{report.technicalQuestions?.length || 0} Questions</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 flex flex-col gap-1 shadow-xs">
                                <span className="font-code text-[10px] text-slate-500 font-semibold uppercase">ROADMAP SYLLABUS</span>
                                <span className="font-code text-base text-slate-900 font-bold">{report.preparationPlan?.length || 0} Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Skill Gaps Breakdown Card */}
                    <div className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-code text-xs text-slate-700 uppercase tracking-wider font-semibold">
                                    <span className="material-symbols-outlined text-[#ff2e63] text-base">psychology</span>
                                    <span>Detected Skill Gaps</span>
                                </div>
                                <span className="font-code text-xs text-slate-400 font-medium">Real-time Analysis</span>
                            </div>

                            {report.skillGaps && report.skillGaps.length > 0 ? (
                                <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                                    {report.skillGaps.map((gap, i) => {
                                        const sev = gap.severity?.toLowerCase()
                                        const badgeClass =
                                            sev === "high"
                                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                                : sev === "medium"
                                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                                : "bg-sky-50 border-sky-200 text-sky-700"
                                        return (
                                            <div
                                                key={i}
                                                className="p-3 rounded-xl bg-white/80 border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff2e63]" />
                                                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{gap.skill}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md border font-code text-[10px] uppercase font-bold ${badgeClass}`}>
                                                    {gap.severity}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl bg-white/80 border border-slate-200 text-center text-xs text-slate-500">
                                    No critical skill gaps detected. Your profile aligns strongly with the role requirements!
                                </div>
                            )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-200/70 flex items-center justify-between font-code text-xs">
                            <span className="text-slate-400">Ready for tailored practice?</span>
                            <Link
                                to={`/mock-interview?reportId=${interviewId}`}
                                className="text-[#e11d48] hover:text-[#ff2e63] font-semibold hover:underline"
                            >
                                Start Mock Interview →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── QUESTION DRILLS ACCORDIONS ── */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab("technical")}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                    activeTab === "technical"
                                        ? "bg-[#ff2e63] text-white shadow-sm shadow-[#ff2e63]/25"
                                        : "bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200"
                                }`}
                            >
                                Technical Questions ({report.technicalQuestions?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab("behavioral")}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                    activeTab === "behavioral"
                                        ? "bg-[#ff2e63] text-white shadow-sm shadow-[#ff2e63]/25"
                                        : "bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-200"
                                }`}
                            >
                                Behavioral Questions ({report.behavioralQuestions?.length || 0})
                            </button>
                        </div>

                        <Link
                            to="/assistant"
                            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#ff2e63] font-semibold"
                        >
                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                            <span>Discuss with Assistant</span>
                        </Link>
                    </div>

                    {/* Questions List */}
                    <div className="flex flex-col gap-3">
                        {activeTab === "technical" ? (
                            report.technicalQuestions?.map((q, idx) => (
                                <details
                                    key={idx}
                                    className="group glass-card rounded-2xl p-4 sm:p-5 border border-white/95 transition-all cursor-pointer"
                                >
                                    <summary className="list-none flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <span className="px-2 py-0.5 rounded-md bg-[#ff2e63]/10 font-code text-xs font-bold text-[#e11d48]">
                                                Q{idx + 1}
                                            </span>
                                            <p className="text-sm font-bold text-slate-900 font-headline">{q.question}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                                            expand_more
                                        </span>
                                    </summary>
                                    <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-3 text-xs sm:text-sm">
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                                            <span className="font-code text-[11px] font-bold text-[#e11d48] uppercase">INTERVIEWER INTENTION</span>
                                            <p className="text-slate-700 mt-1 leading-relaxed">{q.intention}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white border border-emerald-200">
                                            <span className="font-code text-[11px] font-bold text-emerald-700 uppercase">MODEL ANSWER / TALKING POINTS</span>
                                            <p className="text-slate-800 mt-1 leading-relaxed">{q.answer}</p>
                                        </div>
                                    </div>
                                </details>
                            ))
                        ) : (
                            report.behavioralQuestions?.map((q, idx) => (
                                <details
                                    key={idx}
                                    className="group glass-card rounded-2xl p-4 sm:p-5 border border-white/95 transition-all cursor-pointer"
                                >
                                    <summary className="list-none flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 font-code text-xs font-bold text-indigo-700">
                                                Q{idx + 1}
                                            </span>
                                            <p className="text-sm font-bold text-slate-900 font-headline">{q.question}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                                            expand_more
                                        </span>
                                    </summary>
                                    <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-3 text-xs sm:text-sm">
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                                            <span className="font-code text-[11px] font-bold text-indigo-700 uppercase">INTERVIEWER INTENTION</span>
                                            <p className="text-slate-700 mt-1 leading-relaxed">{q.intention}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white border border-emerald-200">
                                            <span className="font-code text-[11px] font-bold text-emerald-700 uppercase">STAR ANSWER FRAMEWORK</span>
                                            <p className="text-slate-800 mt-1 leading-relaxed">{q.answer}</p>
                                        </div>
                                    </div>
                                </details>
                            ))
                        )}
                    </div>
                </div>

                {/* ── TARGETED PREPARATION ROADMAP ── */}
                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card p-4 sm:p-5 rounded-2xl shadow-xs">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#ff2e63] text-xl">route</span>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight font-headline">
                                    Targeted Preparation Roadmap
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500">
                                Step-by-step curriculum configured by AI to resolve your detected skill gaps.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-code text-xs font-bold text-slate-700">
                                {completedTasksCount} of {totalTasks} tasks ({taskPercent}%)
                            </span>
                            <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                <div className="bg-[#ff2e63] h-full rounded-full transition-all duration-300" style={{ width: `${taskPercent}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {report.preparationPlan?.map((plan) => (
                            <div key={plan.day} className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 rounded-lg bg-[#ff2e63]/10 font-code text-xs font-bold text-[#e11d48]">
                                            Day {plan.day}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 font-headline leading-snug">
                                        {plan.focus}
                                    </h3>
                                    <ul className="space-y-2 mt-1">
                                        {plan.tasks?.map((task, tidx) => {
                                            const taskId = `${plan.day}-${tidx}`
                                            const isChecked = !!checkedTasks[taskId]
                                            return (
                                                <li key={tidx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleTask(taskId)}
                                                        className="mt-0.5 rounded text-[#ff2e63] focus:ring-[#ff2e63]/30 cursor-pointer"
                                                    />
                                                    <span className={isChecked ? "line-through text-slate-400" : ""}>{task}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    )
}

export default Interview