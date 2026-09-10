import React, { useState } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "../hooks/useAuth"

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { loading, handleRegister, authError, setAuthError } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        const result = await handleRegister({ username, email, password })
        setIsSubmitting(false)
        if (result.success) {
            navigate("/")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#eef2ff] flex items-center justify-center">
                <div className="flex items-center gap-3 text-indigo-600">
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                    </svg>
                    <span className="font-headline text-lg font-semibold">Loading PrepAI...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#eef2ff] font-body text-sm text-slate-900 antialiased min-h-screen relative selection:bg-indigo-500 selection:text-white">
            {/* Background Blobs */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed bottom-10 right-1/4 w-[28rem] h-[28rem] bg-sky-200/35 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed top-1/2 right-10 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

            <main className="w-full min-h-screen flex items-center justify-center p-4">
                <div className="flex flex-col w-full">
                    <div className="w-full max-w-7xl mx-auto py-4 md:py-8 px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center min-h-[calc(100vh-6rem)]">

                            {/* Left Column: Brand & Value Proposition */}
                            <div className="lg:col-span-7 flex flex-col justify-between py-3 lg:pr-8">
                                <div className="space-y-8">
                                    {/* Logo */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                            <span className="text-white font-headline font-extrabold text-xl">P</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-headline text-lg text-slate-900 font-extrabold tracking-tight">PrepAI</span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-code text-[11px] leading-4 tracking-[0.06em] font-semibold bg-indigo-50 border border-indigo-200/60 text-indigo-700">Interview Prep</span>
                                            </div>
                                            <span className="font-body text-xs text-slate-500 font-medium">Prepare smarter. Interview better.</span>
                                        </div>
                                    </div>

                                    {/* Headline */}
                                    <div className="space-y-3 max-w-xl">
                                        <h1 className="font-headline text-[48px] leading-[56px] tracking-[-0.03em] font-bold text-slate-900">
                                            Your AI-powered <br className="hidden sm:inline" />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600">
                                                interview preparation
                                            </span>{" "}partner.
                                        </h1>
                                        <p className="font-body text-base leading-relaxed text-slate-600">
                                            Analyze your resume, identify skill gaps, practice realistic interviews, and become more confident for your next opportunity.
                                        </p>
                                    </div>

                                    {/* Feature Bullets */}
                                    <div className="space-y-2 pt-1 max-w-xl">
                                        <FeatureCard
                                            icon="description"
                                            title="AI Resume Analysis"
                                            description="Analyze your resume, identify strengths and skill gaps, and understand how well your profile matches your target role."
                                            color="indigo"
                                        />
                                        <FeatureCard
                                            icon="terminal"
                                            title="Adaptive Mock Interviews"
                                            description="Practice realistic technical and HR interviews with AI-generated questions and dynamic follow-up questions."
                                            color="emerald"
                                        />
                                        <FeatureCard
                                            icon="fact_check"
                                            title="Personalized Interview Feedback"
                                            description="Get a detailed final report covering your answers, strengths, weaknesses, technical skills, and areas for improvement."
                                            color="violet"
                                        />
                                    </div>
                                </div>

                                {/* System Status Footer */}
                                <div className="pt-8 flex items-center gap-6 text-slate-500 font-code text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="font-medium text-slate-600">PrepAI · Interview Preparation Platform</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Register Card */}
                            <div className="lg:col-span-5 flex flex-col justify-center">
                                <div className="relative bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl shadow-indigo-100/50 p-6 sm:p-8 overflow-hidden transition-all duration-300">
                                    {/* Top Gradient Bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-600 to-violet-600 opacity-90" />

                                    <div className="space-y-3 mb-6">
                                        <span className="font-code text-[11px] leading-4 tracking-[0.06em] font-bold text-emerald-700 uppercase">GET STARTED</span>
                                        <div>
                                            <h2 className="font-headline text-[22px] leading-[30px] tracking-[-0.015em] font-bold text-slate-900">Create your account</h2>
                                            <p className="font-body text-sm text-slate-600 mt-1">Start your AI-powered interview preparation journey.</p>
                                        </div>
                                    </div>

                                    {/* Error Banner */}
                                    {authError && (
                                        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                                            <span className="material-symbols-outlined text-lg shrink-0 mt-0.5 text-rose-600">error</span>
                                            <div className="flex-1">
                                                <p className="font-body text-[15px] leading-[22px] font-semibold text-rose-900">Registration failed</p>
                                                <p className="font-body text-xs text-rose-700 mt-0.5">{authError}</p>
                                            </div>
                                            <button className="text-rose-500 hover:text-rose-700" type="button" onClick={() => setAuthError(null)}>
                                                <span className="material-symbols-outlined text-base">close</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Register Form */}
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        {/* Username */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="font-body text-[15px] leading-[22px] tracking-[-0.005em] font-semibold text-slate-800" htmlFor="reg-username">Username</label>
                                                <span className="font-code text-[11px] leading-4 tracking-[0.06em] font-semibold text-slate-400">REQUIRED</span>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-lg">person</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-3 rounded-lg bg-white/90 border border-slate-200 text-slate-900 font-body text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150 shadow-xs"
                                                    id="reg-username"
                                                    name="username"
                                                    placeholder="Choose a username"
                                                    required
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => { setUsername(e.target.value); if (authError) setAuthError(null) }}
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="font-body text-[15px] leading-[22px] tracking-[-0.005em] font-semibold text-slate-800" htmlFor="reg-email">Email Address</label>
                                                <span className="font-code text-[11px] leading-4 tracking-[0.06em] font-semibold text-slate-400">REQUIRED</span>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-lg">alternate_email</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-3 rounded-lg bg-white/90 border border-slate-200 text-slate-900 font-body text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150 shadow-xs"
                                                    id="reg-email"
                                                    name="email"
                                                    placeholder="you@example.com"
                                                    required
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => { setEmail(e.target.value); if (authError) setAuthError(null) }}
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="font-body text-[15px] leading-[22px] tracking-[-0.005em] font-semibold text-slate-800" htmlFor="reg-password">Password</label>
                                                <span className="font-code text-[11px] leading-4 tracking-[0.06em] font-semibold text-slate-400">MIN 6 CHARS</span>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-lg">lock</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-11 rounded-lg bg-white/90 border border-slate-200 text-slate-900 font-body text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150 shadow-xs"
                                                    id="reg-password"
                                                    name="password"
                                                    placeholder="At least 6 characters"
                                                    required
                                                    type={showPassword ? "text" : "password"}
                                                    minLength={6}
                                                    value={password}
                                                    onChange={(e) => { setPassword(e.target.value); if (authError) setAuthError(null) }}
                                                />
                                                <button
                                                    aria-label="Toggle password visibility"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Primary Action */}
                                        <div className="pt-2">
                                            <button
                                                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-body text-[15px] leading-[22px] tracking-[-0.005em] font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 active:scale-[0.99] transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed"
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
                                                        </svg>
                                                        <span>Creating account...</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        Create Account
                                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Login Link */}
                                    <div className="mt-6 text-center">
                                        <p className="font-body text-sm text-slate-600">
                                            Already have an account?{" "}
                                            <Link to="/login" className="text-indigo-600 font-semibold hover:underline hover:text-indigo-800 transition-colors">
                                                Sign In
                                            </Link>
                                        </p>
                                    </div>

                                    {/* Security Footer */}
                                    <div className="mt-6 pt-3 border-t border-slate-200/80 flex items-center justify-between text-slate-500">
                                        <div className="w-full text-center font-body text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-xs text-emerald-600">lock</span>
                                                Your interview preparation workspace
                                            </span>
                                        </div>
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

const FeatureCard = ({ icon, title, description, color }) => {
    const colorMap = {
        indigo: {
            bg: "bg-indigo-50",
            border: "border-indigo-100/70",
            text: "text-indigo-600",
            hoverBorder: "hover:border-indigo-200"
        },
        emerald: {
            bg: "bg-emerald-50",
            border: "border-emerald-100/70",
            text: "text-emerald-600",
            hoverBorder: "hover:border-emerald-200"
        },
        violet: {
            bg: "bg-violet-50",
            border: "border-violet-100/70",
            text: "text-violet-600",
            hoverBorder: "hover:border-violet-200"
        }
    }
    const c = colorMap[color] || colorMap.indigo

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-xs transition-all duration-200 hover:shadow-md ${c.hoverBorder}`}>
            <div className={`p-2 rounded-lg ${c.bg} border ${c.border} ${c.text} shrink-0 mt-0.5`}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-body text-[15px] leading-[22px] tracking-[-0.005em] font-semibold text-slate-900">{title}</span>
                <span className="font-body text-xs text-slate-600 mt-0.5">{description}</span>
            </div>
        </div>
    )
}

export default Register