# Kannada AI Interview & Hiring Platform

A premium, state-of-the-art AI-driven interview and recruitment platform designed specifically for the Kannada-speaking workforce. This system helps recruiters automate candidate screening and provides applicants with a seamless, bilingual (Kannada/English) interview and profile management experience.

## 🚀 Key Features

### For Recruiters (Admin & Recruiter Roles)
- **Advanced Dashboard Overview**: Real-time monitoring of active jobs, total applicants, interview counts, and AI screening efficiency.
- **Realistic Performance Analytics**: Deep-dive insights into candidate performance, including average score distribution, highest/lowest scores, and hiring funnel conversion rates.
- **My Job Posts**: Dedicated management suite for all job campaigns with quick-action stats and applicant tracking.
- **Unified Candidate Management**: Centralized view of all applicants across all jobs, tracking their application status, AI interview scores, and contact details.
- **Recruiter Evaluation Workflow**: Instantly review **Pending** organic applications from the dashboard. Trigger an AI eligibility check against the job criteria with a single click.
- **Bulk AI Screening**: Upload candidate CSV files for automatic eligibility evaluation and interview link generation.
- **Telegram Automation**: Automated interview invitation delivery to selected candidates (both bulk-uploaded and dashboard-applied candidates) via Telegram.

### For Candidates (Applicants)
- **AI Profile Management**: Build a professional profile including experience, skills, and personal details.
- **Photo Integration**: Upload profile headshots used for both the platform and generated resumes.
- **Instant Resume Download (PDF)**: Convert your profile data directly into a beautifully formatted, professional PDF resume with one click.
- **Interactive AI Interviews**: Real-time voice and text-based interviews in Kannada and English.
- **Guided Career Wizard**: Step-by-step assistance in generating professional summaries and building career narratives.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (Premium SaaS UI)
- **Icons**: Lucide React
- **PDF Generation**: Browser-side PDF rendering for instant resumes

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Async Motor driver)
- **AI Integration**: Gemini 2.0 Flash (via OpenRouter/Google) for interview evaluation and profile generation.
- **PDF Processing**: PyMuPDF (fitz) for resume parsing
- **Messaging**: Telegram Bot API for automated notifications

## 📁 Project Structure

```text
├── backend/
│   ├── main.py                # FastAPI core (Auth, Admin, Analytics, Jobs)
│   ├── ai_service.py          # AI Narrative and Interview logic
│   ├── messaging_service.py   # Telegram & Communication automation
│   ├── database.py            # MongoDB connection logic
│   ├── models.py              # Pydantic data models
│   └── seed_usecases.py       # Sample job campaign data
├── frontend/
│   ├── app/                   
│   │   ├── recruiter/         # Realistic Recruiter Dashboard & Analytics
│   │   ├── candidate/         # AI Profile & Resume Wizard
│   │   ├── profile/           # Profile Management & Photo Uploads
│   │   └── interview/         # AI Interview Experience
│   ├── context/               # Auth & User Context
│   └── lib/                   # API Communication Layer
└── README.md
```

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB (Running locally on default port 27017 or MongoDB Atlas)

### Backend Setup
1. Navigate to `backend/` and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure `.env`:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```
3. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to `frontend/` and install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Access Roles
- **Candidate Access**: Register as a 'user' to build your profile, download your AI resume, and practice interviews.
- **Recruiter Access**: Log in as 'admin' or 'recruiter' to access the full-featured dashboard, manage jobs, and view realistic performance analytics.

## 📄 License
MIT License
