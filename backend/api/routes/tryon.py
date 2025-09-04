# api/routes/tryon.py
from fastapi import APIRouter, UploadFile, File, WebSocket, WebSocketDisconnect, Form
from fastapi.responses import JSONResponse
import base64, numpy as np, cv2, os
import asyncio
import json
from api.services.mediapipe_service import (
    detect_face_landmarks_from_array, 
    get_facial_measurements, 
    calculate_product_dimensions,
    FACIAL_LANDMARKS
)
from api.services.yolo_service import (
    detect_objects_yolo,
    detect_face_yolo,
    enhance_face_detection_with_yolo
)
from api.utils.file_utils import (
    place_accessory_on_face, 
    place_accessory_on_face_cached,
    place_product_with_measurements,
    draw_measurement_overlay
)

router = APIRouter()

# Cache the glasses accessory to avoid repeated file reads
_glasses_cache = None
_glasses_path = "accessories/glasses.png"

# Product database with accurate dimensions
PRODUCT_DATABASE = {
    'glasses': {
        'product_1': {
            'name': 'Classic Aviator',
            'frame_width_mm': 135,  # Standard medium frame width
            'frame_height_mm': 50,  # Standard frame height
            'lens_width_mm': 58,    # Standard lens width
            'lens_height_mm': 40,   # Standard lens height
            'bridge_width_mm': 18,  # Standard bridge width
            'temple_length_mm': 140, # Standard temple length
            'fit_type': 'standard',
            'image_file': 'glasses.png'  # Classic Aviator image
        },
        'product_2': {
            'name': 'Raider Sunglasses',
            'frame_width_mm': 145,  # Larger, wider frames
            'frame_height_mm': 55,  # Taller frames
            'lens_width_mm': 62,    # Wider lenses
            'lens_height_mm': 42,   # Taller lenses
            'bridge_width_mm': 20,  # Wider bridge
            'temple_length_mm': 145, # Longer temples
            'fit_type': 'wide',
            'image_file': 'raider_sunglasses.png'  # Raider sunglasses image
        },
        'product_3': {
            'name': 'Winter Sport Glasses',
            'frame_width_mm': 150,  # Extra wide for sports
            'frame_height_mm': 60,  # Extra tall for coverage
            'lens_width_mm': 65,    # Very wide lenses
            'lens_height_mm': 45,   # Very tall lenses
            'bridge_width_mm': 22,  # Extra wide bridge
            'temple_length_mm': 150, # Extra long temples
            'fit_type': 'extra_wide',
            'image_file': 'winter-sport_glasses.png'  # Winter sport glasses image
        }
    },
    'hat': {
        'product_4': {
            'name': 'Polo Hat',
            'hat_width_mm': 220,
            'hat_height_mm': 120,
            'head_circumference_mm': 580,
            'fit_type': 'adjustable',
            'image_file': 'hat.png'  # Polo hat image
        }
    }
}

# Request deduplication - prevent multiple streams
_active_requests = set()
_request_lock = asyncio.Lock()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

def get_hat_accessory(product_id="product_4"):
    """Get hat accessory image based on product ID"""
    # Map product IDs to their image files
    product_images = {
        'product_4': 'hat.png'  # Updated Hat image
    }
    
    image_file = product_images.get(product_id, 'hat.png')  # Default fallback
    image_path = f"accessories/{image_file}"
    
    if os.path.exists(image_path):
        hat_image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if hat_image is not None:
            print(f"DEBUG: Hat image loaded successfully - Shape: {hat_image.shape}, Channels: {hat_image.shape[2] if len(hat_image.shape) > 2 else 'Grayscale'}")
            # Check if the hat has alpha channel
            if len(hat_image.shape) == 3 and hat_image.shape[2] == 4:
                print(f"DEBUG: Hat has alpha channel - RGBA format")
            else:
                print(f"DEBUG: WARNING - Hat may not have alpha channel")
        else:
            print(f"DEBUG: ERROR - Failed to load hat image from {image_path}")
        return hat_image
    else:
        print(f"Warning: Hat image file not found: {image_path}")
        return None

