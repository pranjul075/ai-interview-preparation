import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf
} from "../services/interview.api"

import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports
    } = context


    /**
     * Generate Interview Report
     */
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {

        setLoading(true)

        let response = null

        try {

            response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile
            })

            setReport(response.interviewReport)

        } catch (error) {

            console.log("Report generation error:", error)

        } finally {

            setLoading(false)

        }

        return response?.interviewReport
    }


    /**
     * Get Report By ID
     */
    const getReportById = async (id) => {

        setLoading(true)

        let response = null

        try {

            response = await getInterviewReportById(id)

            setReport(response.interviewReport)

        } catch (error) {

            console.log("Error fetching report:", error)

        } finally {

            setLoading(false)

        }

        return response?.interviewReport
    }


    /**
     * Get All Reports
     */
    const getReports = async () => {

        setLoading(true)

        let response = null

        try {

            response = await getAllInterviewReports()

            setReports(response.interviewReports)

        } catch (error) {

            console.log("Error fetching reports:", error)

        } finally {

            setLoading(false)

        }

        return response?.interviewReports
    }


    /**
     * Download Resume PDF
     */
    const getResumePdf = async (interviewReportId) => {

        setLoading(true)

        try {

            const response = await generateResumePdf(interviewReportId)

            const blob = new Blob([response.data], {
                type: "application/pdf"
            })

            const url = window.URL.createObjectURL(blob)

            const link = document.createElement("a")

            link.href = url
            link.download = `resume_${interviewReportId}.pdf`

            document.body.appendChild(link)

            link.click()

            document.body.removeChild(link)

            window.URL.revokeObjectURL(url)

        } catch (error) {

            console.log("Resume download error:", error)

        } finally {

            setLoading(false)

        }
    }


    /**
     * Auto fetch reports
     */
    useEffect(() => {

        if (interviewId) {

            getReportById(interviewId)

        } else {

            getReports()

        }

    }, [interviewId])


    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }
}