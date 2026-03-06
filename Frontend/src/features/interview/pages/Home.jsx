import React, { useState, useRef } from "react"
import "../style/home.scss"
import { useInterview } from "../hooks/useInterview"
import { useNavigate } from "react-router"

const Home = () => {

    const { loading, generateReport, reports } = useInterview()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeName, setResumeName] = useState("")

    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleGenerateReport = async () => {

        const resumeFile = resumeInputRef.current?.files?.[0]

        console.log("Job Description:", jobDescription)
        console.log("Self Description:", selfDescription)
        console.log("Resume File:", resumeFile)

        // Validation
        if (!jobDescription) {
            alert("Please paste a Job Description")
            return
        }

        if (!resumeFile && !selfDescription) {
            alert("Upload Resume OR write Self Description")
            return
        }

        try {

            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            })

            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            } else {
                alert("Failed to generate report")
            }

        } catch (error) {
            console.error(error)
            alert("Server error while generating report")
        }
    }

    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Generating your AI interview plan...</h1>
            </main>
        )
    }

    return (
        <div className="home-page">

            {/* HEADER */}
            <header className="page-header">
                <h1>
                    Create Your Custom <span className="highlight">Interview Plan</span>
                </h1>
                <p>
                    Let AI analyze the job description and your profile to build a
                    personalized interview strategy.
                </p>
            </header>

            {/* CARD */}
            <div className="interview-card">

                <div className="interview-card__body">

                    {/* LEFT PANEL */}
                    <div className="panel panel--left">

                        <div className="panel__header">
                            <h2>Target Job Description</h2>
                        </div>

                        <textarea
                            className="panel__textarea"
                            placeholder="Paste the full job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />

                    </div>

                    {/* DIVIDER */}
                    <div className="panel-divider" />

                    {/* RIGHT PANEL */}
                    <div className="panel panel--right">

                        <div className="panel__header">
                            <h2>Your Profile</h2>
                        </div>

                        {/* RESUME UPLOAD */}
                        <div className="upload-section">

                            <label className="section-label">
                                Upload Resume
                            </label>

                            <label className="dropzone" htmlFor="resume">

                                <p className="dropzone__title">
                                    Click to upload or drag & drop
                                </p>

                                <p className="dropzone__subtitle">
                                    PDF or DOCX (Max 5MB)
                                </p>

                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type="file"
                                    id="resume"
                                    name="resume"
                                    accept=".pdf,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            setResumeName(file.name)
                                        }
                                    }}
                                />

                                {resumeName && (
                                    <p style={{ marginTop: "10px", color: "green" }}>
                                        Uploaded: {resumeName}
                                    </p>
                                )}

                            </label>

                        </div>

                        {/* OR */}
                        <div className="or-divider">
                            <span>OR</span>
                        </div>

                        {/* SELF DESCRIPTION */}
                        <div className="self-description">

                            <label className="section-label">
                                Quick Self Description
                            </label>

                            <textarea
                                className="panel__textarea panel__textarea--short"
                                placeholder="Write about your skills and experience..."
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                            />

                        </div>

                        {/* INFO */}
                        <div className="info-box">
                            <p>
                                Either a <strong>Resume</strong> or
                                <strong> Self Description</strong> is required.
                            </p>
                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="interview-card__footer">

                    <span className="footer-info">
                        AI Powered Interview Strategy
                    </span>

                    <button
                        onClick={handleGenerateReport}
                        className="generate-btn"
                    >
                        Generate My Interview Strategy
                    </button>

                </div>

            </div>

            {/* RECENT REPORTS */}
            {reports && reports.length > 0 && (

                <section className="recent-reports">

                    <h2>My Recent Interview Plans</h2>

                    <ul className="reports-list">

                        {reports.map((report) => (

                            <li
                                key={report._id}
                                className="report-item"
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >

                                <h3>{report.title || "Untitled Position"}</h3>

                                <p className="report-meta">
                                    Generated on{" "}
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </p>

                                <p className="match-score">
                                    Match Score: {report.matchScore}%
                                </p>

                            </li>

                        ))}

                    </ul>

                </section>

            )}

            {/* FOOTER */}
            <footer className="page-footer">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </footer>

        </div>
    )
}

export default Home