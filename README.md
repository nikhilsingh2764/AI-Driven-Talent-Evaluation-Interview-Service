# 🤖 AI Interview Application

An AI-powered interview preparation platform that analyzes a user's resume, generates personalized interview questions, conducts structured interview sessions, and produces AI-based performance reports.

The backend is built with **Node.js, Express.js, MongoDB, Redis, OpenRouter, Cloudinary, and JWT authentication**.

The application follows a modular layered architecture separating **routes, controllers, services, repositories, models, validators, middleware, and utilities**.

---

## 🚀 Project Links

| Resource              | Link                                                        |
| --------------------- | ----------------------------------------------------------- |
| 💻 GitHub Repository  | https://github.com/nikhilsingh2764/AI-Interview-Application |
| ⚙️ Backend            | Add deployed backend URL                                    |
| 🌐 Frontend           | Add deployed frontend URL                                   |
| 🧪 Postman Collection | Add Postman collection link                                 |

---

## 📋 Table of Contents

* [Overview](#-overview)
* [Problem & Solution](#-problem--solution)
* [Key Features](#-key-features)
* [System Architecture](#-system-architecture)
* [Complete Application Flow](#-complete-application-flow)
* [Authentication Flow](#-authentication-flow)
* [Resume Processing Flow](#-resume-processing-flow)
* [Resume Analysis Flow](#-resume-analysis-flow)
* [AI Interview Generation Flow](#-ai-interview-generation-flow)
* [Interview Session Flow](#-interview-session-flow)
* [AI Interview Report Flow](#-ai-interview-report-flow)
* [Performance Flow](#-performance-flow)
* [Redis & Caching](#-redis--caching)
* [File Upload Architecture](#-file-upload-architecture)
* [Security](#-security)
* [Validation](#-validation)
* [Error Handling](#-error-handling)
* [Database Design](#️-database-design)
* [Database Relationships](#-database-relationships)
* [Tech Stack](#️-tech-stack)
* [Project Structure](#-project-structure)
* [API Reference](#-api-reference)
* [Environment Variables](#️-environment-variables)
* [Installation](#-installation)
* [API Testing](#-api-testing)
* [Technical Design Decisions](#-technical-design-decisions)
* [Current Limitations](#️-current-limitations)
* [Future Improvements](#-future-improvements)
* [License](#-license)
* [Author](#-author)

---

# 📌 Overview

The AI Interview Application is designed to provide a personalized interview preparation workflow.

Instead of generating generic interview questions, the backend uses the user's uploaded resume and AI-generated resume analysis as context for generating interview questions.

The interview can be configured using:

* Target role
* Experience level
* Difficulty

The AI generates exactly **10 questions** across supported categories:

* Technical
* Behavioral
* System Design
* HR

The user then completes an interview session by answering the generated questions. Once the interview is completed, the answers are sent to the AI for an overall evaluation.

The generated report contains:

* Overall score
* Technical score
* Communication score
* Problem-solving score
* Confidence score
* Strengths
* Weaknesses
* Feedback
* Recommendations
* Interview readiness

The question-generation and report-generation workflows are implemented through dedicated AI utility modules.

---

# 📌 Problem & Solution

## Problem

Traditional interview preparation often relies on generic question lists that do not consider the candidate's actual experience, skills, resume, or target role.

This makes preparation less personalized and makes it difficult to understand where the candidate needs improvement.

## Solution

This application creates a personalized preparation workflow:

```text
Resume
   ↓
Resume Text Extraction
   ↓
AI Resume Analysis
   ↓
Role + Experience + Difficulty
   ↓
Personalized Interview Questions
   ↓
Interview Session
   ↓
Candidate Answers
   ↓
AI Evaluation
   ↓
Interview Report
   ↓
Performance Tracking
```

---

# ✨ Key Features

## 🔐 Authentication

* User registration
* Email verification using OTP
* Login
* JWT authentication
* Access token
* Refresh token
* HTTP-only cookie authentication
* Logout
* Profile management
* Password change
* Forgot password
* Password reset
* Account deactivation
* Account deletion
* Failed-login tracking
* Temporary account locking

The user model stores verification, activation, failed-login-attempt, and account-lock information.

---

## 📄 Resume Management

Users can:

* Upload a resume
* Store the resume in Cloudinary
* Download the uploaded PDF from Cloudinary
* Extract text from the PDF
* Store extracted resume text in MongoDB
* Retrieve their resume
* Replace an existing resume
* Delete their resume

The application currently enforces **one resume per user** through a unique `userId` field in the resume model.

---

## 🤖 AI Resume Analysis

After uploading a resume, the extracted text can be analyzed by AI.

The analysis includes:

* Resume summary
* Technical skills
* Soft skills
* Strengths
* Weaknesses
* Missing skills
* Recommended roles
* Improvement suggestions
* ATS score

The ATS score is constrained between **0 and 100** in the database schema.

---

## 🎯 Personalized Interview Generation

Interview questions are generated using:

```text
Resume Text
+
Resume Analysis
+
Target Role
+
Experience
+
Difficulty
```

The AI prompt requires exactly **10 questions** and supports:

```text
Technical
Behavioral
System Design
HR
```

The AI response must be valid JSON before it is stored in MongoDB.

---

## 🎤 Interview Sessions

The application separates an interview definition from an active interview session.

An interview contains the generated questions.

An interview session tracks:

* User
* Interview
* Current question index
* Session status

Session statuses are:

```text
STARTED
COMPLETED
```

---

## 📝 Answer Management

Each submitted answer stores:

* User
* Interview session
* Interview
* Question index
* Question
* Category
* Answer text
* Audio URL
* Video URL
* Transcript

This gives the system a structure that can support text, audio, and video answer data.

---

## 📊 AI Interview Evaluation

After all questions are answered, the backend sends the complete interview question-answer dataset to the AI.

The AI evaluates:

* Technical knowledge
* Communication
* Problem solving
* Confidence
* Overall performance

It returns scores from **0–100**, strengths, weaknesses, feedback, recommendations, and interview readiness.

---

## 📈 Performance Tracking

The application maintains a performance report containing:

* Overall progress
* Technical progress
* Communication progress
* Problem-solving progress
* Confidence progress
* Strongest skill
* Weakest skill
* Improvement areas
* Study plan
* Summary
* Interview readiness
* Total interviews

---

# 🏗️ System Architecture

```text
                         Client
                           │
                           ▼
                    React Frontend
                           │
                           ▼
                      HTTP / API
                           │
                           ▼
                  ┌─────────────────┐
                  │ Express Server  │
                  └────────┬────────┘
                           │
                           ▼
                    Middleware Layer
                           │
              ┌────────────┼────────────┐
              │            │            │
         Authentication  Validation   Security
              │            │            │
              └────────────┼────────────┘
                           ▼
                         Routes
                           │
                           ▼
                      Controllers
                           │
                           ▼
                        Services
                           │
                           ▼
                      Repositories
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          MongoDB        Redis       External APIs
                                        │
                            ┌───────────┼───────────┐
                            │           │           │
                        OpenRouter  Cloudinary    Email
                            │
                            ▼
                       AI Processing
```

The source structure explicitly separates configuration, controllers, middleware, models, repositories, routes, services, templates, validators, and utilities.

---

# 🔄 Complete Application Flow

```text
User
 │
 ▼
Register / Login
 │
 ▼
Authenticated Session
 │
 ▼
Upload Resume
 │
 ▼
Cloudinary
 │
 ▼
Download PDF
 │
 ▼
Extract Resume Text
 │
 ▼
MongoDB
 │
 ▼
AI Resume Analysis
 │
 ▼
Store Resume Analysis
 │
 ▼
Select Role
 │
Select Experience
 │
Select Difficulty
 │
 ▼
AI Question Generation
 │
 ▼
10 Personalized Questions
 │
 ▼
Create Interview
 │
 ▼
Start Interview Session
 │
 ▼
Answer Questions
 │
 ▼
Save Answers
 │
 ▼
Complete Interview
 │
 ▼
AI Interview Evaluation
 │
 ▼
Interview Report
 │
 ▼
Performance Tracking
```

---

# 🔐 Authentication Flow

```text
Signup
  │
  ▼
Validate User Input
  │
  ▼
Create / Verify Account
  │
  ▼
OTP Verification
  │
  ▼
Login
  │
  ├───────────────┐
  ▼               ▼
Access Token   Refresh Token
  │               │
  └───────┬───────┘
          ▼
    HTTP-only Cookies
          │
          ▼
   Protected API Request
          │
          ▼
 Authentication Middleware
          │
          ▼
      Controller
```

The user schema includes `isVerified`, `isActive`, failed-login counters, and `lockUntil`, supporting the account-security flow.

---

# 📄 Resume Processing Flow

```text
Resume PDF
    │
    ▼
Multer
    │
    ▼
Memory Buffer
    │
    ▼
Cloudinary Upload
    │
    ▼
Secure Cloudinary URL
    │
    ▼
Download PDF
    │
    ▼
PDF Text Extraction
    │
    ▼
Extracted Resume Text
    │
    ▼
MongoDB
```

The implementation uploads the file buffer to Cloudinary, downloads the resulting PDF, extracts its text, and stores the URL, public ID, filename, and extracted text in MongoDB.

---

# 🤖 Resume Analysis Flow

```text
Stored Resume
      │
      ▼
Extracted Text
      │
      ▼
Resume Analysis Prompt
      │
      ▼
OpenRouter AI
      │
      ▼
JSON Response
      │
      ▼
Parse JSON
      │
      ▼
ResumeAnalysis
      │
      ├── Summary
      ├── Technical Skills
      ├── Soft Skills
      ├── Strengths
      ├── Weaknesses
      ├── Missing Skills
      ├── Recommended Roles
      ├── Improvement Suggestions
      └── ATS Score
```

The analysis service generates a prompt from extracted resume text, calls the AI, parses the JSON response, and either creates or updates the user's resume analysis.

---

# 🎯 AI Interview Generation Flow

```text
Resume Text
     │
     ├──────────────┐
     ▼              ▼
Resume Analysis   User Input
                     │
              ┌──────┼──────┐
              ▼      ▼      ▼
            Role Experience Difficulty
              │      │      │
              └──────┼──────┘
                     ▼
               AI Prompt
                     │
                     ▼
                OpenRouter
                     │
                     ▼
              JSON Response
                     │
                     ▼
            Validate / Parse
                     │
                     ▼
               10 Questions
                     │
                     ▼
                Interview
```

The interview service requires both a stored resume and completed resume analysis before generating questions.

---

# 🎤 Interview Session Flow

```text
Create Interview
      │
      ▼
Interview Status = CREATED
      │
      ▼
Start Session
      │
      ▼
Session Status = STARTED
      │
      ▼
currentQuestionIndex = 0
      │
      ▼
Submit Answer
      │
      ▼
Save Answer
      │
      ▼
Increment Question Index
      │
      ├── More Questions
      │       │
      │       ▼
      │   Return Next Question
      │
      └── Last Question
              │
              ▼
       Session = COMPLETED
              │
              ▼
       Interview = COMPLETED
              │
              ▼
       Generate Report
```

The service prevents multiple active sessions for the same interview and tracks the current question index.

---

# 📊 AI Interview Report Flow

```text
Completed Interview
       │
       ▼
Retrieve All Answers
       │
       ▼
Build Question/Answer Dataset
       │
       ▼
OpenRouter AI
       │
       ▼
Evaluate Complete Interview
       │
       ├── Technical Score
       ├── Communication Score
       ├── Problem Solving Score
       ├── Confidence Score
       ├── Overall Score
       ├── Strengths
       ├── Weaknesses
       ├── Feedback
       ├── Recommendations
       └── Interview Readiness
       │
       ▼
InterviewReport
```

The report is generated only after answers exist, and the resulting report is stored in MongoDB.

---

# 📈 Performance Flow

```text
Interview Reports
       │
       ▼
Performance Service
       │
       ▼
Calculate / Generate Progress
       │
       ├── Overall
       ├── Technical
       ├── Communication
       ├── Problem Solving
       └── Confidence
       │
       ▼
Performance Report
       │
       ├── Strongest Skill
       ├── Weakest Skill
       ├── Improvement Areas
       ├── Study Plan
       ├── Summary
       ├── Interview Readiness
       └── Total Interviews
```

The persistence model for performance reporting stores these progress and readiness fields.

---

# ⚡ Redis & Caching

Redis is integrated using `ioredis`.

```text
Express Application
       │
       ▼
    ioredis
       │
       ▼
     Redis
```

The application uses Redis for dashboard-related cache invalidation.

For example, after resume analysis is updated:

```text
Dashboard:<userId>
```

is deleted so stale dashboard information is not retained.

After an interview is completed, dashboard and history-related keys are also invalidated.

---

# ☁️ File Upload Architecture

The resume upload system uses:

* Multer
* Cloudinary
* Streamifier
* PDF parsing

```text
Client
  │
  ▼
Multer
  │
  ▼
File Buffer
  │
  ▼
Cloudinary
  │
  ├── secure_url
  └── public_id
          │
          ▼
       MongoDB
```

When a resume is replaced, the old Cloudinary file is deleted before the new resume is uploaded. When a resume is deleted, the Cloudinary asset and related database records are removed.

---

# 🛡️ Security

The backend uses several security mechanisms.

### Authentication

* JWT
* Access tokens
* Refresh tokens
* HTTP-only cookies
* Protected routes
* bcrypt password hashing

### Account Security

* Email verification
* Failed login attempt tracking
* Account locking
* Active-account checks

### API Security

* Helmet
* CORS
* Rate limiting
* Request validation
* Environment variables
* Protected resources

The backend dependencies confirm JWT, bcrypt, Helmet, CORS, Express Rate Limit, Express Validator, and Zod.

---

# 🚦 Rate Limiting

The project uses:

```text
express-rate-limit
```

for API request protection.

This helps prevent excessive requests against authentication and application endpoints.

Redis is also available through the backend for caching and request-related state.

---

# ✅ Validation

The backend uses both:

* `express-validator`
* `zod`

for request validation.

Validation is kept separate from business logic so controllers do not need to contain all request-validation rules.

---

# 🚨 Error Handling

The application uses centralized API error/response utilities.

```text
Request
   │
   ▼
Route
   │
   ▼
Validation
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├──── Success ────► ApiResponse
   │
   └──── Error
          │
          ▼
       ApiError
          │
          ▼
    Error Middleware
```

Reusable error and response utilities are located under:

```text
src/utils/
├── ApiError.js
└── ApiResponse.js
```

The AI services also explicitly convert invalid AI JSON responses into application errors rather than silently accepting malformed data.

---

# 🗄️ Database Design

The application uses **MongoDB with Mongoose**.

## Main Collections

```text
User
 │
 ├── Resume
 │      │
 │      └── ResumeAnalysis
 │
 ├── Interview
 │      │
 │      └── InterviewSession
 │               │
 │               └── Answers
 │
 ├── InterviewReport
 │
 └── PerformanceReport

OTP
RefreshToken
```

---

# 👤 User

```text
User
├── _id
├── username
├── email
├── password
├── isActive
├── isVerified
├── failedLoginAttempts
├── lockUntil
├── createdAt
└── updatedAt
```

The username and email are unique, while the password is excluded from normal Mongoose queries using `select: false`.

---

# 📄 Resume

```text
Resume
├── _id
├── userId → User
├── fileName
├── resumeUrl
├── publicId
├── extractedText
├── createdAt
└── updatedAt
```

Each user can currently have only one resume because `userId` is unique.

---

# 🧠 Resume Analysis

```text
ResumeAnalysis
├── _id
├── userId → User
├── resumeId → Resume
├── summary
├── technicalSkills[]
├── softSkills[]
├── strengths[]
├── weaknesses[]
├── missingSkills[]
├── atsScore
├── recommendedRoles[]
├── improvementSuggestions[]
├── createdAt
└── updatedAt
```

The analysis also uses a unique user relationship, meaning the current implementation maintains one analysis record per user.

---

# 🎤 Interview

```text
Interview
├── _id
├── userId → User
├── resumeId → Resume
├── analysisId → ResumeAnalysis
├── role
├── experience
├── difficulty
├── questions[]
│    ├── question
│    └── category
├── status
├── createdAt
└── updatedAt
```

Supported interview difficulty values:

```text
Easy
Medium
Hard
```

Supported question categories:

```text
Technical
Behavioral
System Design
HR
```

---

# 🎬 Interview Session

```text
InterviewSession
├── _id
├── userId → User
├── interviewId → Interview
├── currentQuestionIndex
├── status
├── createdAt
└── updatedAt
```

The session tracks progress through the generated interview questions.

---

# 📝 Answer

```text
Answer
├── _id
├── userId → User
├── sessionId → InterviewSession
├── interviewId → Interview
├── questionIndex
├── question
├── category
├── answerText
├── audioUrl
├── videoUrl
├── transcript
├── createdAt
└── updatedAt
```

---

# 📊 Interview Report

```text
InterviewReport
├── _id
├── userId → User
├── sessionId → InterviewSession
├── interviewId → Interview
├── overallScore
├── technicalScore
├── communicationScore
├── problemSolvingScore
├── confidenceScore
├── strengths[]
├── weaknesses[]
├── feedback
├── recommendations[]
├── interviewReadiness
├── status
├── createdAt
└── updatedAt
```

---

# 📈 Performance Report

```text
PerformanceReport
├── _id
├── userId → User
├── overallProgress
├── technicalProgress
├── communicationProgress
├── problemSolvingProgress
├── confidenceProgress
├── strongestSkill
├── weakestSkill
├── improvementAreas[]
├── studyPlan[]
├── summary
├── interviewReadiness
├── totalInterviews
├── status
├── createdAt
└── updatedAt
```

---

# 🔗 Database Relationships

```text
                    ┌──────────┐
                    │   User   │
                    └────┬─────┘
                         │
             ┌───────────┼───────────────┐
             │           │               │
             ▼           ▼               ▼
          Resume     Interview      Performance
             │           │             Report
             ▼           │
      ResumeAnalysis     │
                         ▼
                  InterviewSession
                         │
                         ▼
                       Answer
                         │
                         ▼
                  InterviewReport
```

### Relationship Summary

| Entity                             | Relationship                |
| ---------------------------------- | --------------------------- |
| User → Resume                      | One-to-one                  |
| User → ResumeAnalysis              | One-to-one                  |
| Resume → ResumeAnalysis            | One-to-one reference        |
| User → Interview                   | One-to-many                 |
| Resume → Interview                 | One-to-many reference       |
| ResumeAnalysis → Interview         | One-to-many reference       |
| Interview → InterviewSession       | One-to-many                 |
| InterviewSession → Answer          | One-to-many                 |
| Interview → Answer                 | One-to-many                 |
| InterviewSession → InterviewReport | Report references session   |
| Interview → InterviewReport        | Report references interview |
| User → PerformanceReport           | User-owned reports          |

These relationships are derived from the actual Mongoose references in your models.

---

# 🛠️ Tech Stack

## Backend

| Technology         | Purpose                                    |
| ------------------ | ------------------------------------------ |
| Node.js            | JavaScript runtime                         |
| Express.js         | REST API framework                         |
| MongoDB            | Database                                   |
| Mongoose           | MongoDB ODM                                |
| OpenRouter         | AI model API gateway                       |
| OpenAI SDK         | Client used to communicate with OpenRouter |
| Redis              | Caching                                    |
| ioredis            | Redis client                               |
| JWT                | Authentication                             |
| bcrypt             | Password hashing                           |
| Cloudinary         | Resume file storage                        |
| Multer             | Multipart file uploads                     |
| Streamifier        | File-stream handling                       |
| pdf-parse          | PDF text extraction                        |
| PDFKit             | PDF generation                             |
| Nodemailer         | Email delivery                             |
| Helmet             | HTTP security                              |
| CORS               | Cross-origin access                        |
| Express Rate Limit | API rate limiting                          |
| Rate Limit Redis   | Redis-backed rate limiting                 |
| Express Validator  | Request validation                         |
| Zod                | Schema validation                          |
| Axios              | HTTP requests                              |
| Morgan             | HTTP request logging                       |
| dotenv             | Environment configuration                  |

These packages are directly listed in the backend `package.json`.

---

# 📂 Project Structure

```text
AI-Interview-Application/
│
├── Backend/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   ├── openrouter.js
│   │   │   └── redis.js
│   │   │
│   │   ├── controller/
│   │   │   ├── auth/
│   │   │   ├── interview/
│   │   │   ├── performance/
│   │   │   └── resume/
│   │   │
│   │   ├── middleware/
│   │   │
│   │   ├── model/
│   │   │   ├── auth/
│   │   │   │   ├── auth.model.js
│   │   │   │   ├── opt.model.js
│   │   │   │   └── refreshToken.model.js
│   │   │   │
│   │   │   ├── interview/
│   │   │   │   ├── InterviewReport.model.js
│   │   │   │   ├── answer.model.js
│   │   │   │   ├── interview.model.js
│   │   │   │   └── interview.session.model.js
│   │   │   │
│   │   │   ├── performance/
│   │   │   │   └── performance.report.model.js
│   │   │   │
│   │   │   └── resume/
│   │   │       ├── resume.model.js
│   │   │       └── resumeAnalysis.model.js
│   │   │
│   │   ├── repository/
│   │   │   ├── auth/
│   │   │   ├── interview/
│   │   │   ├── performance/
│   │   │   └── resume/
│   │   │
│   │   ├── route/
│   │   │   ├── auth/
│   │   │   ├── interview/
│   │   │   ├── performance/
│   │   │   └── resume/
│   │   │
│   │   ├── service/
│   │   │   ├── auth/
│   │   │   ├── email/
│   │   │   ├── interview/
│   │   │   │   └── interview.service.js
│   │   │   ├── performance/
│   │   │   │   └── performance.service.js
│   │   │   └── resume/
│   │   │       ├── analysis.service.js
│   │   │       └── resume.service.js
│   │   │
│   │   ├── templates/
│   │   │
│   │   ├── utils/
│   │   │   ├── ai/
│   │   │   │   ├── askAI.js
│   │   │   │   ├── generateInterviewReportAI.js
│   │   │   │   ├── generatePerformanceReportAI.js
│   │   │   │   ├── generateQuestionsAI.js
│   │   │   │   └── resumePrompt.js
│   │   │   │
│   │   │   ├── auth/
│   │   │   ├── pdf/
│   │   │   ├── upload/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── pdf.js
│   │   │
│   │   ├── validators/
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── test.http
│
└── README.md
```

The high-level source structure and module separation are directly visible in the repository.

---

# 🔌 API Reference

The exact route paths should be kept synchronized with the route files as the API evolves.

### Authentication

Typical authentication operations implemented by the backend include:

```text
POST   /signup
POST   /verify-otp
POST   /resend-otp
POST   /login
POST   /refresh-token
POST   /logout

GET    /profile

PATCH  /update-profile
PATCH  /change-password
PATCH  /deactivate-account

DELETE /delete-account

POST   /forgot-password
POST   /reset-password
```

### Resume

```text
POST   /upload-resume
GET    /resume
PATCH  /resume
DELETE /resume

POST   /analyze-resume
```

### Interview

```text
POST   /create-interview
POST   /start-session
POST   /submit-answer
GET    /session/:sessionId
```

### Performance

```text
GET    /performance
```

> Keep the endpoint names above synchronized with the route files before publishing this section as formal API documentation. The repository structure confirms dedicated route modules for authentication, interview, performance, and resume.

---

# 🧪 API Testing

The repository contains:

```text
Backend/test.http
```

which can be used to test the backend HTTP endpoints.

You can also add your Postman collection here:

```text
Postman Collection:
ADD_POSTMAN_LINK
```

Recommended Postman folders:

```text
Authentication
├── Signup
├── Verify OTP
├── Resend OTP
├── Login
├── Refresh Token
├── Logout
├── Forgot Password
└── Reset Password

Resume
├── Upload Resume
├── Get Resume
├── Analyze Resume
├── Replace Resume
└── Delete Resume

Interview
├── Create Interview
├── Start Session
├── Get Session
└── Submit Answer

Performance
└── Get Performance Report
```

---

# ⚙️ Environment Variables

The repository uses environment variables for external services and secrets.

Based on the configuration files, the application requires values for:

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

OPENROUTER_API_KEY=your_openrouter_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

The OpenRouter client explicitly reads `OPENROUTER_API_KEY` and sends requests through `https://openrouter.ai/api/v1`.

Cloudinary uses:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Redis uses:

```text
REDIS_URL
```

### Security

Never commit real:

```text
API keys
JWT secrets
Database credentials
SMTP passwords
Cloudinary secrets
```

to GitHub.

Use an `.env.example` file containing only placeholders.

---

# 💻 Installation

## 1. Clone Repository

```bash
git clone https://github.com/nikhilsingh2764/AI-Interview-Application.git

cd AI-Interview-Application
```

## 2. Enter Backend

```bash
cd Backend
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

Create:

```text
Backend/.env
```

and add the required environment variables.

## 5. Start Development Server

```bash
npm run dev
```

The project uses:

```text
nodemon src/server.js
```

for development.

## 6. Start Production Server

```bash
npm start
```

---

# 🧠 Technical Design Decisions

## Why MongoDB?

MongoDB is used to store:

* Users
* OTP records
* Refresh tokens
* Resumes
* Resume analyses
* Interviews
* Interview sessions
* Answers
* Interview reports
* Performance reports

Mongoose provides schema definitions and MongoDB relationships through ObjectId references.

---

## Why Redis?

Redis provides a fast in-memory layer for application caching and invalidation.

For example:

```text
Dashboard:<userId>
```

is invalidated when important user data changes.

Interview completion also invalidates dashboard/history-related cache keys.

---

## Why OpenRouter?

The application uses the OpenAI SDK configured with OpenRouter's API endpoint.

```text
Application
    │
    ▼
OpenAI SDK
    │
    ▼
OpenRouter API
    │
    ▼
AI Model
```

This keeps AI communication behind a dedicated configuration module rather than embedding API calls throughout the application.

---

## Why Cloudinary?

Resume files are stored externally rather than directly inside MongoDB.

```text
PDF
 ↓
Cloudinary
 ↓
URL + Public ID
 ↓
MongoDB
```

MongoDB stores metadata and extracted text, while Cloudinary stores the actual resume file.

---

## Why Repository Layer?

Database operations are separated from business logic.

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Mongoose
    ↓
MongoDB
```

This keeps controllers focused on HTTP handling and services focused on application logic.

---

## Why Separate Interview and Session Models?

An `Interview` represents the generated interview itself.

An `InterviewSession` represents an actual attempt at taking that interview.

This allows the application to track:

```text
Interview
  └── Questions

Session
  └── Current Progress
```

instead of mixing interview configuration with session state.

---

# 📈 Performance & Caching

The backend uses Redis to invalidate cached dashboard/history data after important operations.

Examples include:

```text
Resume Analysis Updated
        ↓
Delete Dashboard Cache

Interview Completed
        ↓
Delete Dashboard Cache
        ↓
Delete History Cache
```

This prevents previously cached dashboard information from remaining stale after major user actions.

---

# ⚠️ Current Limitations

The following points are important to understand before describing the application as fully production-ready:

### 1. AI Dependency

Question generation, resume analysis, and interview reports depend on an external AI provider.

AI failures or malformed responses can therefore affect application operations.

The code already handles invalid JSON from question/report generation by returning application errors.

### 2. AI Output Validation

AI output is parsed using `JSON.parse()`.

A stronger implementation would validate the parsed AI response with a strict schema before storing it.

### 3. Resume Replacement

Replacing a resume deletes the old Cloudinary file before uploading the new one. If the new upload fails after deletion, the old file is already gone. A transactional/rollback-oriented workflow would be safer.

### 4. File Processing

PDF extraction occurs as part of the resume workflow. For large-scale systems, this could eventually be moved to asynchronous background processing.

### 5. Audio / Video Answer Fields

The answer model contains `audioUrl`, `videoUrl`, and `transcript` fields, but the current interview submission service stores `answerText`.

---

# 🗺️ Future Improvements

Potential improvements include:

* Strict Zod validation for AI responses
* Background processing for resume parsing
* Background AI report generation
* Interview question regeneration
* Multiple resume support
* Interview history filtering
* Advanced performance analytics
* Question-level AI feedback
* Audio answer processing
* Video answer processing
* Speech-to-text integration
* Automated testing
* Swagger/OpenAPI documentation
* Docker containerization
* CI/CD pipeline
* Application monitoring
* AI retry and fallback mechanisms
* AI response caching where appropriate
* Job queue for long-running AI operations

---

# 📄 License

No license is currently specified for the repository.

If you plan to distribute this project as open source, add an appropriate license.

---

# 👨‍💻 Author

**Nikhil Singh**

Backend Developer

**Technologies:**

Node.js • Express.js • MongoDB • Redis • REST APIs • JWT • AI Integration

### Repository

[AI Interview Application on GitHub](https://github.com/nikhilsingh2764/AI-Interview-Application?utm_source=chatgpt.com)
