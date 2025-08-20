# api/services/mediapipe_service.py
import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
# refine_landmarks=True improves eye precision (iris points), good for glasses
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)

def detect_face_landmarks_from_array(image_bgr):
    if image_bgr is None:
        raise ValueError("Empty image passed to detect_face_landmarks_from_array")

    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)
    if not results.multi_face_landmarks:
        return []

    h, w = image_bgr.shape[:2]
    pts = []
    for lm in results.multi_face_landmarks[0].landmark:
        x = int(lm.x * w)
        y = int(lm.y * h)
        pts.append((x, y))
    return pts
