# ⚡ PrepAI — AI-Powered Interview Preparation Platform

PrepAI is a production-grade AI-powered interview preparation and simulated mock interview platform. It guides candidates through the complete journey: from analyzing their resume against a target job description to uncover skill gaps and build a personalized roadmap, to clearing doubts with a context-aware AI mentor, and finally practicing in real-time, time-aware AI mock interviews with comprehensive multi-dimensional evaluations and downloadable PDF reports.

---

## 🚀 Key Features

### 📄 1. Resume & Job Description Analysis
- **PDF Resume Upload & Text Extraction**: Parses resumes (up to 5MB PDF) and extracts key skills, projects, and domain experience.
- **Match Score & Skill Gap Detection**: Calculates candidate-to-job match percentage (0–100%) and highlights missing competencies tagged by severity (`low`, `medium`, `high`).
- **Dynamic Question Generation**: Generates targeted technical and behavioral interview questions with the interviewer's intention and model answers.
- **Personalized Preparation Roadmap**: Generates a structured, day-by-day preparation schedule focused on eliminating detected skill gaps.

### 💬 2. PrepAI Assistant (AI Doubt Solver)
- **Context-Aware Mentorship**: Grounded in the candidate's active interview report context (target job description, match score, detected skill gaps, and generated questions).
- **Interactive Technical Coaching**: Solves conceptual doubts, explains system design trade-offs, and provides concrete coding or STAR-method examples.
- **Strict Domain Focus**: Dedicated to technical mastery, HR strategy, and candidate preparation rather than behaving like a generic chatbot.

### 🎯 3. Full AI Mock Interview Agent
- **Flexible Configuration**: Choose 10, 20, or 30-minute sessions across Technical, HR / Behavioral, Mixed, or Job-specific interview tracks with Easy, Medium, Hard, or Adaptive difficulty.
- **Realistic Interviewer Simulation**: Introduces the session, sets expectations, asks one question at a time, and actively listens to candidate answers.
- **Adaptive Follow-Up Questioning**: Acknowledges candidate responses and dynamically probes deeper into incomplete answers or transitions naturally across core topics without disrupting the candidate with mid-session score cards.
- **Synchronized Dual-Timer System**: Client-side countdown timer synchronized with strict server-side timestamp validation (`startedAt`, `expiresAt`, `completedAt`).

### 📊 4. Comprehensive Post-Interview Evaluation & PDF Reports
- **Holistic Session Assessment**: When the interview concludes or time expires, the AI evaluates the complete transcript across 6 core dimensions (0–100):
  - **Technical Knowledge**
  - **Problem Solving & Critical Thinking**
  - **Communication Clarity**
  - **Answer Relevance**
  - **Depth & Architectural Trade-offs**
  - **Project & Practical Experience**
- **Actionable Feedback**: Delivers an executive assessment, demonstrated strengths, specific weaknesses, topics requiring reinforcement, and actionable preparation steps.
- **Interview Readiness Rating**: Clear classification (`Needs Significant Improvement`, `Developing`, `Almost Ready`, `Interview Ready`).
- **Downloadable PDF Reports**: Professional evaluation reports exported via headless Puppeteer with PrepAI branding.
- **ATS Resume Generation**: Generates clean, ATS-optimized resumes downloadable as PDFs.

### 📈 5. Interview History & Performance Comparison
- **Session Tracking**: Track previous mock interviews and resume analyses on the unified dashboard.
- **Growth Trends**: Automatically computes and visualizes verified performance improvement across mock interview attempts.

---

## 🧠 Tech Stack

- **Frontend**: React 19, Vite, React Router 7, SCSS, Axios
- **Backend**: Node.js, Express 5, MongoDB, Mongoose 9, JWT Authentication, bcryptjs, Multer, Puppeteer, Zod
- **AI Engine**: Groq Cloud API (`groq-sdk`, `llama-3.3-70b-versatile` / `llama-3.1-8b-instant`)

---

## 🏗️ System Architecture

```
Candidate (Browser)
       │
       ▼
React 19 Frontend (Vite + SCSS)
       │ (REST APIs + HttpOnly Cookies)
       ▼
Node.js & Express Backend
       ├── Auth Middleware (JWT + Token Blacklist)
       ├── File Middleware (Multer, 5MB PDF Filter)
       ├── Mock Interview Controller (Dual-Timer, Session Lifecycle)
       ├── AI Service Layer (Groq SDK + Zod Validation + Resilience)
       └── Report Engine (Puppeteer Headless PDF Generator)
       │
       ├── MongoDB (Users, InterviewReports, MockInterviews, BlacklistedTokens)
       └── Groq Cloud (Llama 3.3 70B Versatile for high-speed inference)
```

---

## ⚙️ Environment Configuration

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

## 🚀 Getting Started

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
The server will start on `http://localhost:3000`.

### 3. Setup and run Frontend
```bash
cd ../Frontend
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 🔐 Security & Architecture Highlights

- **Ownership Enforcement**: Every report, resume, mock interview session, and PDF download endpoint verifies `user === req.user.id`. Users cannot access private data by guessing IDs.
- **Hardened Cookies**: JWT tokens are issued with `httpOnly: true`, `sameSite: "lax"`, and `secure` in production.
- **Fail-Safe AI Layer**: The Groq service uses strict Zod schema parsing, retry mechanisms for transient errors, and robust fallbacks so that API rate limits or malformed responses never crash the Express server.
- **Database Optimization**: Indexed queries for `user`, `createdAt`, and TTL index on token blacklists.

---

## 👨‍💻 Author

**Pranjul Katiyar**  
- GitHub: [pranjul075](https://github.com/pranjul075)  
- LinkedIn: [pranjulkatiyar](https://linkedin.com/in/pranjulkatiyar)
