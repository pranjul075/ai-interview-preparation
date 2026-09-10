const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
]

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
            return callback(null, true)
        }
        return callback(new Error("CORS not allowed for this origin: " + origin))
    },
    credentials: true
}))

// Debug: log every incoming request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | Origin: ${req.headers.origin || 'none'}`)
    next()
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const aiRouter = require("./routes/ai.routes")
const mockInterviewRouter = require("./routes/mockInterview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/ai", aiRouter)
app.use("/api/mock-interview", mockInterviewRouter)

// Global unhandled error middleware
app.use((err, req, res, next) => {
    console.error("Unhandled API error:", err)
    res.status(err.status || 500).json({
        message: err.message || "An unexpected error occurred."
    })
})

module.exports = app