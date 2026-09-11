import React, { useState, useEffect, useRef } from "react"
import { askAssistant } from "../services/assistant.api"
import { getAllInterviewReports } from "../../interview/services/interview.api"
import { marked } from "marked"

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
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

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

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }

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

    const handleInputResize = (e) => {
        setInput(e.target.value)
        e.target.style.height = "auto"
        e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
    }

    return (
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-5rem)]">
            {/* Header with Title & Context Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff2e63] animate-pulse" />
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-headline tracking-tight">
                            PrepAI <span className="text-[#ff2e63]">Assistant</span>
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Ask technical concepts, clarify your skill gaps, or polish behavioral answers.
                    </p>
                </div>

                {reports.length > 0 && (
                    <div className="flex items-center gap-2 bg-white/90 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-xs">
                        <label htmlFor="contextSelect" className="text-xs font-code font-semibold text-slate-500">
                            Context:
                        </label>
                        <select
                            id="contextSelect"
                            value={selectedReportId}
                            onChange={(e) => setSelectedReportId(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[220px] truncate"
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
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 my-2 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                {messages.length === 0 ? (
                    <div className="my-auto flex flex-col items-center justify-center text-center p-4">
                        <div className="text-4xl mb-3">💡</div>
                        <h3 className="text-lg font-bold text-slate-900 font-headline mb-1">
                            How can I help you prepare today?
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                            I can explain topics from your target role, resolve detected skill gaps, or help format STAR behavioral responses.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl text-left">
                            {PRESET_SUGGESTIONS.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(suggestion)}
                                    className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#ff2e63]/40 text-xs text-slate-700 hover:text-slate-900 transition-all text-left shadow-2xs group flex items-start gap-2"
                                >
                                    <span className="text-[#ff2e63] font-bold">›</span>
                                    <span className="leading-snug">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m, idx) => {
                        const isUser = m.role === "user"
                        return (
                            <div
                                key={idx}
                                className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                        isUser
                                            ? "bg-[#ff2e63] text-white shadow-sm shadow-[#ff2e63]/30"
                                            : "bg-slate-100 border border-slate-200 text-slate-700"
                                    }`}
                                >
                                    {isUser ? "You" : "AI"}
                                </div>
                                <div
                                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                        isUser
                                            ? "bg-gradient-to-r from-[#ff2e63] to-[#e11d48] text-white rounded-tr-sm shadow-md shadow-[#ff2e63]/20"
                                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-xs"
                                    }`}
                                >
                                    {isUser ? (
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                    ) : (
                                        <div
                                            className="prose prose-sm max-w-none text-slate-800 space-y-2"
                                            dangerouslySetInnerHTML={{ __html: marked.parse(m.content || "") }}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}

                {loading && (
                    <div className="flex gap-3 max-w-[85%] self-start">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            AI
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-tl-sm shadow-xs flex items-center gap-2 text-xs">
                            <span className="material-symbols-outlined text-base animate-spin text-[#ff2e63]">progress_activity</span>
                            <span>Thinking &amp; formulating response...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Writing Space: Elevated, spacious, and comfortably anchored */}
            <div className="flex-shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-md p-3 sm:p-4 focus-within:border-[#ff2e63] focus-within:ring-2 focus-within:ring-[#ff2e63]/20 transition-all">
                <div className="flex items-end gap-3">
                    <textarea
                        ref={textareaRef}
                        rows={2}
                        placeholder="Ask anything about interview concepts, system design, or your skill gaps... (Press Enter to send)"
                        value={input}
                        onChange={handleInputResize}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[48px] max-h-[140px]"
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        title="Send message"
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ff2e63] to-[#e11d48] hover:from-[#ff416c] hover:to-[#f43f5e] text-white flex items-center justify-center shadow-md shadow-[#ff2e63]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] font-code text-slate-400">
                    <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Shift + Enter</kbd> for new line</span>
                    <span>PrepAI Assistant v1.0</span>
                </div>
            </div>
        </div>
    )
}

export default Assistant
