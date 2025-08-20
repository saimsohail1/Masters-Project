# api/routes/tryon.py
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import base64, numpy as np, cv2, os
from api.services.mediapipe_service import detect_face_landmarks_from_array
from api.utils.file_utils import place_accessory_on_face  # using your updated function

router = APIRouter()

@router.post("/tryon/frame")
async def tryon_single_frame(file: UploadFile = File(...)):
    try:
        data = await file.read()
        np_img = np.frombuffer(data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if frame is None:
            return JSONResponse(status_code=400, content={"error": "Invalid image"})

        landmarks = detect_face_landmarks_from_array(frame)
        if not landmarks:
            # Return original frame to keep stream going, but note no face
            _, buf = cv2.imencode(".jpg", frame)
            return {"image_base64": base64.b64encode(buf).decode("utf-8"), "note": "no_face"}

        # overlay glasses centered between eyes (function already updated to use indices 33 & 263)
        out = place_accessory_on_face(frame, "accessories/glasses.png", landmarks)

        _, buf = cv2.imencode(".jpg", out)
        b64 = base64.b64encode(buf).decode("utf-8")
        return {"image_base64": b64}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
