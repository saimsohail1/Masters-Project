import cv2
import mediapipe as mp

# Initialize MediaPipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1)
mp_drawing = mp.solutions.drawing_utils

def detect_face_landmarks(image_path: str):
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Could not read image")

    # Convert to RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Detect face landmarks
    results = face_mesh.process(rgb_image)

    if not results.multi_face_landmarks:
        return []

    landmarks = []
    for face_landmarks in results.multi_face_landmarks:
        for landmark in face_landmarks.landmark:
            # Convert normalized coordinates to pixel coordinates
            x = int(landmark.x * image.shape[1])
            y = int(landmark.y * image.shape[0])
            landmarks.append((x, y))
        break  # Only take first face

    return landmarks
