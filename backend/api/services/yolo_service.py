# api/services/yolo_service.py
import cv2
import numpy as np
from ultralytics import YOLO
import os

# Initialize YOLO model
yolo_model = None

def get_yolo_model():
    """Get or initialize YOLO model"""
    global yolo_model
    if yolo_model is None:
        # Try to load custom model first, fallback to YOLOv8n
        model_path = "yolov8n.pt"
        if os.path.exists(model_path):
            yolo_model = YOLO(model_path)
        else:
            # Use YOLOv8n from ultralytics
            yolo_model = YOLO('yolov8n.pt')
    return yolo_model

def detect_objects_yolo(image):
    """
    Detect objects using YOLO for better accuracy
    Returns: list of detections with bounding boxes and confidence scores
    """
    try:
        model = get_yolo_model()
        results = model(image, verbose=False)
        
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id]
                    
                    detections.append({
                        'bbox': [int(x1), int(y1), int(x2), int(y2)],
                        'confidence': float(confidence),
                        'class_id': class_id,
                        'class_name': class_name
                    })
        
        return detections
    except Exception as e:
        print(f"YOLO detection error: {e}")
        return []

def detect_face_yolo(image):
    """
    Detect faces specifically using YOLO
    Returns: list of face bounding boxes
    """
    try:
        model = get_yolo_model()
        results = model(image, verbose=False)
        
        face_detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id]
                    
                    # Filter for person class (includes faces)
                    if class_name == 'person':
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        
                        face_detections.append({
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'confidence': float(confidence),
                            'class_name': class_name
                        })
        
        return face_detections
    except Exception as e:
        print(f"YOLO face detection error: {e}")
        return []

def get_face_region_yolo(image):
    """
    Get the main face region from YOLO detection
    Returns: face region coordinates or None
    """
    face_detections = detect_face_yolo(image)
    
    if face_detections:
        # Get the highest confidence detection
        best_detection = max(face_detections, key=lambda x: x['confidence'])
        return best_detection['bbox']
    
    return None

def enhance_face_detection_with_yolo(image, mediapipe_landmarks):
    """
    Enhance MediaPipe face detection with YOLO validation
    Returns: enhanced face detection info
    """
    try:
        # Get YOLO face detection
        yolo_face = get_face_region_yolo(image)
        
        # Get MediaPipe landmarks
        mediapipe_success = mediapipe_landmarks is not None and len(mediapipe_landmarks) > 0
        
        enhanced_info = {
            'mediapipe_success': mediapipe_success,
            'yolo_face_detected': yolo_face is not None,
            'yolo_face_bbox': yolo_face,
            'combined_detection': mediapipe_success and yolo_face is not None
        }
        
        # If both detections agree, we have high confidence
        if enhanced_info['combined_detection']:
            enhanced_info['confidence'] = 'high'
        elif mediapipe_success or yolo_face is not None:
            enhanced_info['confidence'] = 'medium'
        else:
            enhanced_info['confidence'] = 'low'
        
        return enhanced_info
        
    except Exception as e:
        print(f"Enhanced detection error: {e}")
        return {
            'mediapipe_success': False,
            'yolo_face_detected': False,
            'confidence': 'low',
            'error': str(e)
        }
