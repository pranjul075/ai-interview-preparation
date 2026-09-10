import React from "react"
import { Link, useLocation } from "react-router"
import { useAuth } from "../features/auth/hooks/useAuth"
import "./Header.scss"

const Header = () => {
    const { user, handleLogout } = useAuth()
    const location = useLocation()

    const isActive = (path) => {
        if (path === "/" && location.pathname === "/") return true
        if (path !== "/" && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <header className="app-header">
            <div className="header-container">
                <Link to="/" className="brand-logo">
                    <span className="brand-icon">⚡</span>
                    <span className="brand-name">Prep<span className="highlight">AI</span></span>
                </Link>

                <nav className="header-nav">
                    <Link
                        to="/"
                        className={`nav-link ${isActive("/") ? "nav-link--active" : ""}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/assistant"
                        className={`nav-link ${isActive("/assistant") ? "nav-link--active" : ""}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span>AI Assistant</span>
                    </Link>

                    <Link
                        to="/mock-interview"
                        className={`nav-link ${isActive("/mock-interview") ? "nav-link--active" : ""}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>Mock Interview</span>
                    </Link>
                </nav>

                <div className="header-user">
                    {user && (
                        <div className="user-profile">
                            <span className="user-avatar">{user.username?.charAt(0).toUpperCase() || "U"}</span>
                            <span className="user-name">{user.username}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className="logout-btn" title="Sign out">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
