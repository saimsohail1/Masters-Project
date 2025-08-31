# api/services/mediapipe_service.py
import cv2
import mediapipe as mp
import numpy as np
import math

mp_face_mesh = mp.solutions.face_mesh
# Enhanced settings for accurate measurements
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1, 
    refine_landmarks=True,  # Enable iris detection for better accuracy
    min_detection_confidence=0.5,  # Higher threshold for accuracy
    min_tracking_confidence=0.5
)

# Comprehensive landmark indices for accurate measurements
FACIAL_LANDMARKS = {
    # Eye landmarks for glasses positioning
    'left_eye_outer': 33,
    'left_eye_inner': 133,
    'right_eye_outer': 263,
    'right_eye_inner': 362,
    
    # Nose landmarks for depth estimation
    'nose_tip': 1,
    'nose_bridge': 168,
    
    # Face width landmarks
    'left_cheek': 123,
    'right_cheek': 352,
    
    # Head pose landmarks
    'left_ear': 234,
    'right_ear': 454,
    
    # Forehead landmarks
    'left_forehead': 10,
    'right_forehead': 338,
    'center_forehead': 151,
    
    # Chin landmarks
    'chin': 152,
    
    # Additional eye landmarks for precise positioning
    'left_eye_top': 159,
    'left_eye_bottom': 145,
    'right_eye_top': 386,
    'right_eye_bottom': 374
}

def detect_face_landmarks_from_array(image_bgr):
    """Enhanced face landmark detection with comprehensive measurements"""
    if image_bgr is None:
        raise ValueError("Empty image passed to detect_face_landmarks_from_array")

    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)
    
    if not results.multi_face_landmarks:
        return None, None

    h, w = image_bgr.shape[:2]
    landmarks_2d = []
    landmarks_3d = []
    
    # Extract both 2D and 3D landmarks
    for lm in results.multi_face_landmarks[0].landmark:
        x_2d = int(lm.x * w)
        y_2d = int(lm.y * h)
        landmarks_2d.append((x_2d, y_2d))
        
        # 3D coordinates (x, y, z) where z is depth
        landmarks_3d.append((lm.x, lm.y, lm.z))
    
    return landmarks_2d, landmarks_3d

