@echo off
title AUCTUS Launcher - Local Environment
echo ============================================================
echo      AUCTUS: AI-Powered Local Business Growth Advisor
echo             Local Presentation Launcher
echo ============================================================
echo.
echo [1/2] Starting Python FastAPI Backend...
start "AUCTUS Backend Server" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting React Frontend...
start "AUCTUS Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================================
echo  AUCTUS is starting up!
echo  - Backend running on: http://localhost:8000
echo  - Frontend starting on: http://localhost:5173 (or Vite port)
echo.
echo  Keep the server windows open during your presentation.
echo  To close, simply close the terminal windows.
echo ============================================================
pause
