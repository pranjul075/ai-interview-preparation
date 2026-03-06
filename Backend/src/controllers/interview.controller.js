const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * Generate interview report
 */
async function generateInterViewReportController(req, res) {

    try {

        console.log("Request Body:", req.body)
        console.log("Uploaded File:", req.file)

        const { selfDescription, jobDescription } = req.body

        let resumeText = ""

        // If resume uploaded
        if (req.file) {
            const pdfData = await pdfParse(req.file.buffer)
            resumeText = pdfData.text
        }

        // If neither resume nor self description provided
        if (!resumeText && !selfDescription) {
            return res.status(400).json({
                message: "Please upload a resume or provide self description"
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user ? req.user.id : null,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })

    } catch (error) {

        console.error("Error generating report:", error)

        res.status(500).json({
            message: "Error generating interview report"
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
            user: req.user ? req.user.id : null
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

        console.error(error)

        res.status(500).json({
            message: "Server error"
        })
    }
}


/**
 * Get all reports
 */
async function getAllInterviewReportsController(req, res) {

    try {

        const interviewReports = await interviewReportModel
            .find({ user: req.user ? req.user.id : null })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })

    } catch (error) {

        console.error(error)

        res.status(500).json({
            message: "Server error"
        })
    }
}


/**
 * Generate resume PDF
 */
async function generateResumePdfController(req, res) {

    try {

        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
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

        console.error(error)

        res.status(500).json({
            message: "Error generating PDF"
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}