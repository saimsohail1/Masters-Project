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
    try:
        bh, bw = background.shape[:2]
        oh, ow = overlay.shape[:2]

        # Check if overlay is completely outside the image
        if x >= bw or y >= bh or x + ow <= 0 or y + oh <= 0:
            return background

        # Calculate the region of the overlay that will be visible
        start_x = max(0, x)
        end_x = min(bw, x + ow)
        start_y = max(0, y)
        end_y = min(bh, y + oh)

        # Calculate the corresponding region in the overlay
        overlay_start_x = start_x - x
        overlay_start_y = start_y - y
        overlay_end_x = overlay_start_x + (end_x - start_x)
        overlay_end_y = overlay_start_y + (end_y - start_y)

        # Check if the visible region is valid
        if (end_x <= start_x or end_y <= start_y or 
            overlay_end_x <= overlay_start_x or overlay_end_y <= overlay_start_y):
            return background

        # Extract the visible region from the overlay
        overlay_visible = overlay[overlay_start_y:overlay_end_y, overlay_start_x:overlay_end_x]
        
        # Check if overlay has alpha channel
        if overlay_visible.shape[2] != 4:
            return background

        # Split overlay into RGB and alpha
        overlay_img = overlay_visible[..., :3]
        mask = overlay_visible[..., 3:] / 255.0

        # Ensure mask has correct shape for broadcasting
        if mask.shape[2] == 1:
            mask = np.repeat(mask, 3, axis=2)

        # Blend overlay
        background_region = background[start_y:end_y, start_x:end_x]
        background[start_y:end_y, start_x:end_x] = (
            background_region * (1 - mask) + overlay_img * mask
        ).astype(np.uint8)

        return background
    except Exception as e:
        print(f"Overlay error: {e}")
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
    try:
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
    except Exception as e:
        print(f"Error placing accessory: {e}")
        return image

def place_accessory_on_face_cached(image, accessory_array, landmark_points, left_eye_idx=33, right_eye_idx=263):
    """
    Places the accessory (cached array) onto the image, aligned between the eyes.

    :param image: Input image (OpenCV BGR)
    :param accessory_array: Cached accessory image array (RGBA)
    :param landmark_points: List of facial landmarks (x, y)
    :param left_eye_idx: Index for left eye corner
    :param right_eye_idx: Index for right eye corner
    :return: Image with accessory overlaid
    """
    try:
        if accessory_array is None:
            return image

        if len(landmark_points) <= max(left_eye_idx, right_eye_idx):
            return image

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
        glasses_height = int(glasses_width * accessory_array.shape[0] / accessory_array.shape[1])
        accessory = cv2.resize(accessory_array, (glasses_width, glasses_height))

        # Position accessory centered at eye_center
        x = eye_center[0] - glasses_width // 2
        y = eye_center[1] - glasses_height // 2

        return overlay_image_alpha(image, accessory, x, y)
    except Exception as e:
        print(f"Error placing cached accessory: {e}")
        return image
