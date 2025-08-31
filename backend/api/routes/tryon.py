# api/routes/tryon.py
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import base64, numpy as np, cv2, os
import asyncio
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
        'current_glasses': {
            'name': 'Current Glasses (Realistic Sizing)',
            'frame_width_mm': 135,  # Standard medium frame width
            'frame_height_mm': 50,  # Standard frame height
            'lens_width_mm': 58,    # Standard lens width
            'lens_height_mm': 40,   # Standard lens height
            'bridge_width_mm': 18,  # Standard bridge width
            'temple_length_mm': 140, # Standard temple length
            'fit_type': 'standard',
            'image_file': 'glasses.png'  # Your current image
        },
        'classic_aviator': {
            'name': 'Classic Aviator Sunglasses',
            'frame_width_mm': 145,  # Larger, wider frames
            'frame_height_mm': 55,  # Taller frames
            'lens_width_mm': 62,    # Wider lenses
            'lens_height_mm': 42,   # Taller lenses
            'bridge_width_mm': 20,  # Wider bridge
            'temple_length_mm': 145, # Longer temples
            'fit_type': 'wide',
            'image_file': 'glasses.png'  # Same image, different scaling
        },
        'round_retro': {
            'name': 'Round Retro Glasses',
            'frame_width_mm': 125,  # Smaller, narrower frames
            'frame_height_mm': 45,  # Shorter frames
            'lens_width_mm': 52,    # Smaller lenses
            'lens_height_mm': 38,   # Shorter lenses
            'bridge_width_mm': 16,  # Narrower bridge
            'temple_length_mm': 135, # Shorter temples
            'fit_type': 'narrow',
            'image_file': 'glasses.png'  # Same image, different scaling
        },
        'sport_performance': {
            'name': 'Sport Performance Sunglasses',
            'frame_width_mm': 150,  # Extra wide for sports
            'frame_height_mm': 60,  # Extra tall for coverage
            'lens_width_mm': 65,    # Very wide lenses
            'lens_height_mm': 45,   # Very tall lenses
            'bridge_width_mm': 22,  # Extra wide bridge
            'temple_length_mm': 150, # Extra long temples
            'fit_type': 'extra_wide',
            'image_file': 'glasses.png'  # Same image, different scaling
        },
        'your_custom_glasses': {
            'name': 'Your Custom Glasses',
            'frame_width_mm': 130,  # Total width of the frame
            'frame_height_mm': 48,  # Height of the frame
            'lens_width_mm': 56,    # Width of each lens
            'lens_height_mm': 39,   # Height of each lens
            'bridge_width_mm': 17,  # Width of the bridge (nose piece)
            'temple_length_mm': 138, # Length of the temple arms
            'fit_type': 'standard',
            'image_file': 'glasses.png'  # Reference to your current image
        }
    },
    'hat': {
        'baseball_cap': {
            'name': 'Baseball Cap',
            'hat_width_mm': 220,
            'hat_height_mm': 120,
            'head_circumference_mm': 580,
            'fit_type': 'adjustable'
        },
        'fedora': {
            'name': 'Fedora Hat',
            'hat_width_mm': 240,
            'hat_height_mm': 140,
            'head_circumference_mm': 600,
            'fit_type': 'standard'
        }
    }
}

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
        "yolo_available": False,  # Simplified version
        "accessories_exist": {
            "glasses": os.path.exists("accessories/glasses.png")
        },
        "current_dir": os.getcwd(),
        "numpy_version": np.__version__,
        "active_requests": len(_active_requests),
        "product_database": list(PRODUCT_DATABASE.keys()),
        "status": "enhanced_dimensional_accuracy_ready"
    }

@router.get("/products")
async def get_products():
    """Get available products with their dimensions"""
    return {
        "products": PRODUCT_DATABASE,
        "total_categories": len(PRODUCT_DATABASE),
        "total_products": sum(len(products) for products in PRODUCT_DATABASE.values())
    }

