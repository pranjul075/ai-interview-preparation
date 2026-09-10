import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading } = context
    const [authError, setAuthError] = useState(null)

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        setAuthError(null)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return { success: true, user: data.user }
        } catch (err) {
            setAuthError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        setAuthError(null)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return { success: true, user: data.user }
        } catch (err) {
            setAuthError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.error("Logout error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let isMounted = true

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                if (isMounted) {
                    setUser(data?.user || null)
                }
            } catch (err) {
                if (isMounted) setUser(null)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        getAndSetUser()

        return () => {
            isMounted = false
        }
    }, [setUser, setLoading])

    return {
        user,
        loading,
        authError,
        setAuthError,
        handleRegister,
        handleLogin,
        handleLogout
    }
}