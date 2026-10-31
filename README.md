# 🌾 Kannada AI Interview & Hiring Platform (ಕನ್ನಡ AI ಸಂದರ್ಶನ & ನೇಮಕಾತಿ ವೇದಿಕೆ)

A state-of-the-art, culturally grounded AI interview and recruitment platform tailored specifically for the **blue-collar, frontline, and operational workforce** in Karnataka.

The platform bridges the gap between recruiters and under-educated job seekers by offering **voice-assisted resume creation**, **multilingual interfaces (Kannada, English, Hindi)**, and **real-time AI voice/text interviews in natural spoken Kannada**. Recruiters can post jobs, screen candidate eligibility automatically, dispatch virtual interview links, and review comprehensive AI evaluation reports.

---

## 🌟 Core Vision & Capabilities

### 🛵 For Candidates (Blue-Collar & Frontline Job Seekers)
- **Voice-Powered Resume Builder**: Designed specifically for under-educated workers who find typing difficult. Candidates can simply speak in Kannada or English to generate a structured work profile.
- **1-Click Instant Resume (PDF)**: Automatically turns profile information, past experience, and skills into a clean, printable PDF resume.
- **Native Kannada AI Mock Interviews**: Practice interviews in conversational Kannada for top frontline roles with immediate supportive feedback.
- **One-Tap Quick Select Roles**: Instant interview launch for popular operational roles (Delivery Executives, Drivers, Security Guards, Warehouse Associates, Electricians, Customer Support, Retail Helpers).
- **Virtual Interview Access**: Candidates eligible for recruiter-posted jobs receive a direct interview link and complete their interview on any phone or browser.
- **Proctoring Protection**: Integrated camera, audio, and tab-switch monitoring to ensure test integrity.

### 👔 For Recruiters & Employers
- **Dedicated Recruiter Portal (`/recruiter/login`)**: Complete campaign management console isolated from candidate workflows.
- **Job Campaign Management**: Post job openings, define salary, requirements, and strict AI candidate screening criteria.
- **Bulk Candidate Screening & CSV Dispatch**: Upload candidate lists via CSV and let the AI instantly evaluate eligibility against job requirements.
- **Automated Interview Invitations**: Selected candidates automatically receive personalized interview links via SMS (MSG91) or Telegram.
- **Real-Time Analytics & Funnel Tracking**: Live tracking of candidate conversion rates, average scores, and rejection insights.
- **Comprehensive Candidate Performance Reports**:
  - Overall Score (0–100) calibrated against blue-collar operational rubrics
  - Visual Confidence Gauge & Confidence Analysis
  - Key Strengths & Areas for Improvement (Bilingual Kannada & English)
  - Question-by-Question breakdown (Strong, Average, Weak ratings)
  - Clear hiring recommendation (Recommended / Needs Training / Ineligible)

---

## 🎨 Theme & Design Philosophy

The user interface follows the **Karnataka Modern Heritage** design vocabulary, adhering to anti-slop guidelines:
- **Vijayanagar Indigo (`#1B2A4A`)**: Authoritative, stable background and structural framing.
- **Mysore Gold / Deep Amber (`#D97706`)**: Warm, optimistic focal accents and status badges.
- **Warm Parchment Surface (`#FDFBF7`)**: High readability, friendly contrast for candidates and mobile displays.
- **Client-Side Multilingual Translator**: Real-time language switching between **ಕನ್ನಡ (Kannada)**, **English**, and **हिंदी (Hindi)** on all public onboarding pages.

---

## 🧠 AI Model & Question Bank

