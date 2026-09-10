const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * Generate interview report
 */
async function generateInterViewReportController(req, res) {
    try {
        console.log("[ANALYSIS] Request received")
        const isAuth = !!(req.user && req.user.id)
        console.log(`[ANALYSIS] User authenticated: ${isAuth}`)

        if (!isAuth) {
            return res.status(401).json({
                message: "Unauthorized. Please log in to generate an interview report."
            })
        }

        const { selfDescription, jobDescription } = req.body
        const hasResume = !!req.file
        const hasJD = !!(jobDescription && jobDescription.trim())

        console.log(`[ANALYSIS] Resume received: ${hasResume}`)
        console.log(`[ANALYSIS] JD received: ${hasJD}`)

        if (!hasJD) {
            return res.status(400).json({
                message: "Please provide a target job description."
            })
        }

        let resumeText = ""

        // If resume uploaded
        if (req.file) {
            try {
                const pdfData = await pdfParse(req.file.buffer)
                resumeText = (pdfData.text || "").trim()
                console.log(`[ANALYSIS] Resume text length: ${resumeText.length}`)

                if (resumeText.length < 20 && (!selfDescription || !selfDescription.trim())) {
                    return res.status(400).json({
                        message: "The uploaded PDF contains little or no readable text. Please upload a standard text-based PDF resume or enter a self-description."
                    })
                }
            } catch (fileErr) {
                console.error("Error parsing resume PDF:", fileErr)
                return res.status(400).json({
                    message: "Please upload a valid PDF resume."
                })
            }
        }

        // If neither resume nor self description provided
        if (!resumeText && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({
                message: "Please upload a resume or provide self description"
            })
        }

        console.log("[ANALYSIS] Initiating Groq AI analysis...")
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription.trim()
        })
        console.log("[ANALYSIS] AI analysis completed successfully")

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription.trim(),
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })

    } catch (error) {
        console.error("Error generating report:", error)
        res.status(500).json({
            message: error.message || "AI service is temporarily unavailable. Please try again."
        })
    }
}

/**
 * Get interview report by ID
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })

    } catch (error) {
        console.error("Error fetching report:", error)
        res.status(500).json({
            message: "Server error fetching report"
        })
    }
}

/**
 * Get all reports
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })

    } catch (error) {
        console.error("Error fetching reports:", error)
        res.status(500).json({
            message: "Server error fetching reports"
        })
    }
}

/**
 * Generate resume PDF
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        // Strict ownership check: Must belong to req.user.id
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found or unauthorized."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)

    } catch (error) {
        console.error("Error generating resume PDF:", error)
        res.status(500).json({
            message: "Error generating resume PDF"
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}