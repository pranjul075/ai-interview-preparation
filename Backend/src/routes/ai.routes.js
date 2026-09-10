const { Router } = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const aiController = require("../controllers/ai.controller")

const aiRouter = Router()

/**
 * @route POST /api/ai/chat
 * @description PrepAI Assistant interactive doubt solving with optional report context
 * @access Private
 */
aiRouter.post("/chat", authMiddleware.authUser, aiController.chatWithPrepAIAssistant)

module.exports = aiRouter
