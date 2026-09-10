import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

/**
 * Ask PrepAI Assistant
 * @param {Object} params
 * @param {string} params.message
 * @param {string} [params.interviewReportId]
 * @param {Array} [params.conversationHistory]
 */
export const askAssistant = async ({ message, interviewReportId, conversationHistory }) => {
    try {
        const response = await api.post("/api/ai/chat", {
            message,
            interviewReportId: interviewReportId || undefined,
            conversationHistory: conversationHistory || []
        })
        return response.data
    } catch (error) {
        console.error("PrepAI Assistant API Error:", error)
        const message = error.response?.data?.message || "AI assistant is currently unavailable."
        throw new Error(message)
    }
}

export default api