def get_glasses_accessory(product_id="product_1"):
    """Get cached glasses accessory or load from file based on product ID"""
    global _glasses_cache
    
    # Map product IDs to their image files
    product_images = {
        'product_1': 'glasses.png',           # Classic Aviator
        'product_2': 'raider_sunglasses.png', # Raider Sunglasses
        'product_3': 'winter-sport-glasses.png' # Winter Sport Glasses (fixed filename)
    }
    
    image_file = product_images.get(product_id, 'glasses.png')  # Default fallback
    image_path = f"accessories/{image_file}"
    
    if os.path.exists(image_path):
        return cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    else:
        print(f"Warning: Image file not found: {image_path}")
        # Fallback to default glasses image
        fallback_path = "accessories/glasses.png"
        if os.path.exists(fallback_path):
            return cv2.imread(fallback_path, cv2.IMREAD_UNCHANGED)
        return None

@router.get("/debug")
async def debug_info():
    """Debug endpoint to check system status"""
    return {
        "yolo_available": True,  # Full version
        "accessories_exist": {
            "glasses": os.path.exists("accessories/glasses.png")
        },
        "current_dir": os.getcwd(),
        "numpy_version": np.__version__,
        "active_requests": len(_active_requests),
        "product_database": list(PRODUCT_DATABASE.keys()),
        "status": "three_tier_tryon_system_ready",
        "endpoints": {
            "single_image": "/single-tryon",
            "realtime_stream": "/websocket-tryon", 
            "high_accuracy": "/tryon"
        }
    }

@router.get("/test-products")
async def test_products():
    """Test endpoint to verify product database structure"""
    return {
        "message": "Product database test",
        "database_structure": PRODUCT_DATABASE,
        "available_types": list(PRODUCT_DATABASE.keys()),
        "products_by_type": {
            product_type: list(products.keys()) 
            for product_type, products in PRODUCT_DATABASE.items()
        },
        "example_lookup": {
            "glasses": {
                "product_1": PRODUCT_DATABASE.get('glasses', {}).get('product_1', 'NOT_FOUND'),
                "product_2": PRODUCT_DATABASE.get('glasses', {}).get('product_2', 'NOT_FOUND'),
            },
            "hat": {
                "product_4": PRODUCT_DATABASE.get('hat', {}).get('product_4', 'NOT_FOUND'),
            }
        }
    }

@router.get("/products")
async def get_products():
    """Get available products with their dimensions"""
    return {
        "products": PRODUCT_DATABASE,
        "total_categories": len(PRODUCT_DATABASE),
        "total_products": sum(len(products) for products in PRODUCT_DATABASE.values())
    }

