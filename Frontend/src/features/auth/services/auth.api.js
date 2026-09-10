import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post("/api/auth/register", {
            username,
            email,
            password
        })
        return response.data
    } catch (err) {
        console.error("Registration error details:", {
            message: err.message,
            code: err.code,
            status: err.response?.status,
            data: err.response?.data,
            request: !!err.request,
            response: !!err.response
        })
        const message = err.response?.data?.message || "Registration failed. Please try again."
        throw new Error(message)
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email,
            password
        })
        return response.data
    } catch (err) {
        const message = err.response?.data?.message || "Invalid credentials. Please try again."
        throw new Error(message)
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        console.error("Logout API error:", err)
        return { success: true }
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // Return null if not logged in
        return null
    }
}

export default api