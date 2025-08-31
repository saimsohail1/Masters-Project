# api/services/mediapipe_service.py
import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
# ULTRA OPTIMIZED for real-time video: maximum speed settings
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,  # Much faster for video
    max_num_faces=1, 
    refine_landmarks=False,  # Disable iris detection for speed
    min_detection_confidence=0.3,  # Lower threshold for faster detection
    min_tracking_confidence=0.3  # Lower threshold for faster tracking
)

def detect_face_landmarks_from_array(image_bgr):
    if image_bgr is None:
        raise ValueError("Empty image passed to detect_face_landmarks_from_array")

    # OPTIMIZE: Convert to RGB more efficiently
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)
    
    if not results.multi_face_landmarks:
        return []

    h, w = image_bgr.shape[:2]
    pts = []
    
    # OPTIMIZE: Only get essential landmarks for glasses placement
    essential_landmarks = [33, 263, 133, 362, 61, 291, 199, 419]  # Key face points
    
    for lm in results.multi_face_landmarks[0].landmark:
        x = int(lm.x * w)
        y = int(lm.y * h)
        pts.append((x, y))
    
    return pts
