# 🔥 WildfireGuard AI (FireSight)
### Next-Generation End-to-End Wildfire Early Warning, Computer Vision Detection & Propagation Modeling Platform

<p align="center">
  <img src="./diagrams/current_system_architecture.svg" alt="WildfireGuard AI Architecture" width="850px" />
</p>

<p align="center">
  <a href="https://github.com/agdouz"><img src="https://img.shields.io/badge/Author-agdouz-FF5722?style=for-the-badge&logo=github&logoColor=white" alt="Author" /></a>
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PyTorch-YOLOv8-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/NASA-FIRMS_Live-E03C31?style=for-the-badge&logo=nasa&logoColor=white" alt="NASA FIRMS" />
  <img src="https://img.shields.io/badge/Sentinel--2-ESA_Hub-003247?style=for-the-badge&logo=esa&logoColor=white" alt="Sentinel-2" />
</p>

---

## 📌 Executive Summary

**WildfireGuard AI (FireSight)** is an enterprise-grade, end-to-end intelligent wildfire monitoring, computer-vision detection, and real-time fire spread prediction platform. Designed to bridge the critical gap between early satellite ignition detection and on-the-ground emergency dispatch, the system combines **Multi-Spectral Satellite Imagery (ESA Sentinel-2)**, **Near-Real-Time Thermal Hotspot Radiometry (NASA FIRMS MODIS/VIIRS)**, **Deep Learning Computer Vision (YOLOv8 & MobileNetV2)**, **Atmospheric Telemetry (Open-Meteo)**, and an **Automated Multi-Channel Dispatch System (Telegram Bot & SMTP Alerts)** into a unified, high-performance **React 19 + Leaflet** command center.

Originally researched and engineered as an advanced **Graduation Thesis (PFE)** project, WildfireGuard AI provides emergency responders, civil defense authorities, and environmental agencies with actionable, sub-minute situational awareness to prevent catastrophic forest fire propagation.

---

## 🌟 Key Highlights & Engineering Achievements

- 🛰️ **Dual-Layer Remote Sensing Pipeline**:
  - **Sentinel Hub Integration**: High-resolution multispectral acquisition with automated Short-Wave Infrared (**SWIR B11/B12**) script processing for thermal penetration across 8 high-risk Moroccan forest and mountain zones (*Rif, Middle Atlas, High Atlas, North, Casablanca, Marrakech, Souss, Oriental*).
  - **NASA FIRMS Pipeline**: Real-time ingestion and clustering of 24-hour thermal anomalies from MODIS (*Terra & Aqua*) and VIIRS (*Suomi NPP / NOAA-20*) sensors, featuring dynamic 1km spatial deduplication.
- 🧠 **Triple Deep Learning Architecture**:
  - **YOLOv8 Custom Detector (`best.pt`)**: Real-time multi-class object detection (`Fire` and `Smoke`) running at 30+ FPS on uploaded video files and live webcam streams.
  - **MobileNetV2 Classifier (`mobilenetv2_fire_detector.h5`)**: Lightweight, latency-optimized neural network for single-frame classification (`Fire`, `Smoke`, `Non Fire`).
  - **Class Activation Map (CAM) Model (`cam_model.h5`)**: Satellite top-down aerial imagery classifier with explainable visual saliency heatmaps.
- 🌪️ **Physics-Based Dynamic Propagation Modeling**:
  - Fetches live hourly 10-meter wind speed ($km/h$) and wind direction vectors via Open-Meteo telemetry.
  - Computes predictive 6-hour fire propagation polygons using an integrated rate-of-spread algorithm accounting for ambient temperature, fuel dryness, and wind force.
- 🚨 **Autonomous Emergency Dispatch Engine**:
  - Automatically dispatches rich **Telegram Bot** alert notifications containing GPS coordinates, direct Google Maps navigation links, AI confidence scores, estimated temperatures, and annotated incident snapshots.
  - Sends automated HTML formatted emergency alerts via **SMTP** to configured civil defense email distribution lists.