# 1. SINGLE IMAGE TRY-ON - High quality, slower, for screenshots
@router.post("/single-tryon")
async def single_image_tryon(
    file: UploadFile = File(...), 
    product_type: str = Form("glasses"), 
    product_id: str = Form("product_1"),  # Fixed: Use correct product ID
    show_measurements: bool = Form(True)
):
    """Single Image Try-On: High-quality single shots for screenshots & evaluation"""
    import uuid
    request_id = str(uuid.uuid4())
    
    # ENHANCED LOGGING: Log all received parameters
    print(f"SINGLE IMAGE: Request {request_id}: Starting processing")
    print(f"SINGLE IMAGE: Received parameters:")
    print(f"  - product_type: '{product_type}' (type: {type(product_type)})")
    print(f"  - product_id: '{product_id}' (type: {type(product_id)})")
    print(f"  - show_measurements: {show_measurements}")
    print(f"  - file: {file.filename if file else 'None'}")
    
    # Log available products in database
    print(f"SINGLE IMAGE: Available products in database:")
    for pt in PRODUCT_DATABASE:
        print(f"  {pt}: {list(PRODUCT_DATABASE[pt].keys())}")
    
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        # Store original dimensions for scaling back
        original_h, original_w = frame.shape[:2]
        
        # HIGH QUALITY: Larger image size for maximum accuracy
        target_size = 640  # Increased for maximum quality
        if original_w > target_size or original_h > target_size:
            scale = min(target_size/original_w, target_size/original_h)
            new_w, new_h = int(original_w * scale), int(original_h * scale)
            frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

        # COMPREHENSIVE: Use both MediaPipe and YOLO for maximum accuracy
        facial_measurements = None
        product_dimensions = None
        placement_info = None
        
        try:
            print(f"SINGLE IMAGE: Starting comprehensive face detection with MediaPipe + YOLO")
            
            # Get facial landmarks with 3D data (MediaPipe)
            landmarks_2d, landmarks_3d = detect_face_landmarks_from_array(frame)
            
            # Get YOLO face detection
            yolo_face_detections = detect_face_yolo(frame)
            yolo_objects = detect_objects_yolo(frame)
            
            # Enhance detection with combined approach
            enhanced_detection = enhance_face_detection_with_yolo(frame, landmarks_2d)
            
            if landmarks_2d and landmarks_3d:
                print(f"SINGLE IMAGE: Found {len(landmarks_2d)} MediaPipe landmarks")
                # Calculate comprehensive facial measurements
                facial_measurements = get_facial_measurements(landmarks_2d, landmarks_3d, frame.shape)
                
                if facial_measurements:
                    print(f"SINGLE IMAGE: Facial measurements calculated successfully")
                    
                    # Add YOLO validation to measurements
                    if enhanced_detection['yolo_face_detected']:
                        facial_measurements['yolo_validation'] = True
                        facial_measurements['yolo_face_bbox'] = enhanced_detection['yolo_face_bbox']
                        print(f"SINGLE IMAGE: YOLO validation successful")
                    else:
                        facial_measurements['yolo_validation'] = False
                        print(f"SINGLE IMAGE: YOLO validation failed - using MediaPipe only")
                    
                    # Get product dimensions from database
                    print(f"SINGLE IMAGE: Looking up product - type: {product_type}, id: {product_id}")
                    if product_type in PRODUCT_DATABASE and product_id in PRODUCT_DATABASE[product_type]:
                        product_dimensions = PRODUCT_DATABASE[product_type][product_id]
                        print(f"SINGLE IMAGE: Found product dimensions: {product_dimensions}")
                    else:
                        print(f"SINGLE IMAGE: Product not found in database, calculating generic dimensions")
                        product_dimensions = calculate_product_dimensions(product_type, facial_measurements)
                        
        except Exception as e:
            print(f"SINGLE IMAGE: Enhanced detection error: {e}")
            facial_measurements = None

        # HIGH QUALITY: Accurate Product Placement
        product_applied = False
        try:
            if product_type == 'glasses':
                glasses_accessory = get_glasses_accessory(product_id)
                
                if glasses_accessory is not None and facial_measurements:
                    frame, placement_info = place_product_with_measurements(
                        frame, glasses_accessory, facial_measurements, 
                        product_type, product_dimensions
                    )
                    product_applied = True
                    
            elif product_type == 'hat':
                # For hats, load hat accessories
                hat_accessory = get_hat_accessory(product_id)
                if hat_accessory is not None and facial_measurements:
                    print(f"SINGLE IMAGE: Hat accessory loaded for {product_id}")
                    # Actually place the hat using the same placement function as glasses
                    frame, placement_info = place_product_with_measurements(
                        frame, hat_accessory, facial_measurements, 
                        product_type, product_dimensions
                    )
                    product_applied = True
                    print(f"SINGLE IMAGE: Hat placed successfully")
                    
        except Exception as e:
            print(f"SINGLE IMAGE: Product placement error: {e}")

        # HIGH QUALITY: Always show measurements for single image
        if facial_measurements:
            frame = draw_measurement_overlay(frame, facial_measurements, product_dimensions)

        # Scale back to original size
        if original_w != frame.shape[1] or original_h != frame.shape[0]:
            frame = cv2.resize(frame, (original_w, original_h), interpolation=cv2.INTER_CUBIC)

        # HIGH QUALITY: Maximum JPEG quality for screenshots
        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
        b64 = base64.b64encode(buf).decode("utf-8")
        
        # Comprehensive response with all data
        response_data = {
            "image_base64": b64, 
            "status": "single_image_complete",
            "mode": "single_image",
            "quality": "maximum",
            "product_applied": product_applied,
            "product_type": product_type,
            "product_id": product_id
        }
        
        if facial_measurements:
            response_data["facial_measurements"] = {
                "ipd_mm": round(facial_measurements.get('estimated_ipd_mm', 0), 1),
                "face_width_mm": round(facial_measurements.get('face_width_mm', 0), 1),
                "head_yaw_degrees": round(facial_measurements.get('head_yaw_degrees', 0), 1),
                "head_roll_degrees": round(facial_measurements.get('head_roll_degrees', 0), 1),
                "pixels_per_mm": round(facial_measurements.get('pixels_per_mm', 0), 3)
            }
        
        if product_dimensions:
            response_data["product_dimensions"] = product_dimensions
            
        if placement_info:
            response_data["placement_info"] = placement_info
        
        return response_data
        
    except Exception as e:
        print(f"SINGLE IMAGE: Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# 2. REAL-TIME STREAM - WebSocket-based, fast, adaptive quality
@router.websocket("/websocket-tryon")
async def realtime_tryon_websocket(websocket: WebSocket):
    """Real-Time Stream: WebSocket-based, fast, adaptive quality for live interaction"""
    await manager.connect(websocket)
    print(f"REALTIME: WebSocket connected. Total connections: {len(manager.active_connections)}")
    
    try:
        while True:
            # Receive base64 image data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                # Process frame for real-time try-on
                frame_data = message.get("image_base64", "")
                product_type = message.get("product_type", "glasses")
                product_id = message.get("product_id", "product_1")  # Fixed: Use correct product ID
                
                # ENHANCED LOGGING: Log all received parameters
                print(f"REALTIME: Received frame - Request ID: {len(manager.active_connections)}")
                print(f"REALTIME: Received parameters:")
                print(f"  - product_type: '{product_type}' (type: {type(product_type)})")
                print(f"  - product_id: '{product_id}' (type: {type(product_id)})")
                print(f"  - frame_data_length: {len(frame_data)}")
                
                # Log available products in database
                print(f"REALTIME: Available products in database:")
                for pt in PRODUCT_DATABASE:
                    print(f"  {pt}: {list(PRODUCT_DATABASE[pt].keys())}")
                
                try:
                    # Decode base64 image
                    frame_bytes = base64.b64decode(frame_data)
                    np_img = np.frombuffer(frame_bytes, np.uint8)
                    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
                    
                    if frame is not None:
                        # FAST PROCESSING: Smaller image size for speed
                        target_size = 256  # Smaller for speed
                        original_h, original_w = frame.shape[:2]
                        if original_w > target_size or original_h > target_size:
                            scale = min(target_size/original_w, target_size/original_h)
                            new_w, new_h = int(original_w * scale), int(original_h * scale)
                            frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
                        
                        # FAST: MediaPipe only (skip YOLO for speed)
                        facial_measurements = None
                        try:
                            landmarks_2d, landmarks_3d = detect_face_landmarks_from_array(frame)
                            
                            if landmarks_2d and landmarks_3d:
                                facial_measurements = get_facial_measurements(landmarks_2d, landmarks_3d, frame.shape)
                                
                        except Exception as e:
                            print(f"REALTIME: MediaPipe error: {e}")
                        
                        # FAST: Quick product placement
                        if facial_measurements:
                            try:
                                if product_type == 'glasses':
                                    print(f"REALTIME: Looking up product - type: {product_type}, id: {product_id}")
                                    if product_type in PRODUCT_DATABASE and product_id in PRODUCT_DATABASE[product_type]:
                                        product_dimensions = PRODUCT_DATABASE[product_type][product_id]
                                        print(f"REALTIME: Found product dimensions: {product_dimensions}")
                                    else:
                                        print(f"REALTIME: Product not found in database - type: {product_type}, id: {product_id}")
                                        product_dimensions = {}
                                    
                                    glasses_accessory = get_glasses_accessory(product_id)
                                    if glasses_accessory is not None:
                                        frame, _ = place_product_with_measurements(
                                            frame, glasses_accessory, facial_measurements, 
                                            product_type, product_dimensions
                                        )
                                        
                                elif product_type == 'hat':
                                    print(f"REALTIME: Processing hat - type: {product_type}, id: {product_id}")
                                    if product_type in PRODUCT_DATABASE and product_id in PRODUCT_DATABASE[product_type]:
                                        product_dimensions = PRODUCT_DATABASE[product_type][product_id]
                                        print(f"REALTIME: Found hat dimensions: {product_dimensions}")
                                    else:
                                        product_dimensions = {}
                                    
                                    hat_accessory = get_hat_accessory(product_id)
                                    if hat_accessory is not None:
                                        print(f"REALTIME: Hat accessory loaded for {product_id}")
                                        # Actually place the hat
                                        frame, _ = place_product_with_measurements(
                                            frame, hat_accessory, facial_measurements, 
                                            product_type, product_dimensions
                                        )
                                        print(f"REALTIME: Hat placed successfully")
                                        
                            except Exception as e:
                                print(f"REALTIME: Product placement error: {e}")
                        
                        # Scale back to original size
                        if original_w != frame.shape[1] or original_h != frame.shape[0]:
                            frame = cv2.resize(frame, (original_w, original_h), interpolation=cv2.INTER_LINEAR)
                        
                        # FAST: Lower quality for speed
                        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                        b64 = base64.b64encode(buf).decode("utf-8")
                        
                        # Send processed frame back
                        response = {
                            "type": "processed_frame",
                            "image_base64": b64,
                            "status": "realtime_complete",
                            "mode": "realtime_stream",
                            "quality": "adaptive_fast"
                        }
                        
                        await websocket.send_text(json.dumps(response))
                        
                except Exception as e:
                    print(f"REALTIME: Frame processing error: {e}")
                    error_response = {
                        "type": "error",
                        "error": str(e),
                        "status": "realtime_error"
                    }
                    await websocket.send_text(json.dumps(error_response))
                    
            elif message.get("type") == "ping":
                # Keep connection alive
                await websocket.send_text(json.dumps({"type": "pong"}))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"REALTIME: WebSocket disconnected. Total connections: {len(manager.active_connections)}")
    except Exception as e:
        print(f"REALTIME: WebSocket error: {e}")
        manager.disconnect(websocket)

