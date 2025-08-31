# api/routes/tryon.py
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import base64, numpy as np, cv2, os
import asyncio
from api.services.mediapipe_service import detect_face_landmarks_from_array
from api.utils.file_utils import place_accessory_on_face, place_accessory_on_face_cached  # using your updated function

router = APIRouter()

# Load YOLO model (with error handling for NumPy issues)
try:
    from ultralytics import YOLO
    yolo_model = YOLO('yolov8n.pt')
    YOLO_AVAILABLE = True
except Exception as e:
    print(f"YOLO not available: {e}")
    yolo_model = None
    YOLO_AVAILABLE = False

# Cache the glasses accessory to avoid repeated file reads
_glasses_cache = None
_glasses_path = "accessories/glasses.png"

# Request deduplication - prevent multiple streams
_active_requests = set()
_request_lock = asyncio.Lock()

def get_glasses_accessory():
    """Get cached glasses accessory or load from file"""
    global _glasses_cache
    if _glasses_cache is None and os.path.exists(_glasses_path):
        _glasses_cache = cv2.imread(_glasses_path, cv2.IMREAD_UNCHANGED)
    return _glasses_cache

@router.get("/debug")
async def debug_info():
    """Debug endpoint to check system status"""
    return {
        "yolo_available": YOLO_AVAILABLE,
        "accessories_exist": {
            "glasses": os.path.exists("accessories/glasses.png")
        },
        "current_dir": os.getcwd(),
        "numpy_version": np.__version__,
        "active_requests": len(_active_requests)
    }

@router.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """Detect objects in uploaded image using YOLO"""
    if not YOLO_AVAILABLE:
        return JSONResponse(status_code=503, content={"error": "YOLO not available"})
    
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        # Run YOLO detection
        results = yolo_model(frame)
        
        # Extract detection results
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = box.conf[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    class_name = yolo_model.names[cls]
                    
                    detections.append({
                        "class": class_name,
                        "confidence": float(conf),
                        "bbox": [float(x1), float(y1), float(x2), float(y2)]
                    })

        return JSONResponse(content={
            "detections": detections,
            "total_objects": len(detections)
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/tryon")
async def tryon_endpoint(file: UploadFile = File(...)):
    """Main try-on endpoint with YOLO object detection + glasses overlay - OPTIMIZED FOR REAL-TIME"""
    import uuid
    request_id = str(uuid.uuid4())
    
    async with _request_lock:
        # If there are already active requests, return the original frame
        if len(_active_requests) > 0:
            print(f"Request {request_id}: Skipping - {len(_active_requests)} active requests")
            data = await file.read()
            np_img = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
            if frame is not None:
                _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                b64 = base64.b64encode(buf).decode("utf-8")
                return {"image_base64": b64, "status": "skipped_multiple_requests"}
            return JSONResponse(status_code=400, content={"error": "Invalid image"})
        
        # Add this request to active requests
        _active_requests.add(request_id)
        print(f"Request {request_id}: Processing - Active requests: {len(_active_requests)}")
    
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        # ULTRA OPTIMIZE: Much smaller image size for real-time processing
        h, w = frame.shape[:2]
        target_size = 160  # Much smaller for speed (was 320)
        if w > target_size or h > target_size:
            scale = min(target_size/w, target_size/h)
            new_w, new_h = int(w * scale), int(h * scale)
            frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_NEAREST)

        # CORE FUNCTIONALITY: YOLO Object Detection (OPTIMIZED)
        detections = []
        yolo_success = False
        if YOLO_AVAILABLE:
            try:
                # Run YOLO detection with optimized settings
                results = yolo_model(frame, verbose=False)  # Disable verbose output
                
                # Extract detection results and draw bounding boxes
                for result in results:
                    boxes = result.boxes
                    if boxes is not None:
                        for box in boxes:
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            conf = box.conf[0].cpu().numpy()
                            cls = int(box.cls[0].cpu().numpy())
                            class_name = yolo_model.names[cls]
                            
                            # Only process high confidence detections for speed
                            if conf > 0.5:  # Confidence threshold
                                # Convert to integers for drawing
                                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                                
                                # Draw bounding box (simplified for speed)
                                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 1)
                                
                                detections.append({
                                    "class": class_name,
                                    "confidence": float(conf),
                                    "bbox": [float(x1), float(y1), float(x2), float(y2)]
                                })
                yolo_success = True
            except Exception as e:
                print(f"YOLO detection error: {e}")
                detections = []

        # BONUS FEATURE: Glasses Overlay (OPTIMIZED)
        glasses_applied = False
        try:
            # Get cached glasses accessory
            glasses_accessory = get_glasses_accessory()
            
            if glasses_accessory is not None:
                # Detect face landmarks with optimized settings
                landmarks = detect_face_landmarks_from_array(frame)
                
                if landmarks:
                    # Overlay glasses using cached accessory
                    frame = place_accessory_on_face_cached(frame, glasses_accessory, landmarks)
                    glasses_applied = True
        except Exception as e:
            print(f"Glasses overlay error: {e}")

        # ULTRA OPTIMIZE: Much lower JPEG quality for faster transmission
        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 40])  # Lower quality for speed
        b64 = base64.b64encode(buf).decode("utf-8")
        
        return {
            "image_base64": b64, 
            "status": "object_detection_complete" if yolo_success else "glasses_only",
            "detections": detections,
            "total_objects": len(detections),
            "glasses_applied": glasses_applied,
            "yolo_success": yolo_success
        }
    except Exception as e:
        print(f"Error in tryon: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # Always remove this request from active requests
        async with _request_lock:
            _active_requests.discard(request_id)
            print(f"Request {request_id}: Completed - Active requests: {len(_active_requests)}")
