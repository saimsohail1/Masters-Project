# AR Try-On System

A sophisticated Augmented Reality (AR) virtual try-on system that allows users to try on accessories in real-time using advanced computer vision techniques. The system features three different try-on modes optimized for different use cases, from high-quality single shots to real-time streaming.

## Features

### Three-Tier Try-On System
- **Single Image Try-On**: Maximum quality for screenshots and evaluation
- **Real-Time Stream**: WebSocket-based fast streaming for live interaction  
- **High-Accuracy Stream**: Balanced approach for continuous try-on experience

### Advanced Computer Vision
- **MediaPipe Face Mesh**: 478+ facial landmarks for precise positioning
- **YOLO Object Detection**: Enhanced face detection and validation
- **3D Head Pose Estimation**: Yaw, pitch, and roll correction for realistic placement
- **Dimensional Accuracy**: Real-world measurements using facial reference points

### Product Catalog
- **Glasses**: 3 different styles (Classic Aviator, Raider Sunglasses, Winter Sport)
- **Hats**: Polo hat with adjustable fit
- **Accurate Sizing**: Real-world dimensions (mm) for realistic appearance

### Modern UI/UX
- **React Frontend**: Modern, responsive interface with Tailwind CSS
- **Real-time Camera**: WebRTC integration for live video capture
- **Interactive Controls**: Product selection, measurement overlays, and system switching

## Architecture

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

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Webcam/Camera access

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ar-tryon-api
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   pip install 'uvicorn[standard]' websockets  # For WebSocket support
   ```

4. **Start the server**
   ```bash
   uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Open http://localhost:5173 in your browser
   - Navigate to "Three-Tier Try-On" for the main experience

## Usage

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

### Core Endpoints
- `POST /single-tryon` - Single image try-on with maximum quality
- `POST /tryon` - High-accuracy streaming try-on
- `WebSocket /websocket-tryon` - Real-time streaming try-on
- `GET /debug` - System status and health check

### Request Format
```json
{
  "product_type": "glasses|hat",
  "product_id": "product_1|product_2|product_3|product_4",
  "show_measurements": true|false,
  "file": "image_file"
}
```

### Response Format
```json
{
  "success": true,
  "processed_image": "base64_encoded_image",
  "measurements": {
    "ipd_pixels": 40.5,
    "face_width_mm": 140.2,
    "head_yaw_degrees": 2.3
  }
}
```

## Technical Details

### Computer Vision Pipeline

1. **Face Detection**
   - MediaPipe Face Mesh for 478+ landmarks
   - YOLO validation for enhanced accuracy
   - 3D pose estimation (yaw, pitch, roll)

2. **Facial Measurements**
   - Inter-pupillary distance (IPD) calculation
   - Face width and height measurements
   - Head top center detection for hat placement
   - Pixels-per-millimeter scaling for real-world accuracy

3. **Product Placement**
   - Dimensional scaling based on facial measurements
   - Head pose correction for realistic appearance
   - Alpha blending for seamless overlay
   - Boundary checking and clipping

### Product Database
```python
PRODUCT_DATABASE = {
    'glasses': {
        'product_1': {
            'name': 'Classic Aviator',
            'frame_width_mm': 135,
            'frame_height_mm': 50,
            'lens_width_mm': 58,
            'lens_height_mm': 40,
            'bridge_width_mm': 18,
            'temple_length_mm': 140,
            'fit_type': 'standard'
        }
        # ... more products
    },
    'hat': {
        'product_4': {
            'name': 'Polo Hat',
            'hat_width_mm': 220,
            'hat_height_mm': 120,
            'head_circumference_mm': 580,
            'fit_type': 'adjustable'
        }
    }
}
```

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

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   ```bash
   pip install 'uvicorn[standard]' websockets
   ```

2. **Camera Not Working**
   - Ensure HTTPS or localhost
   - Check browser permissions
   - Verify camera is not in use by other applications

3. **Poor Detection Quality**
   - Ensure good lighting
   - Position face clearly in frame
   - Avoid extreme angles or distances

4. **Server Not Starting**
   ```bash
   pkill -f uvicorn  # Kill existing processes
   uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Debug Mode
Enable measurement overlays to see facial landmarks and detection results:
```javascript
// In frontend
setShowMeasurements(true);
```

## System Requirements

### Minimum Requirements
- **CPU**: 4 cores, 2.5GHz
- **RAM**: 8GB
- **GPU**: Integrated graphics (CPU processing)
- **Storage**: 2GB free space

### Recommended Requirements
- **CPU**: 8 cores, 3.0GHz+
- **RAM**: 16GB+
- **GPU**: Dedicated GPU with CUDA support
- **Storage**: 5GB+ free space

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **MediaPipe** by Google for facial landmark detection
- **YOLO** by Ultralytics for object detection
- **FastAPI** for the high-performance backend
- **React** and **Vite** for the modern frontend
- **Tailwind CSS** for beautiful styling

## Support

For support, email your-email@example.com or create an issue in the repository.

---

**Built with cutting-edge computer vision and modern web technologies**