# 3. HIGH-ACCURACY STREAM - Current system, balanced approach
@router.post("/tryon")
async def tryon_endpoint(
    file: UploadFile = File(...), 
    product_type: str = Form("glasses"), 
    product_id: str = Form("product_1"), 
    show_measurements: bool = Form(False)
):
    """High-Accuracy Stream: Balanced approach for continuous try-on experience"""
    import uuid
    request_id = str(uuid.uuid4())
    
    async with _request_lock:
        # If there are already active requests, return the original frame
        if len(_active_requests) > 0:
            print(f"HIGH-ACCURACY: Request {request_id}: Skipping - {len(_active_requests)} active requests")
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
        print(f"HIGH-ACCURACY: Request {request_id}: Processing - Active requests: {len(_active_requests)}")
    
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        # Log received parameters
        print(f"HIGH-ACCURACY: Request {request_id}: Processing - Active requests: {len(_active_requests)}")
        print(f"HIGH-ACCURACY: Received parameters:")
        print(f"  - product_type: '{product_type}' (type: {type(product_type)})")
        print(f"  - product_id: '{product_id}' (type: {type(product_id)})")
        print(f"  - show_measurements: {show_measurements}")
        
        # Log available products in database
        print(f"HIGH-ACCURACY: Available products in database:")
        for pt in PRODUCT_DATABASE:
            print(f"  {pt}: {list(PRODUCT_DATABASE[pt].keys())}")

        # Store original dimensions for scaling back
        original_h, original_w = frame.shape[:2]
        
        # BALANCED: Medium image size for balanced accuracy/speed
        target_size = 320  # Balanced size
        if original_w > target_size or original_h > target_size:
            scale = min(target_size/original_w, target_size/original_h)
            new_w, new_h = int(original_w * scale), int(original_h * scale)
            frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

        # BALANCED: Comprehensive facial measurements
        facial_measurements = None
        product_dimensions = None
        placement_info = None
        
        try:
            # BALANCED: Use both MediaPipe and YOLO for good accuracy
            print(f"HIGH-ACCURACY: Starting balanced face detection with MediaPipe + YOLO")
            
            # Get facial landmarks with 3D data (MediaPipe)
            landmarks_2d, landmarks_3d = detect_face_landmarks_from_array(frame)
            
            # Get YOLO face detection
            yolo_face_detections = detect_face_yolo(frame)
            yolo_objects = detect_objects_yolo(frame)
            
            # Enhance detection with combined approach
            enhanced_detection = enhance_face_detection_with_yolo(frame, landmarks_2d)
            
            print(f"HIGH-ACCURACY: MediaPipe landmarks: {landmarks_2d is not None}, landmarks_3d: {landmarks_3d is not None}")
            print(f"HIGH-ACCURACY: YOLO face detections: {len(yolo_face_detections)}")
            print(f"HIGH-ACCURACY: YOLO objects detected: {len(yolo_objects)}")
            print(f"HIGH-ACCURACY: Enhanced detection confidence: {enhanced_detection['confidence']}")
            
            if landmarks_2d and landmarks_3d:
                print(f"HIGH-ACCURACY: Found {len(landmarks_2d)} MediaPipe landmarks")
                # Calculate comprehensive facial measurements
                facial_measurements = get_facial_measurements(landmarks_2d, landmarks_3d, frame.shape)
                
                if facial_measurements:
                    print(f"HIGH-ACCURACY: Facial measurements calculated successfully")
                    
                    # Add YOLO validation to measurements
                    if enhanced_detection['yolo_face_detected']:
                        facial_measurements['yolo_validation'] = True
                        facial_measurements['yolo_face_bbox'] = enhanced_detection['yolo_face_bbox']
                        print(f"HIGH-ACCURACY: YOLO validation successful - face bbox: {enhanced_detection['yolo_face_bbox']}")
                    else:
                        facial_measurements['yolo_validation'] = False
                        print(f"HIGH-ACCURACY: YOLO validation failed - using MediaPipe only")
                    
                    # Get product dimensions from database
                    if product_type in PRODUCT_DATABASE and product_id in PRODUCT_DATABASE[product_type]:
                        product_dimensions = PRODUCT_DATABASE[product_type][product_id]
                        print(f"HIGH-ACCURACY: Using product dimensions from database: {product_dimensions}")
                    else:
                        print(f"HIGH-ACCURACY: Product not found in database - type: {product_type}, id: {product_id}")
                        print(f"HIGH-ACCURACY: Available types: {list(PRODUCT_DATABASE.keys())}")
                        if product_type in PRODUCT_DATABASE:
                            print(f"HIGH-ACCURACY: Available IDs for {product_type}: {list(PRODUCT_DATABASE[product_type].keys())}")
                        # Calculate generic dimensions based on facial measurements
                        product_dimensions = calculate_product_dimensions(product_type, facial_measurements)
                        print(f"HIGH-ACCURACY: Calculated generic dimensions: {product_dimensions}")
                else:
                    print(f"HIGH-ACCURACY: Failed to calculate facial measurements")
            else:
                print(f"HIGH-ACCURACY: No MediaPipe landmarks detected")
                # Try YOLO-only approach as fallback
                if yolo_face_detections:
                    print(f"HIGH-ACCURACY: Using YOLO-only detection as fallback")
                    facial_measurements = {
                        'yolo_only': True,
                        'yolo_face_bbox': yolo_face_detections[0]['bbox'],
                        'confidence': yolo_face_detections[0]['confidence']
                    }
                else:
                    print(f"HIGH-ACCURACY: No face detected by either MediaPipe or YOLO")
                    facial_measurements = None
                        
        except Exception as e:
            print(f"HIGH-ACCURACY: Enhanced detection error: {e}")
            import traceback
            traceback.print_exc()
            facial_measurements = None

        # BALANCED: Accurate Product Placement
        product_applied = False
        try:
            if product_type == 'glasses':
            # Get cached glasses accessory
                glasses_accessory = get_glasses_accessory(product_id)
                
                if glasses_accessory is not None and facial_measurements:
                    # Use enhanced placement with measurements
                    frame, placement_info = place_product_with_measurements(
                        frame, glasses_accessory, facial_measurements, 
                        product_type, product_dimensions
                    )
                    product_applied = True
                    
            elif product_type == 'hat':
                # For hats, load hat accessories
                hat_accessory = get_hat_accessory(product_id)
                if hat_accessory is not None and facial_measurements:
                    print(f"HIGH-ACCURACY: Hat accessory loaded for {product_id}")
                    # Actually place the hat using the same placement function as glasses
                    frame, placement_info = place_product_with_measurements(
                        frame, hat_accessory, facial_measurements, 
                        product_type, product_dimensions
                    )
                    product_applied = True
                    print(f"HIGH-ACCURACY: Hat placed successfully")
                    
        except Exception as e:
            print(f"HIGH-ACCURACY: Product placement error: {e}")

        # BALANCED: Draw measurement overlays if requested
        if show_measurements and facial_measurements:
            frame = draw_measurement_overlay(frame, facial_measurements, product_dimensions)

        # Scale back to original size if needed
        if original_w != frame.shape[1] or original_h != frame.shape[0]:
            frame = cv2.resize(frame, (original_w, original_h), interpolation=cv2.INTER_LINEAR)

        # BALANCED: Medium JPEG quality for balanced speed/quality
        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 60])  # Balanced quality
        b64 = base64.b64encode(buf).decode("utf-8")
        
        # Enhanced response with measurement data
        response_data = {
            "image_base64": b64, 
            "status": "high_accuracy_complete",
            "mode": "high_accuracy_stream",
            "quality": "balanced",
            "detections": [],  # Simplified version
            "total_objects": 0,
            "product_applied": product_applied,
            "yolo_success": False,  # Simplified version
            "product_type": product_type,
            "product_id": product_id
        }
        
        # Add measurement data if available
        if facial_measurements:
            response_data["facial_measurements"] = {
                "ipd_mm": round(facial_measurements.get('estimated_ipd_mm', 0), 1),
                "face_width_mm": round(facial_measurements.get('face_width_mm', 0), 1),
                "head_yaw_degrees": round(facial_measurements.get('head_yaw_degrees', 0), 1),
                "head_roll_degrees": round(facial_measurements.get('head_roll_degrees', 0), 1)
            }
        
        if product_dimensions:
            response_data["product_dimensions"] = product_dimensions
            
        if placement_info:
            response_data["placement_info"] = {
                "placement_coordinates": placement_info.get('placement_coordinates'),
                "accuracy_metrics": placement_info.get('accuracy_metrics', {}),
                "head_pose": placement_info.get('head_pose', {})
            }
        
        return response_data
        
    except Exception as e:
        print(f"HIGH-ACCURACY: Error in tryon: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # Always remove this request from active requests
        async with _request_lock:
            _active_requests.discard(request_id)
            print(f"HIGH-ACCURACY: Request {request_id}: Completed - Active requests: {len(_active_requests)}")

@router.post("/measurements")
async def get_measurements_only(file: UploadFile = File(...)):
    """Get facial measurements without product placement"""
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        # Get facial landmarks with 3D data
        landmarks_2d, landmarks_3d = detect_face_landmarks_from_array(frame)
        
        if not landmarks_2d or not landmarks_3d:
            return JSONResponse(content={
                "error": "No face detected",
                "measurements": None
            })

        # Calculate comprehensive facial measurements
        facial_measurements = get_facial_measurements(landmarks_2d, landmarks_3d, frame.shape)
        
        if not facial_measurements:
            return JSONResponse(content={
                "error": "Could not calculate measurements",
                "measurements": None
            })

        # Calculate product dimensions for different types
        glasses_dimensions = calculate_product_dimensions('glasses', facial_measurements)
        hat_dimensions = calculate_product_dimensions('hat', facial_measurements)

        return {
            "facial_measurements": {
                "ipd_mm": round(facial_measurements.get('estimated_ipd_mm', 0), 1),
                "face_width_mm": round(facial_measurements.get('face_width_mm', 0), 1),
                "head_yaw_degrees": round(facial_measurements.get('head_yaw_degrees', 0), 1),
                "head_roll_degrees": round(facial_measurements.get('head_roll_degrees', 0), 1),
                "pixels_per_mm": round(facial_measurements.get('pixels_per_mm', 0), 3)
            },
            "recommended_products": {
                "glasses": glasses_dimensions,
                "hat": hat_dimensions
            },
            "measurement_accuracy": "high" if facial_measurements.get('pixels_per_mm', 0) > 0 else "low"
        }
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/calibrate-glasses")
async def calibrate_glasses_dimensions(
    file: UploadFile = File(...),
    frame_width_mm: float = 135,
    frame_height_mm: float = 50,
    lens_width_mm: float = 58,
    lens_height_mm: float = 40,
    bridge_width_mm: float = 18
):
    """Calibrate glasses dimensions for your specific glasses image"""
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        # Get facial landmarks and measurements
        landmarks_2d, landmarks_3d = detect_face_landmarks_from_array(frame)
        
        if not landmarks_2d or not landmarks_3d:
            return JSONResponse(content={
                "error": "No face detected",
                "calibration": None
            })

        facial_measurements = get_facial_measurements(landmarks_2d, landmarks_3d, frame.shape)
        
        if not facial_measurements:
            return JSONResponse(content={
                "error": "Could not calculate measurements",
                "calibration": None
            })

        # Create custom product dimensions
        custom_dimensions = {
            'name': 'Calibrated Glasses',
            'frame_width_mm': frame_width_mm,
            'frame_height_mm': frame_height_mm,
            'lens_width_mm': lens_width_mm,
            'lens_height_mm': lens_height_mm,
            'bridge_width_mm': bridge_width_mm,
            'temple_length_mm': 140,  # Standard temple length
            'fit_type': 'custom'
        }

        # Place glasses with custom dimensions
        result_image, placement_info = place_product_with_measurements(
            frame, 'glasses', facial_measurements, custom_dimensions
        )

        # Encode result
        _, buf = cv2.imencode(".jpg", result_image, [cv2.IMWRITE_JPEG_QUALITY, 80])
        b64 = base64.b64encode(buf).decode("utf-8")

        return {
            "calibrated_image": b64,
            "custom_dimensions": custom_dimensions,
            "facial_measurements": {
                "ipd_mm": round(facial_measurements.get('estimated_ipd_mm', 0), 1),
                "face_width_mm": round(facial_measurements.get('face_width_mm', 0), 1),
                "pixels_per_mm": round(facial_measurements.get('pixels_per_mm', 0), 3)
            },
            "placement_info": placement_info,
            "scaling_factor": round(facial_measurements.get('pixels_per_mm', 0) * custom_dimensions['frame_width_mm'], 1),
            "status": "calibration_complete"
        }
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/debug-measurements")
async def debug_facial_measurements(file: UploadFile = File(...)):
    """Debug endpoint to show detailed facial measurements and scaling"""
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        # Get facial landmarks and measurements
        landmarks_2d, landmarks_3d = detect_face_landmarks_from_array(frame)
        
        if not landmarks_2d or not landmarks_3d:
            return JSONResponse(content={
                "error": "No face detected",
                "debug_info": None
            })

        # ENHANCED: Use both MediaPipe and YOLO
        yolo_face_detections = detect_face_yolo(frame)
        yolo_objects = detect_objects_yolo(frame)
        enhanced_detection = enhance_face_detection_with_yolo(frame, landmarks_2d)
        
        facial_measurements = get_facial_measurements(landmarks_2d, landmarks_3d, frame.shape)
        
        if not facial_measurements:
            return JSONResponse(content={
                "error": "Could not calculate measurements",
                "debug_info": None
            })

        # Calculate what the glasses size would be
        pixels_per_mm = facial_measurements.get('pixels_per_mm', 0)
        ipd_pixels = facial_measurements.get('ipd_pixels', 0)
        ipd_mm = facial_measurements.get('estimated_ipd_mm', 63)
        
        # Test different frame sizes
        test_frame_width_mm = 135  # Standard glasses width
        test_frame_width_pixels = int(test_frame_width_mm * pixels_per_mm)
        
        # Calculate what the old method would give
        eye_distance = ipd_pixels
        old_method_width = int(eye_distance * 2.0)  # Old scaling method
        
        return {
            "debug_info": {
                "image_dimensions": {
                    "width": frame.shape[1],
                    "height": frame.shape[0]
                },
                "detection_methods": {
                    "mediapipe_success": landmarks_2d is not None and len(landmarks_2d) > 0,
                    "yolo_face_detections": len(yolo_face_detections),
                    "yolo_objects_detected": len(yolo_objects),
                    "enhanced_confidence": enhanced_detection['confidence'],
                    "yolo_face_bbox": enhanced_detection.get('yolo_face_bbox')
                },
                "facial_measurements": {
                    "ipd_pixels": round(ipd_pixels, 2),
                    "ipd_mm": round(ipd_mm, 2),
                    "pixels_per_mm": round(pixels_per_mm, 4),
                    "face_width_pixels": round(facial_measurements.get('face_width_pixels', 0), 2),
                    "face_width_mm": round(facial_measurements.get('face_width_mm', 0), 2)
                },
                "scaling_comparison": {
                    "new_method_135mm_pixels": test_frame_width_pixels,
                    "old_method_pixels": old_method_width,
                    "scaling_ratio": round(test_frame_width_pixels / old_method_width, 2) if old_method_width > 0 else 0
                },
                "landmark_accuracy": {
                    "landmarks_detected": len(landmarks_2d) if landmarks_2d else 0,
                    "key_points": {
                        "left_eye_inner": landmarks_2d[FACIAL_LANDMARKS['left_eye_inner']] if landmarks_2d else None,
                        "right_eye_inner": landmarks_2d[FACIAL_LANDMARKS['right_eye_inner']] if landmarks_2d else None,
                        "eye_center": facial_measurements.get('eye_center'),
                        "nose_bridge": facial_measurements.get('nose_bridge')
                    }
                }
            },
            "recommendations": {
                "if_glasses_too_small": "Increase pixels_per_mm calculation or use larger frame_width_mm",
                "if_glasses_too_large": "Decrease pixels_per_mm calculation or use smaller frame_width_mm",
                "optimal_frame_width_mm": round(ipd_mm * 1.1, 1),
                "optimal_frame_height_mm": round(ipd_mm * 0.4, 1)
            }
        }
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