- 🧭 **Evacuation & Routing Optimization**:
  - Integrated routing service calculating safe egress corridors and first-responder ingress paths avoiding active fire front perimeters.
- 🎛️ **Mission-Critical Web Command Center**:
  - Built with **React 19**, **TypeScript**, and **Tailwind CSS**, featuring 9 specialized interactive operational dashboards and Leaflet GIS mapping.

---

## 🏗️ System Architecture

```
                                 ┌───────────────────────────────────────────────┐
                                 │            Remote Sensing & Telemetry         │
                                 │   NASA FIRMS  •  ESA Sentinel-2  •  Open-Meteo │
                                 └───────────────────────┬───────────────────────┘
                                                         │
                                                         ▼
┌────────────────────────┐       ┌───────────────────────────────────────────────┐
│     Edge & Cameras     │       │                FastAPI Backend                │
│ Live Webcams / Drones  ├──────►│  • Ingestion & Caching Pipelines             │
│ Media Uploads (MP4/JPG)│       │  • Background APScheduler Tasks               │
└────────────────────────┘       │  • Routing & Safe Evacuation Engine           │
                                 └───────┬───────────────────────────────┬───────┘
                                         │                               │
                                         ▼                               ▼
                         ┌───────────────────────────────┐ ┌───────────────────────────┐
                         │      Deep Learning Engine     │ │   Automated Alert Engine  │
                         │ • YOLOv8 (Fire/Smoke Detect)  │ │ • Telegram Bot API        │
                         │ • MobileNetV2 (Classification)│ │ • SMTP Email Dispatcher   │
                         │ • CAM Model (Satellite Tiles) │ │ • Dynamic GPS Location Map│
                         └───────────────┬───────────────┘ └───────────────────────────┘
                                         │
                                         ▼
                         ┌───────────────────────────────────────────────┐
                         │        React 19 + TypeScript Command Center   │
                         │  GIS Leaflet Map • Real-time Threat Matrices  │
                         │  Wind Vector Simulation • FWI Risk Index      │
                         └───────────────────────────────────────────────┘
```

---

## 🧮 Scientific Modeling & Propagation Formulas

<p align="center">
  <img src="./diagrams/current_fire_prediction_model.svg" alt="Fire Spread Prediction Model" width="750px" />
</p>

### 1. Fire Propagation Rate of Spread ($R$)
The platform calculates the dynamic rate of wildfire propagation based on live atmospheric telemetry:

$$R = R_0 \times \left(1 + \alpha \cdot \frac{T - T_{\text{base}}}{T_{\text{ref}}}\right) \times C_{\text{AI}} \times e^{\beta \cdot V_{\text{wind}}}$$

Where:
- $R_0$: Baseline fuel propagation speed ($km/h$)
- $T$: Live surface ambient temperature (°C)
- $C_{\text{AI}}$: Computer vision detection confidence coefficient ($0.0 - 1.0$)
- $V_{\text{wind}}$: 10-meter wind velocity ($km/h$)
- $\alpha, \beta$: Empirical atmospheric and vegetative tuning parameters

### 2. Canadian Forest Fire Weather Index (FWI) System
The application features a dedicated **Fire Weather Index** analytical calculator incorporating:
- **Fine Fuel Moisture Code (FFMC)**: Litter layer moisture rating.
- **Duff Moisture Code (DMC)**: Loosely compacted organic layer moisture.
- **Drought Code (DC)**: Deep organic layer dryness indicator.
- **Initial Spread Index (ISI)**: Combined wind and fuel moisture spread potential.
- **Buildup Index (BUI)**: Total fuel availability for combustion.

---

## 💻 Tech Stack & Engineering Tools

