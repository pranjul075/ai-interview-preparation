import { createBrowserRouter, Navigate } from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/Protected"
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/Interview"
import Assistant from "./features/assistant/pages/Assistant"
import MockInterviewSetup from "./features/mockInterview/pages/MockInterviewSetup"
import MockInterviewSession from "./features/mockInterview/pages/MockInterviewSession"
import MockInterviewReport from "./features/mockInterview/pages/MockInterviewReport"

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "/assistant",
        element: <Protected><Assistant /></Protected>
    },
    {
        path: "/mock-interview",
        element: <Protected><MockInterviewSetup /></Protected>
    },
    {
        path: "/mock-interview/:id",
        element: <Protected><MockInterviewSession /></Protected>
    },
    {
        path: "/mock-interview/:id/report",
        element: <Protected><MockInterviewReport /></Protected>
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
])