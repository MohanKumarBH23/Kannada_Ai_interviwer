# Kannada AI Interview & Hiring Platform

A premium, state-of-the-art AI-driven interview and recruitment platform designed specifically for the Kannada-speaking workforce. This system helps recruiters automate candidate screening and provides applicants with a seamless, bilingual (Kannada/English) interview and profile management experience.

---

## 🚀 Key Features

### For Recruiters (Admin & Recruiter Roles)
- **Advanced Dashboard Overview**: Real-time monitoring of active jobs, total applicants, interview counts, and AI screening efficiency.
- **Performance Analytics**: Deep-dive insights into candidate performance, including average score distribution, highest/lowest scores, and hiring funnel conversion rates.
- **Job Campaign Management**: Create, view, and update job posts with quick-action stats and applicant tracking.
- **Candidate Eligibility Screener**: Review pending applications, trigger AI eligibility evaluations against job criteria, and run bulk screening on uploaded candidate CSVs.
- **Notification Automation**: Automated interview invitation delivery to selected candidates via Telegram or SMS (MSG91).

### For Candidates (Applicants)
- **AI Profile Builder**: Build a professional profile details, experience, skills, and upload a headshot.
- **Instant Resume (PDF)**: Convert profile data into a beautifully formatted, professional PDF resume with a single click.
- **Interactive AI Interviews**: Real-time voice and text-based interviews in Kannada and English with dynamic AI feedback.
- **Guided Career Wizard**: Assist candidates in generating professional summaries and building career narratives.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (Premium SaaS UI)
- **Icons**: Lucide React
- **PDF Generation**: Client-side PDF rendering for instant resumes

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Async Motor driver)
- **AI Integration**: Gemini 2.0 Flash for interview evaluation and profile generation
- **PDF Processing**: PyMuPDF (`fitz`) for resume parsing
- **Messaging**: Telegram Bot API & MSG91 for automated notifications

---

## 📁 Project Structure

```text
├── backend/
│   ├── main.py                # FastAPI core (Auth, Admin, Analytics, Jobs)
│   ├── ai_service.py          # AI Narrative and Interview logic
│   ├── messaging_service.py   # Telegram & Communication automation
│   ├── database.py            # MongoDB connection logic
│   ├── models.py              # Pydantic data models
│   ├── seed_admin.py          # Seeding admin credentials
│   ├── seed_usecases.py       # Seeding sample job campaign data
│   └── seed_training_data.py  # Seeding interview question bank
├── frontend/
│   ├── app/                   
│   │   ├── recruiter/         # Recruiter Dashboard & Analytics
│   │   ├── candidate/         # AI Profile & Resume Wizard
│   │   ├── profile/           # Profile Management & Photo Uploads
│   │   └── interview/         # AI Interview Experience
│   ├── context/               # Auth & User Context
│   └── lib/                   # API Communication Layer
└── README.md
```

---

## 📦 Installation & Setup

### Prerequisites
- **Python**: 3.9+
- **Node.js**: 18+
- **MongoDB**: Running locally on default port `27017` or configured via MongoDB Atlas connection string.

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (`backend/.env`):
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   GEMINI_API_KEY=your_gemini_api_key_here
   FRONTEND_URL=http://localhost:3000
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_CHAT_ID=your_telegram_chat_id_here
   MSG91_AUTH_KEY=your_msg91_auth_key_here
   MSG91_TEMPLATE_ID=your_msg91_template_id_here
   MSG91_SENDER_ID=KNDAAI
   ```

5. **Seed the database**:
   Initialize MongoDB collections with sample jobs, questions, and default admin credentials:
   ```bash
   # Seed default admin user (Email: admin@admin.com / Password: admin123)
   python seed_admin.py

   # Seed default job campaigns
   python seed_usecases.py

   # Seed question bank for interview sessions
   python seed_training_data.py
   ```

6. **Run the backend server**:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be live at `http://127.0.0.1:8000`.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend application will be live at `http://localhost:3000`.

4. **Production Build**:
   To bundle and build the project for production, run:
   ```bash
   npm run build
   ```

---

## 🔑 Access Roles

- **Candidate Access**: Register as a regular user to build a profile, download your AI-generated resume, and practice interviews.
- **Recruiter & Admin Access**: Log in with credentials seeded above (`admin@admin.com` / `admin123`) to access the Recruiter Dashboard, view metrics/analytics, manage jobs, and run AI applicant screening.
