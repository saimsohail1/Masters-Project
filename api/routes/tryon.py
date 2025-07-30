from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from api.services.yolo_service import detect_objects
from api.services.mediapipe_service import detect_face_landmarks
from api.utils.image_drawer import draw_yolo_boxes, draw_landmarks
from api.utils.file_utils import save_upload_file
import os
import cv2

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    file_path = save_upload_file(file, UPLOAD_FOLDER)

    try:
        yolo_result = detect_objects(file_path)
        landmarks = detect_face_landmarks(file_path)
        # ✅ Draw annotations on the image
        image = draw_yolo_boxes(file_path, yolo_result)
        image = draw_landmarks(image, landmarks)
        annotated_path = file_path.replace(".jpg", "_annotated.jpg")
        cv2.imwrite(annotated_path, image)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    return {
        "yolo_detections": yolo_result,
        "face_landmarks": landmarks
    }
