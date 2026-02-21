## 🚇 Delhi Metro Live Tracker

Real-time train tracking system for Delhi Metro with live updates, route planning, and analytics.

## 📊 Coverage

- 🟡 **Yellow Line:** 37 stations (Samaypur Badli ↔ HUDA City Centre)  
- 🔵 **Blue Line:** 48 stations (Dwarka Sector 21 ↔ Noida Electronic City)  
- 🟣 **Violet Line:** 33 stations (Kashmere Gate ↔ Raja Nahar Singh)  
- 🟠 **Orange Line:** 6 stations (New Delhi ↔ Dwarka - Airport Express)  
- 🔵 **Aqua Line:** 21 stations (Noida Sector 51 ↔ Depot Station)  

**Total:** 145 stations, 36 trains  

## ✨ Features

- 🗺️ Live train tracking on interactive map  
- ⏱️ Real-time ETA calculations  
- 🧭 Route planning between stations  
- 📈 Analytics dashboard (crowd levels, hourly patterns)  
- 🔌 WebSocket-based updates every 5 seconds  

## 📂 Dataset

This project uses the Delhi Metro dataset available on Kaggle:  
https://www.kaggle.com/datasets/arunjangir245/delhi-metro-dataset  

The dataset provides structured information about Delhi Metro stations, lines, and network details, which is used for station mapping, routing logic, ETA calculation, and multi-line train simulation.

## 🚀 Installation

### Backend
cd backend  
python3 -m venv venv  
source venv/bin/activate  
pip install -r requirements.txt  
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  

### Frontend
cd frontend  
npm install  
npm run dev  

Access the application at:  
http://localhost:5173  

API Docs:  
http://localhost:8000/docs  

## 🛠️ Tech Stack

- Backend: FastAPI, Python 3.8+, WebSocket  
- Frontend: React, TypeScript, Vite, Leaflet, TanStack Query  
- Data Processing: Python services for simulation, analytics, and ETA computation  

## 📁 Project Structure

Project/
├── backend/              # FastAPI backend  
│   ├── app/  
│   │   ├── data/         # Station data (5 metro lines)  
│   │   ├── routes/       # API endpoints  
│   │   ├── services/     # Business logic & simulators  
│   │   └── main.py       # Application entry point  
│   └── requirements.txt  
└── frontend/             # React frontend  
    ├── src/  
    │   ├── components/   # UI components  
    │   ├── hooks/        # WebSocket & data hooks  
    │   └── services/     # API client layer  
    └── package.json  

## 🌐 API Endpoints

- GET /api/stations — Get all stations  
- GET /api/trains/live — Get live train positions  
- GET /api/route/between/{source}/{dest} — Route planning between stations  
- GET /api/eta/station/{id} — Next arriving trains at a station  
- GET /api/analytics/crowd?line={line} — Crowd level analytics  
- WS /ws/trains — Real-time train updates via WebSocket  

## 📡 System Overview

- Multi-line train simulator for Yellow, Blue, Violet, Orange, and Aqua lines  
- Background scheduler broadcasts live updates every 5 seconds  
- Real-time ETA engine based on train position and station graph  
- Analytics service for crowd estimation and peak hour patterns  

## 📝 License

MIT License — Educational Project
