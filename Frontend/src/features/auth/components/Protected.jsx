import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router"
import React from "react"
import Header from "../../../components/Header"

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main className="loading-screen" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <h1>Loading PrepAI...</h1>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="protected-layout app-dark" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />
            <div style={{ flex: 1 }}>
                {children}
            </div>
        </div>
    )
}

export default Protected