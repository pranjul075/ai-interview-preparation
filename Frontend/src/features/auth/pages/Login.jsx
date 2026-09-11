import React, { useState } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "../hooks/useAuth"

const Login = () => {
    const { loading, handleLogin, authError, setAuthError } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setAuthError(null)
        const result = await handleLogin({ email, password })
        setIsSubmitting(false)
        if (result.success) {
            navigate("/")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#ff2e63]">
                    <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                    <span className="font-headline text-lg font-semibold text-slate-800">Loading PrepAI...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#f8f9ff] font-body text-slate-900 antialiased min-h-screen relative selection:bg-[#ff2e63] selection:text-white overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] left-[15%] w-[42rem] h-[42rem] bg-gradient-to-br from-[#ff2e63]/12 via-[#c084fc]/15 to-transparent rounded-full blur-[120px] pointer-events-none -z-20" />
            <div className="fixed bottom-[-10%] right-[8%] w-[40rem] h-[40rem] bg-gradient-to-tr from-[#38bdf8]/15 via-[#818cf8]/15 to-[#ff3366]/10 rounded-full blur-[130px] pointer-events-none -z-20" />
            <div className="fixed top-[32%] right-[5%] w-[26rem] h-[26rem] bg-gradient-to-bl from-[#ff2e63]/10 via-[#a78bfa]/12 to-transparent rounded-full blur-[100px] pointer-events-none -z-20" />

            {/* Subtle Floating Frosted Optical Lenses */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none">
                <div className="visionos-pink-lens float-lens-1 absolute top-[16%] left-[45%] hidden md:block w-24 h-24 rounded-full pointer-events-auto">
                    <div className="absolute top-2 left-3 w-8 h-4 rounded-full bg-white/80 blur-[1px] -rotate-12" />
                </div>
                <div className="visionos-pink-lens float-lens-2 absolute bottom-[18%] right-[38%] hidden lg:block w-20 h-20 rounded-full pointer-events-auto">
                    <div className="absolute top-2 left-2.5 w-6 h-3 rounded-full bg-white/80 blur-[0.5px] -rotate-15" />
                </div>
            </div>

            <main className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-0">
                <div className="flex flex-col w-full">
                    <div className="w-full max-w-7xl mx-auto py-4 md:py-8 px-2 sm:px-4 lg:px-6 relative">
                        {/* Top Status Pill */}
                        <div className="absolute -top-3 right-[10%] lg:right-[38%] z-20 hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-code tracking-wider cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff2e63] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff2e63]" />
                            </span>
                            <span className="text-slate-700 font-semibold">Adaptive AI Mock Engine • System Active</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-6rem)]">
                            {/* Left Column: Hero & Value Proposition */}
                            <div className="lg:col-span-7 flex flex-col justify-between py-2 lg:pr-6 relative">
                                <div className="space-y-6">
                                    {/* Brand Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Link to="/" className="flex items-center text-2xl font-bold tracking-tight select-none">
                                                <span className="text-slate-900 font-headline">Prep</span>
                                                <span className="text-[#ff2e63] font-headline">AI</span>
                                            </Link>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-code font-semibold bg-[#ff2e63]/10 border border-[#ff2e63]/25 text-[#e11d48]">
                                                Platform
                                            </span>
                                        </div>

                                        {/* Animated Tagline Pill */}
                                        <div className="kinetic-tagline-pill group cursor-default">
                                            <div className="flex items-center gap-2">
                                                <span className="pink-breathing-dot flex-shrink-0" />
                                                <span className="text-xs font-medium tagline-shimmer-text">Prepare smarter. Interview better.</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Master Headline */}
                                    <div className="space-y-3 pt-2 max-w-xl">
                                        <h1 className="text-3xl sm:text-4xl lg:text-[44px] leading-tight font-extrabold text-slate-900 tracking-tight font-headline">
                                            AI-Powered <br className="hidden sm:inline" />
                                            <span className="kinetic-hero-sheen">
                                                <span className="kinetic-pink-gradient">
                                                    Interview Preparation
                                                </span>
                                            </span> partner.
                                        </h1>
                                        <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-lg font-normal">
                                            Analyze job descriptions against your resume, master technical doubts, and practice with real-time adaptive AI mock interviews.
                                        </p>
                                    </div>

                                    {/* 3 Primary Feature Cards in Frosted Light Glass */}
                                    <div className="space-y-3 pt-1 max-w-xl">
                                        {/* Card 1 */}
                                        <div className="dashboard-card rounded-2xl p-4 sm:p-5 transition-all duration-300 group">
                                            <div className="flex items-start gap-4">
                                                <div aria-hidden="true" className="text-2xl select-none pt-0.5">📄</div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-slate-900 tracking-tight group-hover:text-slate-950 transition-colors">
                                                        Resume &amp; JD Analysis
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-[#64748b] mt-1 leading-relaxed">
                                                        Identify skill gaps, calculate job match score, and generate a day-wise prep plan.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2 */}
                                        <div className="dashboard-card rounded-2xl p-4 sm:p-5 transition-all duration-300 group">
                                            <div className="flex items-start gap-4">
                                                <div aria-hidden="true" className="text-2xl select-none pt-0.5">💬</div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-slate-900 tracking-tight group-hover:text-slate-950 transition-colors">
                                                        PrepAI Assistant
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-[#64748b] mt-1 leading-relaxed">
                                                        Clarify technical concepts, system design trade-offs, and behavioral answer frameworks.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 3 */}
                                        <div className="dashboard-card rounded-2xl p-4 sm:p-5 transition-all duration-300 group">
                                            <div className="flex items-start gap-4">
                                                <div aria-hidden="true" className="text-2xl select-none pt-0.5">🎯</div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-slate-900 tracking-tight group-hover:text-slate-950 transition-colors">
                                                        AI Mock Interview
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-[#64748b] mt-1 leading-relaxed">
                                                        Simulate a live 10, 20, or 30-minute interview with adaptive AI questioning and comprehensive grading.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verified Signal Ribbon */}
                                    <div className="pt-2 max-w-xl">
                                        <div className="rounded-xl px-4 py-3 bg-white/70 backdrop-blur-md border border-white/90 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-slate-700">
                                                <span className="text-sm">📈</span>
                                                <span className="font-medium">Continuous Skill &amp; Clarity Tracking</span>
                                            </div>
                                            <span className="text-[11px] font-code px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-semibold">
                                                Active Preparation
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex items-center gap-3 text-xs text-slate-500 font-code">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                    <span>PrepAI · Interview Preparation Platform</span>
                                </div>
                            </div>

                            {/* Right Column: Luminous Frosted Glass Login Card */}
                            <div className="lg:col-span-5 flex flex-col justify-center relative">
                                <div className="absolute -top-6 -right-6 w-44 h-44 rounded-full bg-[#ff2e63]/10 blur-3xl pointer-events-none -z-10" />
                                <div className="absolute -bottom-6 -left-6 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none -z-10" />

                                <div className="relative bg-white/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden transition-all duration-300">
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2e63] to-transparent opacity-90" />
                                    
                                    <div className="space-y-1 mb-6">
                                        <span className="text-[11px] font-code uppercase tracking-wider text-[#e11d48] font-bold">WELCOME BACK</span>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-headline">Sign in to PrepAI</h2>
                                        <p className="text-xs sm:text-sm text-[#64748b]">Continue your interview preparation journey.</p>
                                    </div>

                                    {/* Real Backend Error State Banner */}
                                    {authError && (
                                        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs backdrop-blur-md">
                                            <span className="material-symbols-outlined text-base flex-shrink-0 text-rose-500">error</span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-rose-900">Authentication failed</p>
                                                <p className="text-rose-700 mt-0.5">{authError}</p>
                                            </div>
                                            <button
                                                onClick={() => setAuthError(null)}
                                                className="text-rose-500 hover:text-rose-700 transition-colors"
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Login Form */}
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <label className="font-medium text-slate-700" htmlFor="email">Email</label>
                                                <span className="font-code text-slate-400 text-[10px] font-semibold">REQUIRED</span>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-base">alternate_email</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/90 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff2e63]/30 focus:border-[#ff2e63] transition-all duration-200 shadow-sm"
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <label className="font-medium text-slate-700" htmlFor="password">Password</label>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-base">lock</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-11 rounded-xl bg-white/90 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff2e63]/30 focus:border-[#ff2e63] transition-all duration-200 shadow-sm"
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    aria-label="Toggle password visibility"
                                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    type="button"
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        {showPassword ? "visibility_off" : "visibility"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#ff2e63]/25 hover:shadow-[#ff2e63]/35 active:scale-[0.98] transition-all duration-200 border border-white/20 disabled:opacity-75 disabled:cursor-not-allowed"
                                                id="submit-btn"
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                                                        <span>Authenticating...</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5">
                                                        Sign In
                                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <p className="text-xs text-[#64748b]">
                                            Don't have an account?{" "}
                                            <Link to="/register" className="text-[#e11d48] font-semibold hover:underline hover:text-[#ff2e63] transition-colors">
                                                Create an account
                                            </Link>
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-200/80 text-center text-[11px] text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-[#e11d48]">lock</span>
                                            Secure interview preparation workspace
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Login