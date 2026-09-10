const { askPrepAIAssistant } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @name chatWithPrepAIAssistant
 * @route POST /api/ai/chat
 * @description Ask interview preparation doubts and questions, with optional authenticated report context
 * @access Private
 */
async function chatWithPrepAIAssistant(req, res) {
    try {
        const { message, interviewReportId, conversationHistory } = req.body

        console.log("[ASSISTANT] Request received")
        const isAuth = !!(req.user && req.user.id)
        console.log(`[ASSISTANT] User authenticated: ${isAuth}`)

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Please provide a question or message."
            })
        }

        let reportContext = null

        // If report ID provided, strictly verify user ownership
        if (interviewReportId) {
            reportContext = await interviewReportModel.findOne({
                _id: interviewReportId,
                user: req.user.id
            })

            if (!reportContext) {
                return res.status(404).json({
                    message: "Specified interview report not found or unauthorized."
                })
            }
        }
        console.log(`[ASSISTANT] Context applied: ${!!reportContext}`)

        const reply = await askPrepAIAssistant({
            message: message.trim(),
            reportContext,
            conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : []
        })
        console.log("[ASSISTANT] Reply generated successfully")

        res.status(200).json({
            reply,
            contextApplied: !!reportContext
        })

    } catch (error) {
        console.error("PrepAI Assistant Error:", error)
        res.status(500).json({
            message: error.message || "AI assistant is temporarily unavailable. Please try again."
        })
    }
}

module.exports = {
    chatWithPrepAIAssistant
}
