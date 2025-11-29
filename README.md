# Mock'n‑Hire — AI‑Powered Hiring Suite

[![Conference](https://img.shields.io/badge/ICCCNT%202025-Accepted-blue)](https://16icccnt.com/) 
&nbsp;&nbsp;
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#-license) 
&nbsp;&nbsp;
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org) 
&nbsp;&nbsp;
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)


**Mock'n‑Hire** is a comprehensive AI-powered hiring platform that streamlines the recruitment process end-to-end. It combines intelligent resume ranking for recruiters with personalized mock interviews featuring real-time stress analysis for candidates.



---



## 📋 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Supabase Setup](#-supabase-setup)
- [Environment Variables](#%EF%B8%8F-environment-variables)
- [Running the Application](#%EF%B8%8F-running-the-application)
- [User Workflows](#-user-workflows)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Authors](#-authors)
- [Citation](#-citation)
- [License](#-license)
  
---



## ✨ Features



### For Recruiters

- **AI Resume Ranking** — LLM-powered semantic scoring that goes beyond keyword matching

- **Custom Weights** — Configure importance of Experience, Projects, Certifications per role

- **Bulk Upload** — Upload multiple resumes via ZIP file

- **Candidate Management** — Shortlist, waitlist, or decline candidates with detailed explanations

- **Score Breakdown** — Understand why each candidate ranks where they do



### For Candidates (Students)

- **Personalized Mock Interviews** — Questions generated from your own resume

- **Video Recording** — Record your responses for self-review

- **Real-Time Stress Detection** — MobileNetV2-based emotion and stress analysis

- **Comprehensive Feedback** — Per-question scores, overall performance, and improvement suggestions



> 📣 **Accepted at ICCCNT 2025** — 16th International Conference on Computing, Communication and Networking Technologies



---



## 🏗 Architecture



```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│                      http://localhost:3000                      │
└─────────────────────┬───────────────────────┬───────────────────┘
                      │                       │
                      ▼                       ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   RECRUITER BACKEND (FastAPI)│   │   STUDENT BACKEND (FastAPI) │
│   http://localhost:4000      │   │   http://localhost:8000     │
│                              │   │                             │
│   • Resume parsing & ranking │   │   • Question generation     │
│   • JD analysis              │   │   • Answer evaluation       │
│   • Candidate scoring        │   │   • Stress analysis (ML)    │
└──────────────┬───────────────┘   └──────────────┬──────────────┘
               │                                   │
               └───────────────┬───────────────────┘
                               ▼
               ┌───────────────────────────────┐
               │         SUPABASE              │
               │   • Authentication            │
               │   • PostgreSQL Database       │
               │   • File Storage (Buckets)    │
               └───────────────────────────────┘
```



---



## 🧰 Tech Stack



| Category | Technologies |
|:---------|:-------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **AI/ML** | Groq (LLaMA 3.3 70B), TensorFlow/Keras, MobileNetV2 |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage Buckets |
| **Authentication** | Supabase Auth |



---



## 📸 Screenshots



| Recruiter Dashboard | Candidate Analysis |
|:-------------------:|:------------------:|
| ![Recruiter Dashboard](Recruiter.png) | ![Screening View](Screening.png) |



---



## 📋 Prerequisites



Before you begin, ensure you have the following installed:



| Requirement | Version | Check Command |
|:------------|:--------|:--------------|
| **Python** | 3.10 or higher | `python --version` |
| **Node.js** | 18 or higher | `node --version` |
| **npm** | 9 or higher | `npm --version` |
| **Git** | Latest | `git --version` |



You will also need:

- A **Supabase** account and project ([create one here](https://supabase.com))

- A **Groq** API key ([get one here](https://console.groq.com))



---



## 🚀 Installation



### Step 1: Clone the Repository



```bash
git clone https://github.com/rahulthota21/mock-n-hire.git
cd mock-n-hire
```



### Step 2: Set Up Python Virtual Environment



```bash
cd server
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate

# Windows (CMD):
venv\Scripts\activate.bat

# macOS/Linux:
source venv/bin/activate
```



### Step 3: Install Python Dependencies



```bash
# While in server/ directory with venv activated
pip install -r requirements.txt
pip install -r student/requirements.txt
```



### Step 4: Install Frontend Dependencies



```bash
# Navigate back to root directory
cd ..
npm install
```



---



## 🗄 Supabase Setup



### 1. Create a Supabase Project



1. Go to [supabase.com](https://supabase.com) and create a new project

2. Note down your:

   - **Project URL** (e.g., `https://xxxxx.supabase.co`)

   - **Anon/Public Key**

   - **Service Role Key**

   - **JWT Secret**



### 2. Create Database Tables



Navigate to **SQL Editor** in your Supabase dashboard and run the following schema:



<details>
<summary>📄 Click to expand database schema</summary>



```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (links to Supabase Auth)
CREATE TABLE public.users (
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['recruiter'::text, 'student'::text])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Job descriptions (Recruiter)
CREATE TABLE public.job_descriptions (
  job_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  job_title text NOT NULL,
  job_description text NOT NULL,
  skills_required text[] DEFAULT '{}'::text[],
  created_at timestamp without time zone DEFAULT now(),
  project_weight double precision DEFAULT 50,
  experience_weight double precision DEFAULT 50,
  certifications_weight double precision DEFAULT 0,
  CONSTRAINT job_descriptions_pkey PRIMARY KEY (job_id),
  CONSTRAINT job_descriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Job status tracking
CREATE TABLE public.job_status (
  job_id uuid NOT NULL,
  status text NOT NULL,
  CONSTRAINT job_status_pkey PRIMARY KEY (job_id)
);

-- Resume uploads (Recruiter)
CREATE TABLE public.resume_uploads (
  resume_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  job_id uuid,
  file_name text NOT NULL,
  file_path text NOT NULL,
  upload_timestamp timestamp without time zone DEFAULT now(),
  original_hash text,
  candidate_name text,
  CONSTRAINT resume_uploads_pkey PRIMARY KEY (resume_id),
  CONSTRAINT resume_uploads_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job_descriptions(job_id),
  CONSTRAINT resume_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Resume analysis results
CREATE TABLE public.resume_analysis (
  analysis_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  resume_id uuid,
  key_skills text[],
  overall_analysis text,
  certifications_courses text[],
  relevant_projects text[],
  soft_skills text[],
  overall_match_score double precision,
  projects_relevance_score double precision,
  experience_relevance_score double precision,
  certifications_relevance_score double precision DEFAULT 0,
  analysis_timestamp timestamp without time zone DEFAULT now(),
  notes text,
  tagged_users text[],
  search_vector tsvector,
  CONSTRAINT resume_analysis_pkey PRIMARY KEY (analysis_id),
  CONSTRAINT resume_analysis_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resume_uploads(resume_id)
);

-- Resume rankings
CREATE TABLE public.resume_rankings (
  ranking_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  resume_id uuid,
  job_id uuid,
  total_score double precision,
  rank integer,
  created_at timestamp without time zone DEFAULT now(),
  notes text,
  tagged_users text[],
  status text DEFAULT 'unreviewed'::text,
  candidate_name text,
  CONSTRAINT resume_rankings_pkey PRIMARY KEY (ranking_id),
  CONSTRAINT resume_rankings_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job_descriptions(job_id),
  CONSTRAINT resume_rankings_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resume_uploads(resume_id)
);

-- Mock interview users (Student)
CREATE TABLE public.mock_interview_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  role text DEFAULT 'candidate'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT mock_interview_users_pkey PRIMARY KEY (id),
  CONSTRAINT fk_mock_user_user FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Mock interview resumes
CREATE TABLE public.mock_interview_resumes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  file_path text NOT NULL,
  uploaded_at timestamp without time zone DEFAULT now(),
  CONSTRAINT mock_interview_resumes_pkey PRIMARY KEY (id),
  CONSTRAINT mock_interview_resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.mock_interview_users(user_id)
);

-- Mock interview sessions
CREATE TABLE public.mock_interview_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  resume_id uuid,
  status text DEFAULT 'in_progress'::text,
  start_time timestamp without time zone DEFAULT now(),
  end_time timestamp without time zone,
  CONSTRAINT mock_interview_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT mock_interview_sessions_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.mock_interview_resumes(id),
  CONSTRAINT mock_interview_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.mock_interview_users(user_id)
);

-- Mock interview questions
CREATE TABLE public.mock_interview_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  question_text text NOT NULL,
  category text NOT NULL,
  is_answered boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  question_number integer,
  CONSTRAINT mock_interview_questions_pkey PRIMARY KEY (id),
  CONSTRAINT mock_interview_questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id)
);

-- Mock interview answers
CREATE TABLE public.mock_interview_answers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  question_number integer NOT NULL,
  answer_text text,
  audio_url text,
  score double precision,
  feedback text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT mock_interview_answers_pkey PRIMARY KEY (id),
  CONSTRAINT mock_interview_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id)
);

-- Mock interview stress analysis
CREATE TABLE public.mock_interview_stress_analysis (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  question_number integer,
  stress_score double precision,
  stress_level text,
  created_at timestamp without time zone DEFAULT now(),
  video_url text,
  individual_scores jsonb,
  audio_from_video_url text,
  CONSTRAINT mock_interview_stress_analysis_pkey PRIMARY KEY (id),
  CONSTRAINT mock_interview_stress_analysis_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id)
);

-- Mock interview reports
CREATE TABLE public.mock_interview_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid UNIQUE,
  overall_summary text,
  final_score double precision,
  recommendation text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  average_stress_score double precision NOT NULL DEFAULT 0.0,
  average_stress_level text NOT NULL DEFAULT 'Not Analyzed'::text,
  CONSTRAINT mock_interview_reports_pkey PRIMARY KEY (id),
  CONSTRAINT mock_interview_reports_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.mock_interview_sessions(id)
);
```

</details>



### 3. Set Up Row Level Security (RLS)



Run these policies in the SQL Editor:



<details>
<summary>📄 Click to expand RLS policies</summary>



```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_stress_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interview_reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- Job descriptions policies
CREATE POLICY "Recruiters can create jobs" ON public.job_descriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Recruiters can view own jobs" ON public.job_descriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can update own jobs" ON public.job_descriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can delete own jobs" ON public.job_descriptions FOR DELETE USING (auth.uid() = user_id);

-- Job status policies
CREATE POLICY "Allow Insert for Authenticated" ON public.job_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Select for Authenticated" ON public.job_status FOR SELECT USING (auth.role() = 'authenticated');

-- Resume uploads policies
CREATE POLICY "Recruiters can upload resumes" ON public.resume_uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Recruiters can view resumes for their jobs" ON public.resume_uploads FOR SELECT 
  USING ((auth.uid() = user_id) OR (EXISTS (SELECT 1 FROM job_descriptions WHERE job_descriptions.job_id = resume_uploads.job_id AND job_descriptions.user_id = auth.uid())));

-- Resume analysis policies
CREATE POLICY "Recruiters can manage resume analysis" ON public.resume_analysis FOR ALL 
  USING (EXISTS (SELECT 1 FROM resume_uploads ru JOIN job_descriptions jd ON ru.job_id = jd.job_id WHERE ru.resume_id = resume_analysis.resume_id AND jd.user_id = auth.uid()));

-- Resume rankings policies
CREATE POLICY "Recruiters can manage resume rankings" ON public.resume_rankings FOR ALL 
  USING (EXISTS (SELECT 1 FROM job_descriptions WHERE job_descriptions.job_id = resume_rankings.job_id AND job_descriptions.user_id = auth.uid()));

-- Mock interview users policies
CREATE POLICY "Users can create mock interview profile" ON public.mock_interview_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own mock interview profile" ON public.mock_interview_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own mock interview profile" ON public.mock_interview_users FOR UPDATE USING (auth.uid() = user_id);

-- Mock interview resumes policies
CREATE POLICY "Users can upload mock interview resumes" ON public.mock_interview_resumes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own mock interview resumes" ON public.mock_interview_resumes FOR SELECT USING (auth.uid() = user_id);

-- Mock interview sessions policies
CREATE POLICY "Users can create mock interview sessions" ON public.mock_interview_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own mock interview sessions" ON public.mock_interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own mock interview sessions" ON public.mock_interview_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow public access" ON public.mock_interview_sessions FOR ALL USING (true);

-- Mock interview questions policies
CREATE POLICY "Allow public access" ON public.mock_interview_questions FOR ALL USING (true);

-- Mock interview answers policies
CREATE POLICY "Allow public access" ON public.mock_interview_answers FOR ALL USING (true);

-- Mock interview stress analysis policies
CREATE POLICY "Allow public access" ON public.mock_interview_stress_analysis FOR ALL USING (true);

-- Mock interview reports policies
CREATE POLICY "Allow public access" ON public.mock_interview_reports FOR ALL USING (true);
```

</details>



### 4. Create Storage Buckets



1. Go to **Storage** in Supabase dashboard

2. Create the following buckets:



| Bucket Name | Public | Purpose |
|:------------|:-------|:--------|
| `resumes` | No | Recruiter-uploaded resumes (ZIP files) |
| `mock-interview-resumes` | No | Student-uploaded resumes |
| `mock-interview-videos` | No | Interview video recordings |
| `mock-interview-audio` | No | Extracted audio files |


3. For each bucket, add a storage policy to allow authenticated uploads:

   - Go to **Policies** tab for each bucket

   - Add policy: `Allow authenticated uploads`

   - Policy: `(auth.role() = 'authenticated')`

---



## ⚙️ Environment Variables



Create a `.env.local` file in **three locations** with identical content:



1. **Root directory** (`/.env.local`)

2. **Server directory** (`/server/.env.local`)

3. **Student directory** (`/server/student/.env.local`)



```bash
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
SUPABASE_KEY=your_service_role_key_here

# ===========================================
# FRONTEND (Next.js Public Variables)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# ===========================================
# AI/LLM CONFIGURATION (Groq)
# ===========================================
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_groq_api_key_here
GROQ_MODEL_NAME=llama-3.3-70b-versatile

# ===========================================
# API ENDPOINTS
# ===========================================
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
```


### Where to Find These Values



| Variable | Location in Supabase |
|:---------|:---------------------|
| `SUPABASE_URL` | Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Service Role Key (secret) |
| `SUPABASE_JWT_SECRET` | Settings → API → JWT Secret |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → Anon/Public Key |


> ⚠️ **Security Warning**: Never commit `.env.local` files to version control. They are already in `.gitignore`.



---



## ▶️ Running the Application



You need **three terminal windows** to run the complete application:



### Terminal 1: Frontend (Next.js)



```bash
# From root directory
npm run dev
```


Frontend will be available at: **http://localhost:3000**



### Terminal 2: Recruiter Backend



```bash
# From root directory
cd server
.\venv\Scripts\Activate  # Windows
# source venv/bin/activate  # macOS/Linux

uvicorn api_service:app --reload --host 0.0.0.0 --port 4000
```


Recruiter API will be available at: **http://localhost:4000**



### Terminal 3: Student Backend



```bash
# From root directory
cd server/student
..\venv\Scripts\Activate  # Windows (uses parent venv)
# source ../venv/bin/activate  # macOS/Linux

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```


Student API will be available at: **http://localhost:8000**



### Quick Start Summary



| Service | Command | URL |
|:--------|:--------|:----|
| Frontend | `npm run dev` | http://localhost:3000 |
| Recruiter API | `uvicorn api_service:app --reload --port 4000` | http://localhost:4000 |
| Student API | `uvicorn main:app --reload --port 8000` | http://localhost:8000 |


---



## 👥 User Workflows



### 🔷 Recruiter Flow



```
Landing Page → Login/Signup → Select "Recruiter" Role
                                      ↓
                            Upload Job Details:
                            • Job Title
                            • Job Description
                            • Resume ZIP file
                            • Configure Weights (Experience, Projects, Certifications)
                                      ↓
                            Click "Analyze"
                                      ↓
                            View Ranked Candidates:
                            • Sorted by match score
                            • Detailed explanation for each
                            • Score breakdown
                                      ↓
                            Manage Candidates:
                            • ✅ Shortlist
                            • ⏳ Waitlist  
                            • ❌ Decline
```



### 🔷 Student/Candidate Flow



```
Landing Page → Login/Signup → Select "Student" Role
                                      ↓
                            Upload:
                            • Resume (PDF)
                            • Target Role
                                      ↓
                            Start Mock Interview:
                            • AI-generated questions based on resume
                            • Technical, HR, and Situational questions
                                      ↓
                            Record Video Responses:
                            • Real-time stress detection
                            • Emotion analysis
                                      ↓
                            Receive Feedback:
                            • Per-question scores
                            • Overall performance
                            • Stress analysis report
                            • Improvement suggestions
```


---



## 🔌 API Endpoints



### Recruiter Backend (Port 4000)



| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/jobs` | Create new job posting |
| `POST` | `/api/upload-resumes` | Upload resume ZIP file |
| `POST` | `/api/analyze` | Analyze and rank resumes |
| `GET` | `/api/jobs/{job_id}/rankings` | Get ranked candidates |
| `PATCH` | `/api/rankings/{ranking_id}` | Update candidate status |



### Student Backend (Port 8000)



| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/upload-resume` | Upload student resume |
| `POST` | `/api/start-session` | Start mock interview |
| `GET` | `/api/questions/{session_id}` | Get interview questions |
| `POST` | `/api/submit-answer` | Submit answer with video |
| `POST` | `/api/analyze-stress` | Analyze stress from video |
| `GET` | `/api/report/{session_id}` | Get final report |


---



## 📁 Project Structure



```
mock-n-hire/
├── .env.local                 # Frontend environment variables
├── .gitignore
├── package.json
├── next.config.js
├── tailwind.config.js
├── README.md
│
├── app/                       # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx               # Landing page
│   ├── login/
│   ├── signup/
│   ├── recruiter/             # Recruiter dashboard pages
│   └── student/               # Student dashboard pages
│
├── components/                # Reusable React components
│   ├── ui/
│   ├── forms/
│   └── ...
│
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
│
├── server/                    # Backend services
│   ├── .env.local             # Backend environment variables
│   ├── requirements.txt       # Recruiter backend dependencies
│   ├── api_service.py         # Recruiter FastAPI app (port 4000)
│   ├── venv/                  # Shared Python virtual environment
│   │
│   └── student/               # Student backend
│       ├── .env.local         # Student backend environment variables
│       ├── requirements.txt   # Student backend dependencies
│       ├── main.py            # Student FastAPI app (port 8000)
│       └── emotion_stress_model.h5  # Pre-trained stress detection model
│
├── Recruiter.png              # Screenshot
└── Screening.png              # Screenshot
```


---



## 🧭 Roadmap



- [ ] Collaborative workflows for recruiter teams

- [ ] Streaming LLM responses during interviews

- [ ] PDF export for candidate feedback reports

- [ ] Docker Compose for one-command setup

- [ ] Model cards & datasheets for ML components

- [ ] Multi-language support



---



## 🤝 Contributing



We welcome contributions! Here's how:



1. **Fork** the repository

2. **Create** a feature branch: `git checkout -b feature/amazing-feature`

3. **Commit** your changes: `git commit -m 'Add amazing feature'`

4. **Push** to the branch: `git push origin feature/amazing-feature`

5. **Open** a Pull Request



### Guidelines

- Keep PRs focused on a single feature/fix

- Follow existing code style (ESLint for JS/TS, Black for Python)

- Add tests where possible

- Update documentation as needed



---



## 👥 Authors



- **Kowshik Naidu Padala**

- **Rahul Thota**

- **Teja Sai Sathwik Peruri**

- **Anjali T**



*Amrita Vishwa Vidyapeetham, India*



---



## 📝 Citation



> **Accepted at ICCCNT 2025** — 16th International Conference on Computing, Communication and Networking Technologies



```bibtex
@inproceedings{mockNHire2025,
  title={Mock'n-Hire: AI-Powered Hiring Suite with Semantic Resume Ranking and Emotion-Aware Mock Interviews},
  author={Padala, Kowshik Naidu and Thota, Rahul and Peruri, Teja Sai Sathwik and T, Anjali},
  booktitle={16th International Conference on Computing, Communication and Networking Technologies (ICCCNT)},
  year={2025}
}
```



---



## 📜 License



This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
