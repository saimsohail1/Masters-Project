# AR Try-On System

This project was developed as part of my MSc Computer Science thesis, where I explored how modern computer-vision techniques can power real-time virtual try-on experiences. The system uses facial landmark detection, head pose estimation, and dimensional scaling to realistically overlay accessories such as glasses and hats on a user's face in real time.
The goal of the project was to design a modular and practical AR pipeline that could support multiple try-on modes, from high-quality single-shot processing to low-latency continuous WebSocket streams.

## My Role

I worked end-to-end on the research, engineering, and integration:
Designed the three-tier try-on architecture (Single, Real-Time, High-Accuracy)
Developed the FastAPI backend (MediaPipe + YOLO + 3D head pose)
Implemented facial measurements (IPD, face width, mm scaling)
Built the React/Vite frontend with WebRTC live camera feed
Integrated product catalog with real-world dimensions (mm)
Tuned performance for real-time streaming and CPU constraints
Wrote thesis documentation, experimentation, and evaluation

## Features

### Three-Tier Try-On System
- **Single Image Try-On**: highest quality, used for captures and evaluation
- **Real-Time Stream (WebSocket)**: optimized for speed and smooth interaction  
- **High-Accuracy Stream**: balanced approach for continuous try-on experience

### Computer Vision Features
- 478+ landmark tracking using MediaPipe Face Mesh
- Face validation using YOLO object detection
- 3D head pose estimation (yaw, pitch, roll)
- Real-world scaling using facial measurement reference points
- Alpha blending and boundary-safe overlay placement

### Product Catalog
- Glasses: Classic Aviator, Raider Sunglasses, Winter Sports
- Hat: Adjustable Polo Hat
- All product models include millimeter-accurate dimensions

### Modern UI/UX
- React + Vite
- Tailwind CSS
- WebRTC integration for real-time camera feed
- Product selection, measurement overlays, and mode switching

## Tech Stacks

### Backend
FastAPI
MediaPipe
YOLOv8
OpenCV
WebSockets

### Frontend

React (Vite)
Tailwind CSS
WebRTC

### Backend (Python/FastAPI)
```
backend/
├── api/
│   ├── main.py                 # FastAPI application entry point
│   ├── routes/
│   │   └── tryon.py           # API endpoints for try-on functionality
│   ├── services/
│   │   ├── mediapipe_service.py  # MediaPipe face detection & measurements
│   │   └── yolo_service.py       # YOLO object detection
│   └── utils/
│       └── file_utils.py         # Image processing & overlay utilities
├── accessories/               # Product images (glasses, hats)
└── requirements.txt          # Python dependencies
```

### Frontend (React/Vite)
```
frontend/
├── src/
│   ├── components/
│   │   ├── ThreeTierTryOn.jsx    # Main try-on component
│   │   ├── VirtualTryOn.jsx      # Legacy try-on component
│   │   └── TryOnStream.jsx       # Streaming component
│   ├── pages/
│   │   ├── Home.tsx              # Landing page
│   │   └── TryOnProducts.tsx     # Product showcase
│   └── App.jsx                   # Main application component
└── package.json                 # Node.js dependencies
```

##Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Webcam/Camera access

### Backend Setup

git clone <repo-url>
cd ar-tryon-api

python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate

cd backend
pip install -r requirements.txt
pip install "uvicorn[standard]" websockets

uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload


### Frontend Setup

cd frontend
npm install
npm run dev

## How to Use

### 1. Select Try-On System
Choose from three optimized systems:
- **Single Image**: Best quality, slower processing
- **Real-Time**: Fast streaming, adaptive quality
- **High-Accuracy**: Balanced performance and quality

### 2. Choose Product
Select from available products:
- **Glasses**: Classic Aviator, Raider Sunglasses, Winter Sport Glasses
- **Hats**: Polo Hat

### 3. Enable Camera
Allow camera access and position yourself in frame

### 4. Try-On Experience
- **Single Image**: Click "Capture & Try-On" for high-quality result
- **Real-Time**: Click "Start Stream" for continuous try-on
- **High-Accuracy**: Click "Start Stream" for balanced experience

## API Endpoints

### POST /single-tryon
High-quality single image processing.

### POST /tryon
High-accuracy continuous mode.

### WebSocket /websocket-tryon
Real-time try-on.

### GET /debug
Health check.

## Technical Details

### Computer Vision Pipeline

1. ### Face Detection
MediaPipe Face Mesh (478 landmarks)
YOLO object detector for validation
3D pose estimation: yaw, pitch, roll

2. ### Measurements
IPD (inter-pupillary distance)
Face width (mm)
Scaling from pixels to millimeters

3. ### Accessory Placement
Dimensional scaling
Pose-aware alignment
Alpha blending
Boundary clipping


## Performance Optimization

### Single Image Mode
- **Target Resolution**: 640px
- **Quality**: 95%
- **Processing**: Full MediaPipe + YOLO pipeline
- **Use Case**: Screenshots, product evaluation

### Real-Time Mode
- **Target Resolution**: 256px
- **Quality**: 70%
- **Processing**: Optimized pipeline with caching
- **Use Case**: Live interaction, continuous try-on

### High-Accuracy Mode
- **Target Resolution**: 320px
- **Quality**: 60%
- **Processing**: Balanced MediaPipe + YOLO
- **Use Case**: Continuous try-on with good accuracy

### Troubleshooting

#### WebSocket issues 
pip install "uvicorn[standard]" websockets

#### Camera not detected
Use HTTPS or localhost
Check browser permissions

#### Low accuracy
Ensure good lighting
Keep face centered
Avoid extreme angles

## License

MIT License – see LICENSE file. 

## Acknowledgments

Google MediaPipe
Ultralytics YOLO
FastAPI community
React + Vite ecosystem


---
