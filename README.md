<div align="center">

#  PrepAI
### AI-Powered Interview Preparation Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3%2070B-F55036)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#-license)

*From resume gap analysis to timed AI mock interviews with 6‑dimension scoring and downloadable PDF reports.*

</div>

---

##  Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [Mock Interview Flow](#-mock-interview-session-flow)
- [Data Model](#-data-model)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Configuration](#️-environment-configuration)
- [Security Highlights](#-security--architecture-highlights)
- [Author](#-author)

---

##  Overview

**PrepAI** is a production-grade AI interview preparation platform that guides a candidate through the full prep lifecycle:

1. **Analyze** — upload a resume + target job description to surface skill gaps and a match score.
2. **Learn** — clear doubts with a context-aware AI mentor grounded in that specific report.
3. **Practice** — take a real-time, time-boxed AI mock interview with adaptive follow-ups.
4. **Improve** — receive a 6-dimension evaluation, a downloadable PDF report, and track growth over time.

---

##  Key Features

###  1. Resume & Job Description Analysis
- **PDF Resume Upload & Text Extraction** — parses resumes (up to 5MB PDF) and extracts skills, projects, and domain experience.
- **Match Score & Skill Gap Detection** — calculates a 0–100% match score and tags missing competencies by severity (`low`, `medium`, `high`).
- **Dynamic Question Generation** — generates targeted technical + behavioral questions with interviewer intent and model answers.
- **Personalized Preparation Roadmap** — a structured, day-by-day plan focused on closing detected gaps.

###  2. PrepAI Assistant (AI Doubt Solver)
- **Context-Aware Mentorship** — grounded in the candidate's active report (job description, match score, gaps, questions).
- **Interactive Technical Coaching** — explains system design trade-offs and gives coding / STAR-method examples.
- **Strict Domain Focus** — stays scoped to technical mastery, HR strategy, and prep rather than acting as a generic chatbot.

###  3. Full AI Mock Interview Agent
- **Flexible Configuration** — 10 / 20 / 30-minute sessions across Technical, HR-Behavioral, Mixed, or Job-specific tracks, at Easy / Medium / Hard / Adaptive difficulty.
- **Realistic Interviewer Simulation** — introduces the session, sets expectations, and asks one question at a time.
- **Adaptive Follow-Up Questioning** — probes incomplete answers or transitions topics naturally, without disruptive mid-session score cards.
- **Synchronized Dual-Timer System** — client-side countdown backed by strict server-side timestamp validation (`startedAt`, `expiresAt`, `completedAt`).

###  4. Post-Interview Evaluation & PDF Reports
Evaluates the full transcript across **6 core dimensions** (0–100):

| Dimension | What it measures |
|---|---|
| Technical Knowledge | Depth and accuracy of technical answers |
| Problem Solving & Critical Thinking | Approach to unfamiliar or hard questions |
| Communication Clarity | Structure and clarity of explanations |
| Answer Relevance | How directly answers address what was asked |
| Depth & Architectural Trade-offs | System-design maturity |
| Project & Practical Experience | Real-world grounding of examples |

- **Actionable Feedback** — executive assessment, strengths, weaknesses, reinforcement topics, next steps.
- **Interview Readiness Rating** — `Needs Significant Improvement` → `Developing` → `Almost Ready` → `Interview Ready`.
- **Downloadable PDF Reports** — branded reports via headless Puppeteer.
- **ATS Resume Generation** — clean, ATS-optimized resumes as PDFs.

### 📈 5. Interview History & Performance Comparison
- **Session Tracking** — every mock interview and resume analysis lives on a unified dashboard.
- **Growth Trends** — automatically computed performance trends across attempts.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        UI["React 19 + Vite SPA<br/>SCSS · React Router 7 · Axios"]
    end

    subgraph Edge["🔐 Edge / Auth"]
        JWT["JWT Auth Middleware<br/>HttpOnly Cookies · Token Blacklist"]
    end

    subgraph API["⚙️ Node.js / Express 5 Backend"]
        Router["REST API Router"]
        FileMW["File Middleware<br/>Multer · 5MB PDF Filter"]
        ResumeCtrl["Resume & JD<br/>Analysis Controller"]
        MentorCtrl["PrepAI Assistant<br/>Controller"]
        MockCtrl["Mock Interview Controller<br/>Dual-Timer · Session Lifecycle"]
        ReportCtrl["Evaluation & Report<br/>Controller"]
        AIService["AI Service Layer<br/>Groq SDK · Zod Validation · Retry/Fallback"]
        PDFEngine["Report Engine<br/>Puppeteer Headless PDF"]
    end

    subgraph Data["🗄️ Data Layer"]
        Mongo[("MongoDB Atlas<br/>Users · InterviewReports<br/>MockInterviews · BlacklistedTokens")]
    end

    subgraph External["☁️ External Services"]
        Groq["Groq Cloud API<br/>Llama 3.3 70B Versatile /<br/>Llama 3.1 8B Instant"]
    end

    UI -- "REST calls + HttpOnly cookies" --> JWT
    JWT --> Router
    Router --> FileMW
    FileMW --> ResumeCtrl
    Router --> MentorCtrl
    Router --> MockCtrl
    Router --> ReportCtrl

    ResumeCtrl --> AIService
    MentorCtrl --> AIService
    MockCtrl --> AIService
    ReportCtrl --> AIService
    ReportCtrl --> PDFEngine

    AIService <--> Groq
    ResumeCtrl <--> Mongo
    MentorCtrl <--> Mongo
    MockCtrl <--> Mongo
    ReportCtrl <--> Mongo

    PDFEngine -- "PDF stream" --> UI

    style Client fill:#1a1a2e,stroke:#61DAFB,color:#fff
    style Edge fill:#1a1a2e,stroke:#f5a623,color:#fff
    style API fill:#1a1a2e,stroke:#339933,color:#fff
    style Data fill:#1a1a2e,stroke:#47A248,color:#fff
    style External fill:#1a1a2e,stroke:#F55036,color:#fff
```

---

## 🎯 Mock Interview Session Flow

```mermaid
sequenceDiagram
    actor Candidate
    participant FE as React Frontend
    participant BE as Express Backend
    participant Timer as Dual-Timer System
    participant AI as Groq AI Engine
    participant DB as MongoDB

    Candidate->>FE: Configure session (duration, track, difficulty)
    FE->>BE: POST /mock-interview/start
    BE->>DB: Create session (startedAt, expiresAt)
    BE->>Timer: Initialize server-side timer
    BE->>AI: Generate opening question
    AI-->>BE: Question #1
    BE-->>FE: Session started + Question #1
    FE-->>Candidate: Show question + running countdown

    loop Until time expires or interview ends
        Candidate->>FE: Submit answer
        FE->>BE: POST /mock-interview/answer
        BE->>Timer: Validate against expiresAt
        BE->>AI: Evaluate answer + decide follow-up/topic switch
        AI-->>BE: Next question or probe
        BE->>DB: Persist transcript turn
        BE-->>FE: Next question
        FE-->>Candidate: Show next question
    end

    FE->>BE: POST /mock-interview/complete (or timer expiry)
    BE->>AI: Evaluate full transcript (6 dimensions)
    AI-->>BE: Scores + strengths + weaknesses + readiness rating
    BE->>DB: Save InterviewReport
    BE->>BE: Generate PDF via Puppeteer
    BE-->>FE: Evaluation summary + PDF download link
    FE-->>Candidate: Show results dashboard
```

---

## 🗃️ Data Model

```mermaid
erDiagram
    USER ||--o{ INTERVIEW_REPORT : owns
    USER ||--o{ MOCK_INTERVIEW : owns
    USER ||--o{ BLACKLISTED_TOKEN : invalidates
    INTERVIEW_REPORT ||--o{ MOCK_INTERVIEW : "informs context for"

    USER {
        ObjectId id PK
        string name
        string email
        string passwordHash
        date createdAt
    }
    INTERVIEW_REPORT {
        ObjectId id PK
        ObjectId user FK
        string jobDescription
        int matchScore
        array skillGaps
        array generatedQuestions
        array roadmap
        date createdAt
    }
    MOCK_INTERVIEW {
        ObjectId id PK
        ObjectId user FK
        ObjectId reportRef FK
        string track
        string difficulty
        int durationMinutes
        date startedAt
        date expiresAt
        date completedAt
        array transcript
        object evaluation
        string readinessRating
    }
    BLACKLISTED_TOKEN {
        ObjectId id PK
        ObjectId user FK
        string token
        date expiresAt
    }
```

---

## 🧠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, SCSS, Axios |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose 9, JWT Auth, bcryptjs, Multer, Puppeteer, Zod |
| **AI Engine** | Groq Cloud API (`groq-sdk`) — `llama-3.3-70b-versatile` / `llama-3.1-8b-instant` |

---

##  Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/pranjul075/ai-interview-preparation.git
cd ai-interview-preparation
```

### 2. Setup and run Backend
```bash
cd Backend
npm install
npm run dev
```
The server starts on `http://localhost:3000`.

### 3. Setup and run Frontend
```bash
cd ../Frontend
npm install
npm run dev
```
The client starts on `http://localhost:5173`.

---

## Environment Configuration

Create a `.env` file in the `Backend` directory (see `.env.example`):

```env
# MongoDB Connection URI
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/prepai
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/prepai

# Server Port
PORT=3000

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Groq Cloud API Key (Get a free key at https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Groq Model (Default: llama-3.3-70b-versatile)
GROQ_MODEL=llama-3.3-70b-versatile
```

For the `Frontend` (optional custom API URL):
```env
VITE_API_URL=http://localhost:3000
```

---

## 🔐 Security & Architecture Highlights

- **Ownership Enforcement** — every report, resume, mock interview session, and PDF download endpoint verifies `user === req.user.id`. Users cannot access private data by guessing IDs.
- **Hardened Cookies** — JWT tokens issued with `httpOnly: true`, `sameSite: "lax"`, and `secure` in production.
- **Fail-Safe AI Layer** — the Groq service uses strict Zod schema parsing, retry mechanisms for transient errors, and robust fallbacks so API rate limits or malformed responses never crash the Express server.
- **Database Optimization** — indexed queries on `user`, `createdAt`, plus a TTL index on token blacklists.

---
