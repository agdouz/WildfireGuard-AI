# FireSight (WildfireGuard AI) — Project Architecture & Documentation

## 📌 Executive Summary
**FireSight** (also known as **WildfireGuard AI**) is an advanced, end-to-end intelligent wildfire monitoring, computer-vision detection, and real-time fire spread prediction platform. 

The system leverages **Deep Learning Computer Vision (YOLOv8 & MobileNetV2)**, **Satellite Remote Sensing (Sentinel-2 & NASA FIRMS)**, **Live Weather Telemetry (Open-Meteo)**, and **Multi-Channel Emergency Alerting (Telegram & Email)**, connected to a modern **React + Leaflet web dashboard**.

---

## 🏗️ 1. Complete Project Structure

```
Wild-Fire-Detection/
├── backend/                  # FastAPI Python Backend
│   ├── main.py               # REST API endpoints & CORS setup
│   ├── yolo_service.py       # YOLOv8 object detection (Webcam, Images, Videos)
│   ├── sentinel_service.py   # Sentinel Hub (Sentinel-2 satellite imagery)
│   ├── monitoring_service.py # Background scheduler (APScheduler) & CAM classifier
│   ├── firms_service.py      # NASA MODIS & VIIRS active fire data pipeline
│   ├── prediction_service.py # Fire spread radius physics algorithm
│   └── email_service.py      # Automated SMTP HTML email alerts
│
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── pages/            # 9 Core Interactive Pages
│   │   └── components/       # Reusable Map Markers, Hotspot Cards, Modals
│
├── docs/                     # Academic Thesis (PFE LaTeX documents)
└── FireSight-main/           # SVG diagrams, presentation guides, hackathon resources
```

---

## 🧠 2. AI & Deep Learning Models

The project utilizes three distinct machine learning models engineered for specific input mediums:

1. **YOLOv8 Model (`best.pt`)**:
   - **Service:** [yolo_service.py](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/backend/yolo_service.py)
   - **Task:** Real-time object detection for uploaded images, videos, and live webcam feeds.
   - **Classes:** `Fire` and `Smoke` bounding boxes with confidence scores.

2. **MobileNetV2 (`mobilenetv2_fire_detector.h5`)**:
   - **Service:** [main.py](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/backend/main.py)
   - **Task:** Fast image classification for single uploaded snapshots.
   - **Classes:** `Fire`, `Smoke`, and `Non Fire`.

3. **CAM (Class Activation Map) Model (`cam_model.h5`)**:
   - **Service:** [monitoring_service.py](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/backend/monitoring_service.py)
   - **Task:** Satellite imagery classification optimized for top-down remote sensing.
   - **Classes:** `Fire` vs `No Fire`.

---

## 📡 3. Data Pipelines & Integration Services

### A. Sentinel-2 Satellite Scanning ([sentinel_service.py](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/backend/sentinel_service.py))
- Fetches multispectral imagery from **Sentinel Hub API**.
- Monitors 8 strategic forest & mountain zones in Morocco (*Rif, Middle Atlas, High Atlas, North, Casablanca, Marrakech, Souss, Oriental*).
- Implements Short-Wave Infrared (SWIR B11/B12) spectral scripts for thermal signature analysis.
- Includes automated mock image generator for offline/demo operation.

### B. NASA FIRMS Active Hotspots ([firms_service.py](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/backend/firms_service.py))
- Ingests 24-hour real-time global thermal anomaly CSVs from **NASA MODIS (Terra & Aqua)** and **VIIRS (Suomi NPP)** satellites.
- Deduplicates nearby hotspots dynamically and calculates confidence metrics.

### C. Open-Meteo Live Wind Data & Fire Spread Model ([prediction_service.py](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/backend/prediction_service.py))
- Queries live hourly 10-meter wind speed ($km/h$) and direction for any latitude/longitude.
- Calculates estimated 6-hour fire spread radius ($km$) using the formula:
  $$\text{Spread Rate} = \text{Base Rate} \times \text{Temp Factor} \times \text{Confidence Multiplier} \times \text{Wind Factor}$$

---

## 🔔 4. Multi-Channel Emergency Dispatch System

When a wildfire is flagged by either satellite patrol, webcam feed, or media upload:
- **Telegram Bot Notifications:** Automatically builds and dispatches formatted alerts containing:
  - 📍 Target Zone & Lat/Lon Coordinates
  - 🔗 Clickable Google Maps Location Link
  - 📊 AI Confidence Percentage & Estimated Temperature (K)
  - ⚠️ 6-Hour Predicted Fire Radius ($km$)
  - 🖼️ Snapshot image output
- **SMTP Email Notifications:** Sends alert emails to emergency responder distribution lists.

---

## 🖥️ 5. Frontend Navigation & Web Pages

| Page File | Description & Core Purpose |
| :--- | :--- |
| [LandingPage.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/LandingPage.tsx) | Hero landing view, system features showcase, live stats banner. |
| [Dashboard.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/Dashboard.tsx) | Main operations dashboard with system health indicators and active alerts. |
| [SatelliteMonitoring.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/SatelliteMonitoring.tsx) | Morocco zone selector, manual satellite scan trigger, automated patrol control. |
| [UploadDetection.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/UploadDetection.tsx) | Media scanner supporting image drag-and-drop and video frame analysis. |
| [RealTimeDetection.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/RealTimeDetection.tsx) | Live camera feed streaming for local webcam smoke/fire identification. |
| [PredictionDashboard.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/PredictionDashboard.tsx) | Fire propagation calculator displaying predicted threat radius on an interactive map. |
| [RealTimePrevention.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/RealTimePrevention.tsx) | Global NASA FIRMS active hotspot map with wind vector visualizations. |
| [FireWeatherIndex.tsx](file:///c:/Users/HP/Desktop/Wild-Fire-Detection-main/frontend/src/pages/FireWeatherIndex.tsx) | Weather risk analyzer computing fire weather indices. |

---

## 🛠️ 6. Quickstart Guide: Running Locally

### Backend (Python FastAPI)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive API Documentation: `http://127.0.0.1:8000/docs`

### Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`
