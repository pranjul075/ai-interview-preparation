import React, { useState, useEffect, useRef } from "react"
import { askAssistant } from "../services/assistant.api"
import { getAllInterviewReports } from "../../interview/services/interview.api"
import { marked } from "marked"
import "../style/assistant.scss"

const PRESET_SUGGESTIONS = [
    "Why is REST API / SQL mentioned as my skill gap?",
    "Explain the difference between SQL and NoSQL database indexing.",
    "How should I structure my answer to 'Tell me about yourself'?",
    "Explain polymorphism in object-oriented programming with a simple example.",
    "Give me an example of answering a behavioral question using the STAR method.",
    "How do JWT tokens work and how are they verified securely?"
]

const Assistant = () => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [reports, setReports] = useState([])
    const [selectedReportId, setSelectedReportId] = useState("")
    const [errorMsg, setErrorMsg] = useState(null)

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch reports to populate context selector
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await getAllInterviewReports()
                if (res?.interviewReports?.length) {
                    setReports(res.interviewReports)
                    setSelectedReportId(res.interviewReports[0]._id)
                }
            } catch (err) {
                console.error("Could not fetch reports for assistant context:", err)
            }
        }
        fetchReports()
    }, [])

    const handleSend = async (userText) => {
        const text = userText || input
        if (!text.trim() || loading) return

        const userMessage = { role: "user", content: text.trim(), timestamp: new Date() }
        const newHistory = [...messages, userMessage]
        setMessages(newHistory)
        setInput("")
        setLoading(true)
        setErrorMsg(null)

        try {
            const res = await askAssistant({
                message: text.trim(),
                interviewReportId: selectedReportId || undefined,
                conversationHistory: newHistory.map(m => ({ role: m.role, content: m.content }))
            })

            const assistantMessage = {
                role: "assistant",
                content: res.reply,
                timestamp: new Date(),
                contextApplied: res.contextApplied
            }

            setMessages([...newHistory, assistantMessage])
        } catch (err) {
            console.error(err)
            setErrorMsg(err.message || "Failed to reach PrepAI Assistant.")
            setMessages([...newHistory, {
                role: "assistant",
                content: "⚠️ " + (err.message || "I encountered an error formulating a response. Please check your network or try again."),
                timestamp: new Date()
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="assistant-page">
            <header className="assistant-header">
                <div className="header-title">
                    <h1>PrepAI <span className="highlight">Assistant</span></h1>
                    <p>Ask technical questions, clarify your detected skill gaps, or polish HR responses</p>
                </div>

                {reports.length > 0 && (
                    <div className="context-selector">
                        <label htmlFor="contextSelect">Active Context:</label>
                        <select
                            id="contextSelect"
                            value={selectedReportId}
                            onChange={(e) => setSelectedReportId(e.target.value)}
                        >
                            <option value="">General Preparation</option>
                            {reports.map((r) => (
                                <option key={r._id} value={r._id}>
                                    {r.title} ({r.matchScore}% Match)
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </header>

            <main className="assistant-container">
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="message-empty-state">
                            <div className="empty-icon">💡</div>
                            <h3>How can I help you prepare today?</h3>
                            <p>
                                I can explain concepts from your target job description, dissect your skill gaps, or help you practice answers.
                            </p>
                            <div className="suggestions-chips">
                                {PRESET_SUGGESTIONS.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        className="chip-btn"
                                        onClick={() => handleSend(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((m, idx) => (
                            <div key={idx} className={`chat-bubble chat-bubble--${m.role}`}>
                                <div className={`bubble-avatar bubble-avatar--${m.role}`}>
                                    {m.role === "assistant" ? "AI" : "You"}
                                </div>
                                <div className="bubble-body">
                                    {m.role === "assistant" ? (
                                        <div
                                            className="markdown-content"
                                            dangerouslySetInnerHTML={{ __html: marked.parse(m.content || "") }}
                                        />
                                    ) : (
                                        m.content
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {loading && (
                        <div className="chat-bubble chat-bubble--assistant">
                            <div className="bubble-avatar bubble-avatar--assistant">AI</div>
                            <div className="bubble-body" style={{ color: "#94a3b8" }}>
                                Thinking & formulating explanation...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-bar">
                    <textarea
                        rows={1}
                        placeholder="Ask anything about interview concepts, system design, or your skill gaps... (Enter to send)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="send-btn"
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        title="Send message"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Assistant
