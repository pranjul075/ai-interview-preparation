const { Router } = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const mockInterviewController = require("../controllers/mockInterview.controller")

const mockInterviewRouter = Router()

/**
 * @route POST /api/mock-interview/start
 * @description Start new mock interview session
 * @access Private
 */
mockInterviewRouter.post("/start", authMiddleware.authUser, mockInterviewController.startMockInterview)

/**
 * @route POST /api/mock-interview/:id/answer
 * @description Submit answer and receive dynamic follow-up
 * @access Private
 */
mockInterviewRouter.post("/:id/answer", authMiddleware.authUser, mockInterviewController.submitAnswer)

/**
 * @route POST /api/mock-interview/:id/finish
 * @description Conclude mock interview and trigger final evaluation
 * @access Private
 */
mockInterviewRouter.post("/:id/finish", authMiddleware.authUser, mockInterviewController.finishMockInterview)

/**
 * @route GET /api/mock-interview
 * @description Get all past mock interviews of logged in user
 * @access Private
 */
mockInterviewRouter.get("/", authMiddleware.authUser, mockInterviewController.getAllMockInterviews)

/**
 * @route GET /api/mock-interview/:id
 * @description Get specific mock interview details and transcript
 * @access Private
 */
mockInterviewRouter.get("/:id", authMiddleware.authUser, mockInterviewController.getMockInterviewById)

/**
 * @route GET /api/mock-interview/:id/report
 * @description Get final mock interview evaluation report
 * @access Private
 */
mockInterviewRouter.get("/:id/report", authMiddleware.authUser, mockInterviewController.getMockInterviewReport)

/**
 * @route GET /api/mock-interview/:id/report/pdf
 * @description Download PDF evaluation report
 * @access Private
 */
mockInterviewRouter.get("/:id/report/pdf", authMiddleware.authUser, mockInterviewController.downloadMockInterviewPdf)
mockInterviewRouter.post("/:id/report/pdf", authMiddleware.authUser, mockInterviewController.downloadMockInterviewPdf)

module.exports = mockInterviewRouter
