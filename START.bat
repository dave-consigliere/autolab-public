@echo off
echo Lancement de AutoLab...

:: 1. Lance le Backend dans une nouvelle fenêtre
start "AutoLab Backend" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd backend && uvicorn main:app --reload"

:: 2. Lance le Frontend dans une nouvelle fenêtre
start "AutoLab Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

:: 3. Ouvre le navigateur
timeout /t 5
start http://localhost:3000