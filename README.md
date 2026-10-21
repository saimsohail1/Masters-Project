# AR Virtual Try-On System (MSc Thesis)

A real-time augmented-reality try-on system that overlays accessories such as glasses and hats on a user's face through the browser. Built for my MSc in Computer Science at Atlantic Technological University, it combines facial landmark tracking, 3D head-pose estimation and real-world (millimetre) scaling so accessories sit at a realistic size and angle.

The full dissertation is included: [Masters_dissertation___Saim_Sohail.pdf](Masters_dissertation___Saim_Sohail.pdf). Notes on measurement accuracy are in [DIMENSIONAL_ACCURACY.md](DIMENSIONAL_ACCURACY.md).

## My Role

I worked on the project end to end, from research through engineering and evaluation:

- Designed the three-tier try-on architecture (Single Image, Real-Time, High-Accuracy)
- Built the FastAPI backend (MediaPipe, YOLO and 3D head-pose estimation)
- Implemented facial measurements (inter-pupillary distance, face width, pixel-to-mm scaling)
- Built the React/Vite frontend with a live WebRTC camera feed
- Integrated a product catalogue with real-world dimensions in millimetres
- Tuned performance for real-time streaming on CPU-only hardware
- Wrote the thesis, experiments and evaluation

## How It Works

```
Browser (React + Vite, WebRTC camera)
     |  HTTP (single image)  /  WebSocket (live stream)
     v
FastAPI backend
  1. Face detection   – MediaPipe Face Mesh (478 landmarks), YOLO for validation
  2. Head pose        – yaw, pitch and roll estimated in 3D
  3. Measurements     – IPD and face width converted from pixels to millimetres
  4. Placement        – accessory scaled, rotated to the head pose, alpha-blended
     |
     v
Rendered frame returned to the browser
```

### Three try-on modes

| Mode | Transport | Resolution | Best for |
|---|---|---|---|
| Single Image | HTTP `POST /single-tryon` | 640px | Highest quality captures and evaluation |
| Real-Time | WebSocket `/websocket-tryon` | 256px | Smooth live interaction |
| High-Accuracy | HTTP `POST /tryon` | 320px | Continuous try-on with better accuracy |

`GET /debug` is a simple health check.

## Tech Stack

- **Backend:** Python, FastAPI, WebSockets, MediaPipe, YOLOv8, OpenCV
- **Frontend:** React (Vite), Tailwind CSS, WebRTC

## Project Structure

```
backend/
├── api/
│   ├── main.py                 # FastAPI entry point
│   ├── routes/tryon.py         # Try-on endpoints
│   ├── services/
│   │   ├── mediapipe_service.py  # Face detection and measurements
│   │   └── yolo_service.py       # YOLO validation
│   └── utils/file_utils.py     # Image processing and overlay
├── accessories/                # Product images
└── requirements.txt

frontend/
├── src/
│   ├── components/             # ThreeTierTryOn, TryOnStream, VirtualTryOn
│   ├── pages/                  # Home, TryOnProducts
│   └── App.jsx
└── package.json
```

## Getting Started

**Prerequisites:** Python 3.9+, Node.js 16+, a webcam.

### Backend

```bash
git clone https://github.com/saimsohail1/Masters-Project.git
cd Masters-Project/backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install "uvicorn[standard]" websockets
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd Masters-Project/frontend
npm install
npm run dev
```

Open the app, allow camera access, pick a product (Classic Aviator, Raider Sunglasses, Winter Sport Glasses or Polo Hat) and choose a mode.

## Troubleshooting

- **WebSocket errors:** make sure `uvicorn[standard]` and `websockets` are installed.
- **Camera not detected:** use `localhost` or HTTPS, and check browser permissions.
- **Low accuracy:** use good lighting, keep your face centred and avoid extreme angles.

## Acknowledgements

Google MediaPipe, Ultralytics YOLO, FastAPI, and the React + Vite ecosystem.
