# AUCTUS - AI-Powered Local Business Growth Advisor

**Empowering Local Businesses Through AI & Data Analytics**
*Made by Aryan Pandey (© 2026 AUCTUS)*

AUCTUS is a comprehensive, production-ready AI-driven business intelligence and growth advisory platform. It allows small and local business owners to upload their sales datasets and customer reviews, instantly clean their data, analyze sentiment, forecast revenue trends using machine learning, generate automated SWOT audits for competitors, create targeted marketing plans, generate copy for social media and search ads, and download branded performance reports.

---

## 🏗️ Project Structure

```
D:\AUCTUS
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
├── backend/           # FastAPI + Python (Uvicorn)
├── database/          # PostgreSQL schemas and seeds
├── docs/              # System & API documentation
├── deployment/        # Vercel, Render, and GitHub Actions configs
├── reports/           # Temporary folder for generated PDF/Word reports
├── assets/
│   └── logo/          # Logo file folder
├── datasets/          # Seed datasets for testing
├── screenshots/       # Visual guides
├── models/            # Serialized ML models
└── README.md          # Main Project Documentation
```

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, ShadCN UI, Recharts, Framer Motion
- **Backend:** FastAPI (Python), Uvicorn, SQLAlchemy, Pydantic
- **Database:** PostgreSQL (with SQLite auto-fallback for local development)
- **AI & GenAI:** Gemini 1.5 Flash (via Google GenAI SDK)
- **Data Analytics & ML:** Pandas, NumPy, Scikit-Learn, Statsmodels, Prophet, XGBoost
- **Deployment:** Vercel (Frontend), Render (Backend), Supabase (PostgreSQL)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL (Optional, SQLite fallback is enabled by default)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` configuration.
5. Run the dev server:
   ```bash
   uvicorn app.main:app --reload
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

---

*Developed for the Final Year Major Project by **Aryan Pandey**.*