- **Core Model**: `google/gemini-2.5-flash` via OpenRouter (fast, low-latency, and bilingual Kannada-English comprehension).
- **Curated Question Bank**: **64+ structured questions** across 12 distinct blue-collar roles with 3–5 practical scoring rubric checkpoints per question.
- **Covered Sectors**:
  1. **Delivery Executive** (Zomato, Swiggy, Zepto: route navigation, COD reconciliation, damaged packages, vehicle checks)
  2. **Commercial Driver** (Cab, auto, bus: pre-trip inspections, STOP vs GIVE WAY, bad weather driving, brake failure emergency)
  3. **Security Guard** (Apartment, bank, mall: visitor logging, PASS fire extinguisher protocol, night patrol, intrusion response)
  4. **Warehouse Associate** (Logistics: squat lifting ergonomics, HHT barcode scanning, FIFO inventory rotation, fragile packing)
  5. **Electrician** (Wiring color codes: Phase/Neutral/Earth, earthing safety, short circuits vs overloads, multimeter checks)
  6. **Plumber** (PVC/CPVC/GI pipes, hot water geyser lines, Teflon tape wrapping, P-trap drain blockages)
  7. **Customer Support Executive - Kannada** (Warm 10-sec greetings, active listening, de-escalating angry callers, hold protocols)
  8. **Retail Store Assistant / Cashier** (Merchandising shelf facing, POS cash/UPI tallying, returns without receipts, shoplifting deterrence)
  9. **Housekeeping Staff** (Wet vs Dry waste segregation, wet mopping slip prevention, restroom sanitation PPE)
  10. **Cook / Kitchen Helper** (Hand hygiene, cross-contamination prevention, LPG gas leak protocols, commercial food chilling)
  11. **Carpenter / Mason** (Measuring tape & try squares, wood types, circular saw kickback prevention, bubble-free lamination)
  12. **Factory Worker** (Shop floor PPE, emergency stop mushroom buttons, scrap segregation, shift handover)
- **Intelligent Role Normalization**: Built-in fuzzy matching maps 31+ role variations (including Kannada script names like `ಚಾಲಕ`, `ಡೆಲಿವರಿ`, `ಸೆಕ್ಯುರಿಟಿ`) to canonical domains with 100% accuracy.
- **Adaptive 4-Turn Progression**: Introductions -> Core Job Skills -> Situational Problem-Solving -> Safety & Reliability -> Automated Conclusion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React |
| **Backend** | FastAPI, Python 3.11+, Motor (Async MongoDB), Pydantic v2 |
| **AI Engine** | Google Gemini 2.5 Flash (via OpenRouter API), AsyncOpenAI SDK |
| **Database** | MongoDB (Collections: `users`, `jobs`, `interviews`, `candidates`, `question_bank`) |
| **Document Processing** | PyMuPDF (`fitz`) for PDF resume ingestion |
| **Messaging & SMS** | Telegram Bot API & MSG91 SMS gateway |
| **Testing** | Playwright (E2E, Multi-Viewport Visual Regression, API Integration), Python AST |
| **Deployment** | Vercel (Frontend & Full-Stack Monorepo Configuration) |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── main.py                   # FastAPI application & REST endpoints
│   ├── ai_service.py             # Gemini 2.5 Flash interview engine & evaluation logic
│   ├── training_data.py          # Blue-collar question bank & role normalization
│   ├── models.py                 # Pydantic schemas (Auth, Job, Interview, Answer)
│   ├── database.py               # MongoDB connection setup
│   ├── auth.py                   # JWT creation, password hashing, and role auth
│   ├── messaging_service.py      # Telegram & MSG91 candidate notification dispatch
│   ├── seed_admin.py             # Database seeder for Admin & Recruiter accounts
│   ├── seed_usecases.py          # Seeder for sample blue-collar job campaigns
│   ├── seed_training_data.py     # Seeder for MongoDB question_bank collection
│   ├── test_model_accuracy.py    # Automated test suite for AI accuracy & role mapping
│   ├── requirements.txt          # Python backend dependencies
│   └── .env                      # Backend environment variables
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Karnataka Modern Heritage landing & unified login
│   │   ├── candidate/
│   │   │   ├── page.tsx          # Candidate Dashboard, Mock Interviews & Resume Builder
│   │   │   └── login/page.tsx    # Dedicated Candidate Portal login
│   │   ├── recruiter/
│   │   │   ├── page.tsx          # Recruiter Dashboard & Campaign Overview
│   │   │   └── login/page.tsx    # Dedicated Recruiter Portal login
│   │   ├── hiring/               # Job creation, candidate screening & live analytics
│   │   ├── interview/            # Live AI interview room & proctoring interface
│   │   ├── results/              # Performance scorecard & PDF report generation
│   │   ├── profile/              # User profile & photo management
│   │   └── register/             # Role-based candidate and recruiter registration
│   ├── components/               # Navbar, ProctoringSystem, UI widgets
│   ├── context/                  # AuthContext (JWT management & session state)
│   ├── lib/                      # API client (`api.ts`) & Multilingual dictionary (`translations.ts`)
│   ├── tests/                    # Playwright test specs (api, e2e, visual)
│   ├── playwright.config.ts      # Multi-device Playwright test configuration
│   └── package.json              # Frontend dependencies and scripts
│
├── vercel.json                   # Root Vercel deployment configuration
├── DESIGN.md                     # Design philosophy & color tokens
├── PRODUCT.md                    # Product specification & user journeys
└── README.md                     # Project documentation
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ (LTS recommended)
- **MongoDB**: Local MongoDB community server running on port `27017` (or MongoDB Atlas connection URI)