def get_facial_measurements(landmarks_2d, landmarks_3d, image_shape):
    """Calculate comprehensive facial measurements for accurate product placement"""
    if not landmarks_2d or not landmarks_3d:
        return None
    
    h, w = image_shape[:2]
    
    # Extract key landmark points
    measurements = {}
    
    # Eye measurements
    left_eye_outer = landmarks_2d[FACIAL_LANDMARKS['left_eye_outer']]
    left_eye_inner = landmarks_2d[FACIAL_LANDMARKS['left_eye_inner']]
    right_eye_outer = landmarks_2d[FACIAL_LANDMARKS['right_eye_outer']]
    right_eye_inner = landmarks_2d[FACIAL_LANDMARKS['right_eye_inner']]
    
    # Calculate interpupillary distance (IPD) - actual eye distance
    ipd_pixels = math.sqrt((right_eye_inner[0] - left_eye_inner[0])**2 + 
                          (right_eye_inner[1] - left_eye_inner[1])**2)
    
    # Estimate real-world IPD (average is ~63mm)
    # This is a rough estimation - in production, you'd want camera calibration
    estimated_ipd_mm = 63.0
    
    # Calculate pixels per mm - this is the key scaling factor
    # If IPD is 63mm and we measure X pixels, then pixels_per_mm = X/63
    pixels_per_mm = ipd_pixels / estimated_ipd_mm
    
    # Apply a scaling factor to make glasses appear more realistic
    # The issue is that MediaPipe measurements can be too conservative
    # We'll apply a multiplier to make glasses appear at proper size
    scaling_multiplier = 2.5  # Increased from 1.5 to 2.5 for better visibility
    pixels_per_mm *= scaling_multiplier
    
    # Debug logging
    print(f"DEBUG: IPD pixels: {ipd_pixels:.2f}, IPD mm: {estimated_ipd_mm:.2f}")
    print(f"DEBUG: Pixels per mm: {pixels_per_mm:.4f} (after {scaling_multiplier}x scaling)")
    print(f"DEBUG: 135mm glasses would be {135 * pixels_per_mm:.1f} pixels wide")
    
    measurements['ipd_pixels'] = ipd_pixels
    measurements['pixels_per_mm'] = pixels_per_mm
    measurements['estimated_ipd_mm'] = estimated_ipd_mm
    
    # Face width measurement
    left_cheek = landmarks_2d[FACIAL_LANDMARKS['left_cheek']]
    right_cheek = landmarks_2d[FACIAL_LANDMARKS['right_cheek']]
    face_width_pixels = math.sqrt((right_cheek[0] - left_cheek[0])**2 + 
                                 (right_cheek[1] - left_cheek[1])**2)
    measurements['face_width_pixels'] = face_width_pixels
    measurements['face_width_mm'] = face_width_pixels / pixels_per_mm
    
    # Head pose estimation using 3D landmarks
    nose_tip_3d = landmarks_3d[FACIAL_LANDMARKS['nose_tip']]
    left_ear_3d = landmarks_3d[FACIAL_LANDMARKS['left_ear']]
    right_ear_3d = landmarks_3d[FACIAL_LANDMARKS['right_ear']]
    
    # Calculate head rotation (yaw) from ear positions
    head_yaw = math.atan2(right_ear_3d[0] - left_ear_3d[0], 
                          right_ear_3d[2] - left_ear_3d[2])
    measurements['head_yaw_radians'] = head_yaw
    measurements['head_yaw_degrees'] = math.degrees(head_yaw)
    
    # Calculate head tilt (roll) from eye positions
    left_eye_center = landmarks_2d[FACIAL_LANDMARKS['left_eye_outer']]
    right_eye_center = landmarks_2d[FACIAL_LANDMARKS['right_eye_outer']]
    head_roll = math.atan2(right_eye_center[1] - left_eye_center[1],
                           right_eye_center[0] - left_eye_center[0])
    measurements['head_roll_radians'] = head_roll
    measurements['head_roll_degrees'] = math.degrees(head_roll)
    
    # Glasses positioning points
    eye_center = (
        (left_eye_inner[0] + right_eye_inner[0]) // 2,
        (left_eye_inner[1] + right_eye_inner[1]) // 2
    )
    measurements['eye_center'] = eye_center
    
    # Nose bridge position for glasses placement
    nose_bridge = landmarks_2d[FACIAL_LANDMARKS['nose_bridge']]
    measurements['nose_bridge'] = nose_bridge
    
    # Forehead position for hats
    center_forehead = landmarks_2d[FACIAL_LANDMARKS['center_forehead']]
    measurements['forehead_center'] = center_forehead
    
    return measurements

def calculate_product_dimensions(product_type, facial_measurements):
    """Calculate appropriate product dimensions based on facial measurements"""
    if not facial_measurements:
        return None
    
    dimensions = {}
    
    if product_type == 'glasses':
        # Standard glasses frame measurements
        ipd_mm = facial_measurements['estimated_ipd_mm']
        
        # Frame width should be slightly wider than IPD
        frame_width_mm = ipd_mm * 1.1  # 10% wider than IPD
        frame_height_mm = frame_width_mm * 0.4  # Typical aspect ratio
        
        # Lens width (should match IPD)
        lens_width_mm = ipd_mm
        lens_height_mm = lens_width_mm * 0.35
        
        dimensions.update({
            'frame_width_mm': frame_width_mm,
            'frame_height_mm': frame_height_mm,
            'lens_width_mm': lens_width_mm,
            'lens_height_mm': lens_height_mm,
            'bridge_width_mm': 18.0,  # Standard bridge width
            'temple_length_mm': 140.0  # Standard temple length
        })
    
    elif product_type == 'hat':
        # Hat sizing based on head circumference
        face_width_mm = facial_measurements['face_width_mm']
        # Estimate head circumference (rough approximation)
        head_circumference_mm = face_width_mm * 3.14  # π * face_width
        
        dimensions.update({
            'head_circumference_mm': head_circumference_mm,
            'hat_width_mm': face_width_mm * 1.2,  # Slightly wider than face
            'hat_height_mm': face_width_mm * 0.8
        })
    
    return dimensions