| Domain | Technologies & Libraries |
| :--- | :--- |
| **Backend & APIs** | Python 3.10+, FastAPI, Uvicorn, Pydantic, APScheduler, Requests, NumPy |
| **AI & Computer Vision** | PyTorch, Ultralytics YOLOv8, TensorFlow / Keras (MobileNetV2), OpenCV (`cv2`), PIL |
| **Remote Sensing & GIS** | ESA Sentinel Hub REST API, NASA FIRMS Global CSV Ingestion, Leaflet.js, React-Leaflet |
| **Frontend UI/UX** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas-Confetti |
| **Telemetry & Services** | Open-Meteo Meteorological API, Telegram Bot API, Python SMTP (MIME) |
| **Academic Documentation** | LaTeX (Overleaf-ready modular thesis chapters in `docs/`) |

---

## 🖥️ Operational Dashboard & Interactive Modules

The frontend web console provides 7 purpose-built views designed for emergency management:

| Route | Page Component | Functional Scope |
| :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | Overview showcase, system capabilities, mission metrics, and quick entry points. |
| `/dashboard` | `Dashboard.tsx` | High-level telemetry, active incident summary cards, system status, and recent detections. |
| `/detection` | `DetectionConsole.tsx` | Unified surveillance terminal with real-time video/webcam feed controls, log tracking, and rapid response dispatches. |
| `/upload` | `UploadDetection.tsx` | Multi-format image/video drag-and-drop analysis with side-by-side inference rendering and bounding box visualization. |
| `/prevention` | `RealTimePrevention.tsx` | Live global NASA MODIS/VIIRS thermal anomaly map with cluster grouping, confidence filters, and brightness temperature stats. |
| `/fwi` | `FireWeatherIndex.tsx` | Meteorological risk computation evaluating temperature, humidity, wind, and rain into standardized FWI risk classes. |
| `/prediction` | `PredictionDashboard.tsx` | Wind vector overlays, interactive threat perimeter projection circles, and estimated 6-hour fire spread radius calculations. |

---

## 📂 Project Organization

```
Wild-Fire-Detection/
├── backend/                             # High-performance FastAPI backend service
│   ├── main.py                          # Application entry point, CORS, and REST routing
│   ├── yolo_service.py                  # YOLOv8 inference service (Images, Videos, Webcams)
│   ├── sentinel_service.py              # Sentinel Hub satellite API client & SWIR processor
│   ├── monitoring_service.py            # APScheduler automated patrol & CAM classifier
│   ├── firms_service.py                 # NASA FIRMS MODIS/VIIRS active hotspot ingestion
│   ├── prediction_service.py            # Wind telemetry & 6h propagation physics engine
│   ├── routing_service.py               # Safe evacuation & emergency response navigation
│   ├── email_service.py                 # Automated SMTP HTML alert dispatcher
│   ├── best.pt                          # Trained YOLOv8 fire/smoke detection weights
│   ├── mobilenetv2_fire_detector.h5     # Trained MobileNetV2 classification model
│   ├── requirements.txt                 # Backend Python dependencies
│   ├── .env.example                     # Environment variables configuration template
│   └── Trained-Models/                  # Training notebooks and checkpoint archives
│
├── frontend/                            # Modern React 19 + TypeScript web application
│   ├── src/
│   │   ├── pages/                       # 9 Core operational web views
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SatelliteMonitoring.tsx
│   │   │   ├── UploadDetection.tsx
│   │   │   ├── RealTimeDetection.tsx
│   │   │   ├── PredictionDashboard.tsx
│   │   │   ├── RealTimePrevention.tsx
│   │   │   ├── FireWeatherIndex.tsx
│   │   │   └── DetectionConsole.tsx
│   │   ├── components/                  # Reusable UI components, GIS map markers, alert cards
│   │   ├── App.tsx                      # Application routing and state management
│   │   └── main.tsx                     # React DOM root mounting
│   ├── tailwind.config.js               # Design tokens, gradients, and custom themes
│   ├── vite.config.ts                   # Vite bundler configuration
│   └── package.json                     # NPM dependencies and build scripts
│
├── diagrams/                            # Architectural diagrams & SVG flowcharts
│   ├── current_system_architecture.svg  # Complete end-to-end platform architecture
│   ├── current_fire_prediction_model.svg# Spread prediction mathematical workflow
│   ├── future_ai_architecture.svg       # Edge drone & multimodal vision roadmap
│   └── future_advanced_fire_model.svg   # Advanced 3D terrain propagation model
│
├── docs/                                # Academic Thesis (PFE) Documentation
│   ├── chapitre3_complet.tex            # State of the art & literature review
│   ├── chapitre4_complet.tex            # Mathematical modeling & architectural design
│   ├── chapitre5_complet.tex            # Implementation, deep learning training & API pipelines
│   ├── chapitre6_complet.tex            # Empirical validation, test cases & performance metrics
│   └── presentation_pfe.tex             # Comprehensive defense presentation slides (Beamer)
│
├── .gitignore                           # Production-ready Git ignore definitions
├── PROJECT_OVERVIEW.md                  # Comprehensive technical overview
└── README.md                            # Primary documentation (this file)
```

