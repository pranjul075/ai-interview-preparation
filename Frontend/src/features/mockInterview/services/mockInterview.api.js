import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

/**
 * Start Mock Interview
 */
export const startMockInterview = async ({
    interviewReportId,
    targetRole,
    interviewType,
    duration,
    difficulty
}) => {
    try {
        const response = await api.post("/api/mock-interview/start", {
            interviewReportId: interviewReportId || undefined,
            targetRole,
            interviewType,
            duration: Number(duration),
            difficulty
        })
        return response.data
    } catch (error) {
        console.error("Start interview error:", error)
        const message = error.response?.data?.message || "Failed to start mock interview session."
        throw new Error(message)
    }
}

/**
 * Submit Answer
 */
export const submitAnswer = async (id, answer) => {
    try {
        const response = await api.post(`/api/mock-interview/${id}/answer`, {
            answer
        })
        return response.data
    } catch (error) {
        console.error("Submit answer error:", error)
        const message = error.response?.data?.message || "Failed to submit answer."
        throw new Error(message)
    }
}

/**
 * Finish Mock Interview
 */
export const finishMockInterview = async (id) => {
    try {
        const response = await api.post(`/api/mock-interview/${id}/finish`)
        return response.data
    } catch (error) {
        console.error("Finish interview error:", error)
        const message = error.response?.data?.message || "Failed to finalize interview evaluation."
        throw new Error(message)
    }
}

/**
 * Get Mock Interview by ID
 */
export const getMockInterview = async (id) => {
    try {
        const response = await api.get(`/api/mock-interview/${id}`)
        return response.data
    } catch (error) {
        console.error("Get interview error:", error)
        const message = error.response?.data?.message || "Failed to fetch interview session."
        throw new Error(message)
    }
}

/**
 * Get All Mock Interviews
 */
export const getAllMockInterviews = async () => {
    try {
        const response = await api.get("/api/mock-interview")
        return response.data
    } catch (error) {
        console.error("Get all interviews error:", error)
        const message = error.response?.data?.message || "Failed to fetch mock interviews history."
        throw new Error(message)
    }
}

/**
 * Get Mock Interview Report
 */
export const getMockInterviewReport = async (id) => {
    try {
        const response = await api.get(`/api/mock-interview/${id}/report`)
        return response.data
    } catch (error) {
        console.error("Get interview report error:", error)
        const message = error.response?.data?.message || "Failed to fetch interview evaluation report."
        throw new Error(message)
    }
}

/**
 * Download Mock Interview PDF Report
 */
export const downloadMockInterviewPdf = async (id) => {
    try {
        const response = await api.get(`/api/mock-interview/${id}/report/pdf`, {
            responseType: "blob"
        })

        const blob = new Blob([response.data], { type: "application/pdf" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `PrepAI_Interview_Report_${id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return true
    } catch (error) {
        console.error("Download PDF error:", error)
        const message = error.response?.data?.message || "Failed to download evaluation report PDF."
        throw new Error(message)
    }
}

export default api
