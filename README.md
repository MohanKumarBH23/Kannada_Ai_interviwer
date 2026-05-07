# Kannada AI Interview & Hiring Platform

A premium, state-of-the-art AI-driven interview and recruitment platform designed specifically for the Kannada-speaking workforce. This system helps recruiters automate candidate screening and provides applicants with a seamless, bilingual (Kannada/English) interview experience.

## 🚀 Key Features

### For Recruiters (Admin)
- **ADD NEW JOB (Campaigns)**: Launch automated recruitment pipelines with custom job roles and eligibility criteria.
- **Bulk AI Screening**: Upload candidate CSV files and let AI automatically evaluate eligibility based on job requirements.
- **Telegram Automation**: Automated interview link delivery to the recruiter's Telegram for quick forwarding to selected candidates.
- **Fuzzy CSV Parsing**: Smart CSV engine that recognizes common headers (Phone, Mobile, Name, etc.) and captures all data for AI context.
- **Applicant Dashboard**: Manage candidates, view screening results, and monitor interview progress in real-time.

### For Candidates (Applicants)
- **Interactive AI Interviews**: Real-time voice and text-based interviews in Kannada and English.
- **Magic Link Access**: No account required! Candidates join interviews instantly via unique secure links sent via Telegram/WhatsApp.
- **ATS Score Analysis**: Upload a PDF resume to get an instant ATS compatibility score and improvement suggestions.
- **Bilingual Interface**: Seamless switching between Kannada and English for zero-friction interaction.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Premium SaaS UI)
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Async Motor driver)
- **AI Integration**: Gemini 2.0 Flash (via OpenRouter/Google)
- **PDF Processing**: PyMuPDF (fitz)
- **Messaging**: Telegram Bot API integration

## 📁 Project Structure

```text
├── backend/
│   ├── main.py                # FastAPI core and hiring routes
│   ├── ai_service.py          # AI logic and eligibility evaluation
│   ├── messaging_service.py   # Telegram automation logic
│   ├── database.py            # MongoDB connection & collections
│   ├── models.py              # Pydantic data models
│   └── seed_usecases.py       # Sample job campaign data
├── frontend/
│   ├── app/                   # Next.js pages (Hiring, Interview, Results)
│   ├── components/            # Reusable SaaS components
│   ├── context/               # Auth and Global state
│   └── lib/                   # API utilities
└── README.md
```

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB (Running locally on default port 27017)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   GEMINI_API_KEY=your_api_key
   FRONTEND_URL=http://localhost:3000
   TELEGRAM_CHAT_ID=your_telegram_id (Use @userinfobot to get it)
   ```
5. Seed the database with sample jobs:
   ```bash
   python seed_usecases.py
   ```
6. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Admin Access
To access the Recruiter Dashboard, log in with an admin account. You can create one using the registration page or a seed script.
- **Recruiter URL**: `http://localhost:3000/hiring`

## 📄 License
MIT License
