import React, { useState } from "react"
import { Link, useLocation } from "react-router"
import { useAuth } from "../features/auth/hooks/useAuth"

const Header = () => {
    const { user, handleLogout } = useAuth()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (path) => {
        if (path === "/" && location.pathname === "/") return true
        if (path !== "/" && location.pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        { name: "Dashboard", path: "/", icon: "dashboard" },
        { name: "Resume Analysis", path: "/#resume-workspace", icon: "description" },
        { name: "Mock Interview", path: "/mock-interview", icon: "timer" },
        { name: "AI Assistant", path: "/assistant", icon: "smart_toy" },
        { name: "Interview History", path: "/#history-section", icon: "analytics" },
    ]

    return (
        <>
            {/* Ambient Background Glows matching Stitch */}
            <div className="fixed top-[-10%] left-[15%] w-[42rem] h-[42rem] bg-gradient-to-br from-[#ff2e63]/10 via-[#c084fc]/12 to-transparent rounded-full blur-[130px] pointer-events-none -z-20" />
            <div className="fixed bottom-[-10%] right-[8%] w-[40rem] h-[40rem] bg-gradient-to-tr from-[#38bdf8]/12 via-[#818cf8]/12 to-[#ff3366]/08 rounded-full blur-[140px] pointer-events-none -z-20" />
            <div className="fixed top-[32%] right-[4%] w-[26rem] h-[26rem] bg-gradient-to-bl from-[#ff2e63]/08 via-[#a78bfa]/10 to-transparent rounded-full blur-[110px] pointer-events-none -z-20" />

            {/* Floating Opalescent Specular Lenses */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none">
                <div className="visionos-pink-lens float-lens-1 absolute top-[14%] right-[16%] hidden lg:block w-20 h-20 rounded-full pointer-events-auto">
                    <div className="absolute top-2 left-2.5 w-6 h-3 rounded-full bg-white/80 blur-[0.8px] -rotate-12" />
                </div>
                <div className="visionos-pink-lens float-lens-2 absolute bottom-[22%] left-[20%] hidden md:block w-16 h-16 rounded-full pointer-events-auto">
                    <div className="absolute top-1.5 left-2 w-5 h-2.5 rounded-full bg-white/80 blur-[0.6px] -rotate-15" />
                </div>
            </div>

            {/* Left Sidebar (Desktop) */}
            <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-white/80 backdrop-blur-2xl border-r border-slate-200/80 z-50 flex-col justify-between hidden md:flex shadow-[4px_0_24px_rgba(15,23,42,0.03)]">
                <div className="flex flex-col w-full">
                    {/* Brand Logo Header */}
                    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/70">
                        <Link to="/" className="flex items-center text-2xl font-bold tracking-tight select-none">
                            <span className="text-slate-900 font-headline">Prep</span>
                            <span className="text-[#ff2e63] font-headline">AI</span>
                        </Link>
                        <span className="px-2 py-0.5 rounded-md bg-[#ff2e63]/10 border border-[#ff2e63]/25 font-code text-[10px] font-bold text-[#e11d48] uppercase tracking-wider">
                            v1.0
                        </span>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col gap-1 px-3 mt-4">
                        {navItems.map((item) => {
                            const active = isActive(item.path)
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                        active
                                            ? "bg-[#ff2e63]/10 text-[#e11d48] font-semibold border border-[#ff2e63]/25 shadow-xs"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent"
                                    }`}
                                >
                                    <span
                                        className={`material-symbols-outlined text-xl ${
                                            active ? "text-[#e11d48]" : "text-slate-400 group-hover:text-slate-600"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom User Profile Card */}
                <div className="p-4 border-t border-slate-200/70">
                    <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                    {user?.username || "Candidate"}
                                </span>
                                <span className="text-[10px] font-code text-slate-500 truncate">
                                    {user?.email || "Signed In"}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            aria-label="Sign out"
                            title="Sign out"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer Backdrop & Menu */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
                    onClick={() => setMobileOpen(false)}
                >
                    <div
                        className="fixed inset-y-0 left-0 w-72 bg-white p-5 shadow-2xl flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                                <Link to="/" onClick={() => setMobileOpen(false)} className="text-2xl font-bold font-headline">
                                    <span className="text-slate-900">Prep</span>
                                    <span className="text-[#ff2e63]">AI</span>
                                </Link>
                                <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <nav className="flex flex-col gap-1.5 mt-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${
                                            isActive(item.path)
                                                ? "bg-[#ff2e63]/10 text-[#e11d48] font-semibold"
                                                : "text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                                        {user?.username?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-800">{user?.username}</span>
                                </div>
                                <button onClick={handleLogout} className="text-xs text-rose-600 font-medium">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Fixed Header */}
            <header className="fixed top-0 right-0 left-0 md:left-[260px] h-16 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
                <div className="flex items-center gap-3">
                    <button
                        aria-label="Open navigation drawer"
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <nav className="hidden sm:flex items-center gap-2 font-code text-xs text-slate-500">
                        <Link to="/" className="hover:text-slate-900 transition-colors">PrepAI</Link>
                        <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                        <span className="text-slate-900 font-semibold">Console</span>
                    </nav>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Quick CTA to Mock Interview */}
                    <Link
                        to="/mock-interview"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#ff2e63]/25 hover:shadow-[#ff2e63]/35 active:scale-[0.98] transition-all border border-white/20"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        <span className="hidden sm:inline">Start Mock Interview</span>
                        <span className="sm:hidden">Mock</span>
                    </Link>

                    {/* User Avatar */}
                    <div
                        className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-semibold text-xs shadow-xs"
                        title={user?.email || "Account"}
                    >
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header