---

### 1. Backend Setup

1. **Open a terminal and navigate to `backend/`**:
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment**:
   ```bash
   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables (`backend/.env`)**:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   GEMINI_API_KEY=your_openrouter_or_gemini_api_key_here
   GEMINI_MODEL=google/gemini-2.5-flash
   FRONTEND_URL=http://localhost:3000
   SECRET_KEY=kannada_interview_super_secret_jwt_key_2026
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_optional
   TELEGRAM_CHAT_ID=your_telegram_chat_id_optional
   MSG91_AUTH_KEY=your_msg91_key_optional
   ```

5. **Seed the database with default accounts, blue-collar jobs, and questions**:
   ```bash
   # Seed default Admin and dedicated Recruiter accounts
   python seed_admin.py

   # Seed sample blue-collar job campaigns
   python seed_usecases.py

   # Seed the 64+ blue-collar question bank into MongoDB
   python seed_training_data.py
   ```

6. **Verify AI model accuracy and role classification**:
   ```bash
   python test_model_accuracy.py
   ```

7. **Start the FastAPI backend server**:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   Backend will be accessible at: `http://127.0.0.1:8000` (API docs at: `http://127.0.0.1:8000/docs`).

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to `frontend/`**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```
   Open your browser at: `http://localhost:3000`.

4. **Verify production compilation**:
   ```bash
   npm run build
   ```

---

## 🔑 Default Login Credentials

The seeding script ([`backend/seed_admin.py`](file:///c:/Users/Dell/Desktop/Projects/Interviwer%20Kannada/backend/seed_admin.py)) creates default credentials:

| Role | Portal URL | Email | Password | Permissions |
|---|---|---|---|---|
| **Recruiter** | [`/recruiter/login`](http://localhost:3000/recruiter/login) | `recruiter@recruiter.com` | `recruiter123` | Campaign management, bulk screening, dispatching interview links, analytics |
| **Admin** | [`/login`](http://localhost:3000/login) | `admin@admin.com` | `admin123` | Full system access & question bank management |
| **Candidate** | [`/candidate/login`](http://localhost:3000/candidate/login) | Register new or guest access | User password | Profile building, instant resume PDF, mock interviews, job applications |

---

## 🧪 Testing & Quality Assurance

### 1. Playwright Test Suite (Frontend & E2E)
The platform includes an automated Playwright test suite covering **22 test specifications**:
- **End-to-End User Journeys**: Landing page render, bilingual language toggling (Kannada, English, Hindi), role switching, form validation, and registration parameter routing.
- **Visual & Responsive Regression**: Desktop viewports (1280x800) and Mobile viewports (Google Pixel 5) layout checks.
- **Backend API Contract Tests**: Authentication errors, jobs feed serialization, and registration validation.

```bash
# Run all 22 tests across Desktop & Mobile
npx --prefix frontend playwright test --config frontend/playwright.config.ts
```

### 2. Model Accuracy & Progression Suite (Backend)
```bash
python backend/test_model_accuracy.py
```
- **Role Normalization Accuracy**: 100% across 31 colloquial & Kannada test cases.
- **Question Bank Quality**: 100% coverage across 12 blue-collar sectors with verified rubrics.
- **Adaptive Progression**: 4-turn interview flow verified with live Gemini 2.5 Flash responses.

---

## 🚀 Deployment to Vercel

The repository is configured for direct deployment to Vercel using [`vercel.json`](file:///c:/Users/Dell/Desktop/Projects/Interviwer%20Kannada/vercel.json) and [`frontend/vercel.json`](file:///c:/Users/Dell/Desktop/Projects/Interviwer%20Kannada/frontend/vercel.json):

1. **Push your code to a GitHub repository**.
2. **Import the project in Vercel**.
3. Set the **Root Directory** to `frontend` (or keep root with `vercel.json`).
4. Set the environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-production-fastapi-backend.com/api
   ```
5. Deploy! Next.js 14 App Router static and dynamic routes will build automatically.

---

## 📄 License

This project is open-source and available under the **MIT License**.
