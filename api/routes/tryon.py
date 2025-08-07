from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from api.services.yolo_service import detect_objects
from api.services.mediapipe_service import detect_face_landmarks
from api.utils.file_utils import save_upload_file
from api.utils.image_drawer import draw_yolo_boxes, draw_landmarks
from api.utils.file_utils import place_accessory_on_face

import cv2
import os

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    file_path = save_upload_file(file, UPLOAD_FOLDER)

    try:
        # Detect objects and face landmarks
        yolo_result = detect_objects(file_path)
        landmarks = detect_face_landmarks(file_path)

        # Annotate image with bounding boxes and landmarks
        annotated_img = draw_yolo_boxes(file_path, yolo_result)
        annotated_img = draw_landmarks(annotated_img, landmarks)

        annotated_path = file_path.replace(".jpg", "_annotated.jpg")
        cv2.imwrite(annotated_path, annotated_img)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    return {
        "yolo_detections": yolo_result,
        "face_landmarks": landmarks,
        "annotated_image_path": annotated_path
    }


@router.post("/tryon")
async def tryon_virtual_item(file: UploadFile = File(...)):
    file_path = save_upload_file(file, UPLOAD_FOLDER)

    try:
        # Load image and detect face landmarks
        image = cv2.imread(file_path)
        landmarks = detect_face_landmarks(file_path)

        if not landmarks:
            return JSONResponse(status_code=400, content={"error": "No face landmarks detected"})

        # Overlay accessory using a specific landmark as anchor
        # Index 6 is commonly near the left eye (you can tweak it)
        accessory_path = "accessories/glasses.png"
        output_img = place_accessory_on_face(image, accessory_path, landmarks)

        output_path = file_path.replace(".jpg", "_tryon.jpg")
        cv2.imwrite(output_path, output_img)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    return {
        "message": "Try-on successful",
        "tryon_image_path": output_path
    }
