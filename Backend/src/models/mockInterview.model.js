const mongoose = require("mongoose")

const transcriptEntrySchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["interviewer", "candidate"],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    topic: {
        type: String,
        default: "General"
    },
    questionType: {
        type: String,
        enum: ["intro", "technical", "behavioral", "project", "problem_solving", "wrap_up"],
        default: "technical"
    },
    interviewerNote: {
        type: String
    }
}, {
    _id: false
})

const finalReportSchema = new mongoose.Schema({
    overallScore: { type: Number, min: 0, max: 100 },
    technicalScore: { type: Number, min: 0, max: 100 },
    problemSolvingScore: { type: Number, min: 0, max: 100 },
    communicationScore: { type: Number, min: 0, max: 100 },
    relevanceScore: { type: Number, min: 0, max: 100 },
    depthScore: { type: Number, min: 0, max: 100 },
    projectKnowledgeScore: { type: Number, min: 0, max: 100 },
    overallAssessment: { type: String },
    strengths: [ { type: String } ],
    weaknesses: [ { type: String } ],
    interviewHighlights: [ { type: String } ],
    weakTopics: [ { type: String } ],
    recommendations: [ { type: String } ],
    interviewReadiness: {
        type: String,
        enum: ["Needs Significant Improvement", "Developing", "Almost Ready", "Interview Ready"]
    }
}, {
    _id: false
})

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport"
    },
    targetRole: {
        type: String,
        required: true,
        trim: true,
        default: "Software Engineer"
    },
    jobDescription: {
        type: String,
        default: ""
    },
    interviewType: {
        type: String,
        enum: ["technical", "hr", "mixed", "job_specific"],
        default: "mixed"
    },
    duration: {
        type: Number,
        enum: [10, 20, 30],
        default: 20
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "adaptive"],
        default: "adaptive"
    },
    status: {
        type: String,
        enum: ["in_progress", "completed", "abandoned"],
        default: "in_progress",
        index: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    transcript: [ transcriptEntrySchema ],
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    finalReport: finalReportSchema
}, {
    timestamps: true
})

mockInterviewSchema.index({ user: 1, createdAt: -1 })

const mockInterviewModel = mongoose.model("MockInterview", mockInterviewSchema)

module.exports = mockInterviewModel