@router.post("/tryon")
async def tryon_endpoint(file: UploadFile = File(...), product_type: str = "glasses", product_id: str = "classic_aviator", show_measurements: bool = False):
    """Enhanced try-on endpoint with accurate measurements and product dimensions"""
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

        # Store original dimensions for scaling back
        original_h, original_w = frame.shape[:2]
        
        # ULTRA OPTIMIZE: Much smaller image size for real-time processing
        target_size = 320  # Increased for better measurement accuracy
        if original_w > target_size or original_h > target_size:
            scale = min(target_size/original_w, target_size/original_h)
            new_w, new_h = int(original_w * scale), int(original_h * scale)
            frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

        # ENHANCED: Comprehensive facial measurements
        facial_measurements = None
        product_dimensions = None
        placement_info = None
        
        try:
            # ENHANCED: Use both MediaPipe and YOLO for better accuracy
            print(f"DEBUG: Starting enhanced face detection with MediaPipe + YOLO")
            
            # Get facial landmarks with 3D data (MediaPipe)
            landmarks_2d, landmarks_3d = detect_face_landmarks_from_array(frame)
            
            # Get YOLO face detection
            yolo_face_detections = detect_face_yolo(frame)
            yolo_objects = detect_objects_yolo(frame)
            
            # Enhance detection with combined approach
            enhanced_detection = enhance_face_detection_with_yolo(frame, landmarks_2d)
            
            print(f"DEBUG: MediaPipe landmarks: {landmarks_2d is not None}, landmarks_3d: {landmarks_3d is not None}")
            print(f"DEBUG: YOLO face detections: {len(yolo_face_detections)}")
            print(f"DEBUG: YOLO objects detected: {len(yolo_objects)}")
            print(f"DEBUG: Enhanced detection confidence: {enhanced_detection['confidence']}")
            
            if landmarks_2d and landmarks_3d:
                print(f"DEBUG: Found {len(landmarks_2d)} MediaPipe landmarks")
                # Calculate comprehensive facial measurements
                facial_measurements = get_facial_measurements(landmarks_2d, landmarks_3d, frame.shape)
                
                if facial_measurements:
                    print(f"DEBUG: Facial measurements calculated successfully")
                    
                    # Add YOLO validation to measurements
                    if enhanced_detection['yolo_face_detected']:
                        facial_measurements['yolo_validation'] = True
                        facial_measurements['yolo_face_bbox'] = enhanced_detection['yolo_face_bbox']
                        print(f"DEBUG: YOLO validation successful - face bbox: {enhanced_detection['yolo_face_bbox']}")
                    else:
                        facial_measurements['yolo_validation'] = False
                        print(f"DEBUG: YOLO validation failed - using MediaPipe only")
                    
                    # Get product dimensions from database
                    if product_type in PRODUCT_DATABASE and product_id in PRODUCT_DATABASE[product_type]:
                        product_dimensions = PRODUCT_DATABASE[product_type][product_id]
                        print(f"DEBUG: Using product dimensions from database: {product_dimensions}")
                    else:
                        # Calculate generic dimensions based on facial measurements
                        product_dimensions = calculate_product_dimensions(product_type, facial_measurements)
                        print(f"DEBUG: Calculated generic dimensions: {product_dimensions}")
                else:
                    print(f"DEBUG: Failed to calculate facial measurements")
            else:
                print(f"DEBUG: No MediaPipe landmarks detected")
                # Try YOLO-only approach as fallback
                if yolo_face_detections:
                    print(f"DEBUG: Using YOLO-only detection as fallback")
                    facial_measurements = {
                        'yolo_only': True,
                        'yolo_face_bbox': yolo_face_detections[0]['bbox'],
                        'confidence': yolo_face_detections[0]['confidence']
                    }
                else:
                    print(f"DEBUG: No face detected by either MediaPipe or YOLO")
                    facial_measurements = None
                        
        except Exception as e:
            print(f"Enhanced detection error: {e}")
            import traceback
            traceback.print_exc()
            facial_measurements = None

        # ENHANCED: Accurate Product Placement
        product_applied = False
        try:
            if product_type == 'glasses':
                # Get cached glasses accessory
                glasses_accessory = get_glasses_accessory()
                
                if glasses_accessory is not None and facial_measurements:
                    # Use enhanced placement with measurements
                    frame, placement_info = place_product_with_measurements(
                        frame, glasses_accessory, facial_measurements, 
                        product_type, product_dimensions
                    )
                    product_applied = True
                    
            elif product_type == 'hat':
                # For hats, you'd need to load hat accessories
                # This is a placeholder for hat functionality
                if facial_measurements:
                    # Placeholder hat placement
                    pass
                    
        except Exception as e:
            print(f"Product placement error: {e}")

        # ENHANCED: Draw measurement overlays if requested
        if show_measurements and facial_measurements:
            frame = draw_measurement_overlay(frame, facial_measurements, product_dimensions)

        # Scale back to original size if needed
        if original_w != frame.shape[1] or original_h != frame.shape[0]:
            frame = cv2.resize(frame, (original_w, original_h), interpolation=cv2.INTER_LINEAR)

        # ULTRA OPTIMIZE: Much lower JPEG quality for faster transmission
        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 60])  # Higher quality for accuracy
        b64 = base64.b64encode(buf).decode("utf-8")
        
        # Enhanced response with measurement data
        response_data = {
            "image_base64": b64, 
            "status": "dimensional_accuracy_complete",
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
        print(f"Error in tryon: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # Always remove this request from active requests
        async with _request_lock:
            _active_requests.discard(request_id)
            print(f"Request {request_id}: Completed - Active requests: {len(_active_requests)}")

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
