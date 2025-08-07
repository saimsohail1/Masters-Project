import os
import cv2
import numpy as np
from fastapi import UploadFile
import shutil

def save_upload_file(upload_file: UploadFile, dest_folder: str) -> str:
    """
    Save an uploaded file to a specified destination folder.
    """
    os.makedirs(dest_folder, exist_ok=True)
    file_path = os.path.join(dest_folder, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path

def overlay_image_alpha(background, overlay, x, y):
    """
    Overlay `overlay` onto `background` at position (x, y) with alpha blending.
    Assumes overlay has 4 channels (RGBA).
    """
    bh, bw = background.shape[:2]
    oh, ow = overlay.shape[:2]

    if x + ow > bw or y + oh > bh:
        return background  # Skip overlay if out of bounds

    # Split overlay into RGB and alpha
    overlay_img = overlay[..., :3]
    mask = overlay[..., 3:] / 255.0

    # Blend overlay
    background[y:y+oh, x:x+ow] = (
        background[y:y+oh, x:x+ow] * (1 - mask) + overlay_img * mask
    ).astype(np.uint8)

    return background

def place_accessory_on_face(image, accessory_path, landmark_points, left_eye_idx=33, right_eye_idx=263):
    """
    Places the accessory (PNG with alpha) onto the image, aligned between the eyes.

    :param image: Input image (OpenCV BGR)
    :param accessory_path: Path to accessory image (PNG with alpha)
    :param landmark_points: List of facial landmarks (x, y)
    :param left_eye_idx: Index for left eye corner
    :param right_eye_idx: Index for right eye corner
    :return: Image with accessory overlaid
    """
    accessory = cv2.imread(accessory_path, cv2.IMREAD_UNCHANGED)
    if accessory is None:
        raise ValueError("Accessory image could not be loaded")

    if len(landmark_points) <= max(left_eye_idx, right_eye_idx):
        raise ValueError("Not enough landmarks for the selected indices")

    # Get left and right eye coordinates
    left_eye = landmark_points[left_eye_idx]
    right_eye = landmark_points[right_eye_idx]

    # Compute eye center and distance
    eye_center = (
        (left_eye[0] + right_eye[0]) // 2,
        (left_eye[1] + right_eye[1]) // 2
    )
    eye_distance = abs(right_eye[0] - left_eye[0])

    # Resize accessory based on eye distance
    glasses_width = int(eye_distance * 2.0)  # Scale multiplier
    glasses_height = int(glasses_width * accessory.shape[0] / accessory.shape[1])
    accessory = cv2.resize(accessory, (glasses_width, glasses_height))

    # Position accessory centered at eye_center
    x = eye_center[0] - glasses_width // 2
    y = eye_center[1] - glasses_height // 2

    return overlay_image_alpha(image, accessory, x, y)
