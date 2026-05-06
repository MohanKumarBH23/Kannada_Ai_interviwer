# Kannada AI Interview System

A premium, state-of-the-art AI-driven interview preparation platform designed specifically for the Kannada-speaking workforce. This system helps candidates, including blue-collar workers, prepare for job interviews through interactive AI sessions, resume building, and detailed performance analysis.

## 🚀 Features

- **Interactive AI Interviews**: Real-time voice and text-based interviews in Kannada and English.
- **Simple Resume Builder**: A dedicated tool for users without traditional resumes (especially blue-collar roles) to create a professional digital profile.
- **ATS Score Analysis**: Upload a PDF resume to get an instant ATS compatibility score and detailed improvement suggestions.
- **Comprehensive Performance Reports**: Detailed PDF reports after interviews featuring:
  - Overall Score
  - Confidence Analysis (AI-driven)
  - Strengths & Improvement Areas
  - Question-by-Question Breakdown
- **Bilingual Support**: Full support for Kannada and English throughout the application.
- **Secure Authentication**: JWT-based login and registration system.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API (Auth)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Async Motor driver)
- **AI Integration**: OpenRouter (Gemini 2.0 Flash)
- **PDF Processing**: PyMuPDF (fitz)
- **Security**: bcrypt for password hashing, PyJWT for tokens

## 📁 Project Structure

```text
├── backend/
│   ├── main.py            # FastAPI application routes
│   ├── ai_service.py      # AI logic and integrations
│   ├── models.py          # Pydantic data models
│   ├── auth.py            # JWT and Hashing utilities
│   └── training_data.py   # Domain-specific question bank
├── frontend/
│   ├── app/               # Next.js pages and layouts
│   ├── components/        # Reusable UI components
│   ├── context/           # Auth and Global state
│   └── lib/               # API utilities
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
   GEMINI_API_KEY=your_openrouter_api_key
   JWT_SECRET_KEY=your_secret_key
   FRONTEND_URL=http://localhost:3000
   ```
5. Seed the database (Optional but recommended):
   ```bash
   python seed_training_data.py
   python scratch/seed_admin.py
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
3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Admin Access
The system includes admin functionality. You can create an admin user using the provided seed script:
- **Default Email**: `admin@example.com`
- **Default Password**: `admin123`

## 📄 License
MIT License