---

## ⚡ Quickstart & Installation Guide

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18 or higher (with `npm`)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/agdouz/WildfireGuard-AI.git
cd WildfireGuard-AI
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\activate
# On Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env   # On Linux/macOS: cp .env.example .env
```

> **Note**: Edit `backend/.env` with your Sentinel Hub credentials, Telegram Bot token, and SMTP credentials if you wish to enable live notifications. The backend runs seamlessly in demonstration mode with automated fallback generators if credentials are not provided.

```bash
# Start FastAPI application server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- **API Server**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Specifications**: `http://127.0.0.1:8000/redoc`

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
- **Web Application**: `http://localhost:5173`

---

## 🔌 Core API Endpoints

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/detect/image` | Submit image for MobileNetV2 classification (`Fire`, `Smoke`, `Non Fire`). |
| `POST` | `/detect/yolo/image` | Submit image for YOLOv8 bounding box detection with confidence annotations. |
| `POST` | `/detect/yolo/video` | Upload video stream for frame-by-frame fire and smoke inference. |
| `GET` | `/satellite/zones` | Retrieve monitored geographical forest zones in Morocco. |
| `POST` | `/satellite/scan` | Trigger Sentinel-2 multi-spectral image acquisition and fire detection. |
| `POST` | `/satellite/patrol/toggle`| Start/Stop background automated satellite patrol daemon. |
| `GET` | `/firms/active-hotspots` | Fetch 24-hour NASA MODIS/VIIRS deduplicated active thermal hotspots. |
| `POST` | `/predict/spread` | Calculate 6-hour fire spread radius based on coordinates and live wind vectors. |
| `POST` | `/fwi/calculate` | Compute Fire Weather Index parameters from ambient weather inputs. |
| `POST` | `/routing/evacuate` | Generate evacuation corridors avoiding detected active fire polygons. |

---

## 🛡️ Security & Best Practices

- **Zero Credentials in Version Control**: `.env` and sensitive token configurations are strictly excluded via `.gitignore`. A sanitized `.env.example` is provided for seamless reproduction.
- **Stateless & Scalable Inference**: Computer vision services are container-ready with decoupled endpoint workers for high-concurrency workloads.
- **Graceful Fault Tolerance**: Multi-tier fallbacks ensure continuous UI availability even during external third-party API rate limits or network degradation.

---

## 👨‍💻 Author & Contact

**Developed by [agdouz](https://github.com/agdouz)**  
- GitHub: [@agdouz](https://github.com/agdouz)  
- Portfolio / Profile: [https://github.com/agdouz](https://github.com/agdouz)  
- Project Repository: [WildfireGuard-AI](https://github.com/agdouz/WildfireGuard-AI)

*If you find this project valuable for research, civil defense, or computer vision applications, please consider giving it a ⭐ on GitHub!*
