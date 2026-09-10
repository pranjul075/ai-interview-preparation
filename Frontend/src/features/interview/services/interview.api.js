import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

/**
 * Generate Interview Report
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    try {
        const formData = new FormData()
        formData.append("jobDescription", jobDescription)
        formData.append("selfDescription", selfDescription || "")

        if (resumeFile) {
            formData.append("resume", resumeFile)
        }

        const response = await api.post(
            "/api/interview",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )

        return response.data
    } catch (error) {
        console.error("Generate report error:", error)
        const message = error.response?.data?.message || "Failed to generate interview report."
        throw new Error(message)
    }
}

/**
 * Get Interview Report by ID
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || "Failed to fetch interview report."
        throw new Error(message)
    }
}

/**
 * Get All Interview Reports
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview")
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || "Failed to fetch interview reports."
        throw new Error(message)
    }
}

/**
 * Generate Resume PDF
 */
export const generateResumePdf = async (interviewReportId) => {
    try {
        const response = await api.post(
            `/api/interview/resume/pdf/${interviewReportId}`,
            {},
            {
                responseType: "blob"
            }
        )
        return response
    } catch (error) {
        const message = error.response?.data?.message || "Failed to download ATS resume."
        throw new Error(message)
    }
}

export default api