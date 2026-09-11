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
        <div className="bg-[#f8f9ff] text-[#0f172a] font-body min-h-screen relative selection:bg-[#ff2e63] selection:text-white overflow-x-hidden">
            <Header />
            <div className="md:pl-[260px] pt-16 flex flex-col min-h-screen">
                {children}
            </div>
        </div>
    )
}

export default Protected