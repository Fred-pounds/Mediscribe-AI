#!/bin/bash
# MediScribe AI — start backend + frontend together

cd "$(dirname "$0")"

echo "Starting MediScribe AI..."

# Backend
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
echo "Backend running (PID $BACKEND_PID)"

sleep 2

# Frontend (React / Vite)
cd frontend && npm run dev -- --port 5173 --host &
FRONTEND_PID=$!
cd ..
echo "Frontend running at http://localhost:5173"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
