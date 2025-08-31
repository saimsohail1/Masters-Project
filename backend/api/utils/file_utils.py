import os
import cv2
import numpy as np
from fastapi import UploadFile
import shutil
import math

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

def place_product_with_measurements(image, accessory_array, facial_measurements, product_type='glasses', product_dimensions=None):
    """
    Enhanced product placement using facial measurements for accurate sizing and positioning.
    
    :param image: Input image (OpenCV BGR)
    :param accessory_array: Product image array (RGBA)
    :param facial_measurements: Dictionary of facial measurements
    :param product_type: Type of product ('glasses', 'hat', etc.)
    :param product_dimensions: Optional specific product dimensions
    :return: Image with product overlaid, placement_info
    """
    try:
        if accessory_array is None or facial_measurements is None:
            return image, None

        placement_info = {
            'product_type': product_type,
            'facial_measurements': facial_measurements,
            'product_dimensions': product_dimensions,
            'placement_accuracy': 'high'
        }

        if product_type == 'glasses':
            return place_glasses_accurately(image, accessory_array, facial_measurements, product_dimensions, placement_info)
        elif product_type == 'hat':
            return place_hat_accurately(image, accessory_array, facial_measurements, product_dimensions, placement_info)
        else:
            # Fallback to basic placement
            return place_accessory_on_face_cached(image, accessory_array, 
                                                [facial_measurements.get('eye_center', (0, 0))], 0, 0), placement_info

    except Exception as e:
        print(f"Error in accurate product placement: {e}")
        return image, None

def place_glasses_accurately(image, glasses_array, facial_measurements, product_dimensions, placement_info):
    """
    Place glasses with accurate sizing and positioning based on facial measurements.
    """
    try:
        print(f"DEBUG: Starting glasses placement")
        print(f"DEBUG: Facial measurements keys: {list(facial_measurements.keys())}")
        
        # Get key facial points
        eye_center = facial_measurements['eye_center']
        nose_bridge = facial_measurements['nose_bridge']
        ipd_pixels = facial_measurements['ipd_pixels']
        pixels_per_mm = facial_measurements['pixels_per_mm']
        
        print(f"DEBUG: Eye center: {eye_center}")
        print(f"DEBUG: Nose bridge: {nose_bridge}")
        print(f"DEBUG: IPD pixels: {ipd_pixels}")
        print(f"DEBUG: Pixels per mm: {pixels_per_mm}")
        
        # Get head pose for rotation correction
        head_yaw = facial_measurements.get('head_yaw_radians', 0)
        head_roll = facial_measurements.get('head_roll_radians', 0)
        
        # Calculate accurate glasses dimensions
        if product_dimensions:
            # Use provided product dimensions
            frame_width_mm = product_dimensions.get('frame_width_mm', 70)
            frame_height_mm = product_dimensions.get('frame_height_mm', 28)
        else:
            # Calculate based on facial measurements
            ipd_mm = facial_measurements['estimated_ipd_mm']
            frame_width_mm = ipd_mm * 1.1  # 10% wider than IPD
            frame_height_mm = frame_width_mm * 0.4
        
        # Convert to pixels
        frame_width_pixels = int(frame_width_mm * pixels_per_mm)
        frame_height_pixels = int(frame_height_mm * pixels_per_mm)
        
        print(f"DEBUG: Frame width: {frame_width_mm}mm = {frame_width_pixels} pixels")
        print(f"DEBUG: Frame height: {frame_height_mm}mm = {frame_height_pixels} pixels")
        print(f"DEBUG: Original glasses size: {glasses_array.shape}")
        
        # Resize glasses to accurate dimensions
        glasses_resized = cv2.resize(glasses_array, (frame_width_pixels, frame_height_pixels))
        print(f"DEBUG: Resized glasses size: {glasses_resized.shape}")
        
        # Apply head pose corrections
        if abs(head_roll) > 0.1:  # If head is tilted more than ~6 degrees
            # Create rotation matrix
            center = (frame_width_pixels // 2, frame_height_pixels // 2)
            rotation_matrix = cv2.getRotationMatrix2D(center, math.degrees(head_roll), 1.0)
            glasses_resized = cv2.warpAffine(glasses_resized, rotation_matrix, 
                                           (frame_width_pixels, frame_height_pixels), 
                                           flags=cv2.INTER_LINEAR, 
                                           borderMode=cv2.BORDER_TRANSPARENT)
        
        # Position glasses accurately
        # Center horizontally on eye center
        x = eye_center[0] - frame_width_pixels // 2
        
        # Position vertically at eye level, not nose bridge level
        # Glasses should be centered on the eyes, not on the nose
        y = eye_center[1] - frame_height_pixels // 2
        
        # Apply yaw correction (perspective adjustment)
        if abs(head_yaw) > 0.1:  # If head is turned more than ~6 degrees
            # Adjust horizontal position based on yaw
            yaw_offset = int(head_yaw * frame_width_pixels * 0.3)
            x += yaw_offset
        
        # Ensure glasses are perfectly centered on eyes
        # Fine-tune horizontal position to match eye center exactly
        x = int(eye_center[0] - frame_width_pixels // 2)
        
        # Overlay the glasses
        result_image = overlay_image_alpha(image, glasses_resized, x, y)
        
        # Update placement info
        placement_info.update({
            'placement_coordinates': (x, y),
            'glasses_dimensions_pixels': (frame_width_pixels, frame_height_pixels),
            'glasses_dimensions_mm': (frame_width_mm, frame_height_mm),
            'head_pose': {
                'yaw_degrees': math.degrees(head_yaw),
                'roll_degrees': math.degrees(head_roll)
            },
            'accuracy_metrics': {
                'ipd_accuracy': 'high' if abs(ipd_pixels - (frame_width_pixels * 0.9)) < 10 else 'medium',
                'positioning_accuracy': 'high' if abs(head_yaw) < 0.2 and abs(head_roll) < 0.2 else 'medium'
            }
        })
        
        return result_image, placement_info
        
    except Exception as e:
        print(f"Error in accurate glasses placement: {e}")
        return image, placement_info

def place_hat_accurately(image, hat_array, facial_measurements, product_dimensions, placement_info):
    """
    Place hat with accurate sizing and positioning based on facial measurements.
    """
    try:
        # Get key facial points
        forehead_center = facial_measurements['forehead_center']
        face_width_pixels = facial_measurements['face_width_pixels']
        pixels_per_mm = facial_measurements['pixels_per_mm']
        
        # Get head pose
        head_yaw = facial_measurements.get('head_yaw_radians', 0)
        head_roll = facial_measurements.get('head_roll_radians', 0)
        
        # Calculate accurate hat dimensions
        if product_dimensions:
            hat_width_mm = product_dimensions.get('hat_width_mm', 200)
            hat_height_mm = product_dimensions.get('hat_height_mm', 120)
        else:
            face_width_mm = facial_measurements['face_width_mm']
            hat_width_mm = face_width_mm * 1.2  # Slightly wider than face
            hat_height_mm = face_width_mm * 0.8
        
        # Convert to pixels
        hat_width_pixels = int(hat_width_mm * pixels_per_mm)
        hat_height_pixels = int(hat_height_mm * pixels_per_mm)
        
        # Resize hat to accurate dimensions
        hat_resized = cv2.resize(hat_array, (hat_width_pixels, hat_height_pixels))
        
        # Apply head pose corrections
        if abs(head_roll) > 0.1:
            center = (hat_width_pixels // 2, hat_height_pixels // 2)
            rotation_matrix = cv2.getRotationMatrix2D(center, math.degrees(head_roll), 1.0)
            hat_resized = cv2.warpAffine(hat_resized, rotation_matrix, 
                                       (hat_width_pixels, hat_height_pixels), 
                                       flags=cv2.INTER_LINEAR, 
                                       borderMode=cv2.BORDER_TRANSPARENT)
        
        # Position hat accurately
        # Center horizontally on forehead
        x = forehead_center[0] - hat_width_pixels // 2
        
        # Position vertically above forehead
        y = forehead_center[1] - hat_height_pixels + int(hat_height_pixels * 0.3)
        
        # Apply yaw correction
        if abs(head_yaw) > 0.1:
            yaw_offset = int(head_yaw * hat_width_pixels * 0.2)
            x += yaw_offset
        
        # Overlay the hat
        result_image = overlay_image_alpha(image, hat_resized, x, y)
        
        # Update placement info
        placement_info.update({
            'placement_coordinates': (x, y),
            'hat_dimensions_pixels': (hat_width_pixels, hat_height_pixels),
            'hat_dimensions_mm': (hat_width_mm, hat_height_mm),
            'head_pose': {
                'yaw_degrees': math.degrees(head_yaw),
                'roll_degrees': math.degrees(head_roll)
            }
        })
        
        return result_image, placement_info
        
    except Exception as e:
        print(f"Error in accurate hat placement: {e}")
        return image, placement_info

def draw_measurement_overlay(image, facial_measurements, product_dimensions=None):
    """
    Draw measurement overlays on the image for debugging and visualization.
    """
    try:
        overlay_image = image.copy()
        
        # Draw key facial points
        if 'eye_center' in facial_measurements:
            cv2.circle(overlay_image, facial_measurements['eye_center'], 5, (0, 255, 0), -1)
            cv2.putText(overlay_image, 'Eye Center', 
                       (facial_measurements['eye_center'][0] + 10, facial_measurements['eye_center'][1] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        if 'nose_bridge' in facial_measurements:
            cv2.circle(overlay_image, facial_measurements['nose_bridge'], 5, (255, 0, 0), -1)
            cv2.putText(overlay_image, 'Nose Bridge', 
                       (facial_measurements['nose_bridge'][0] + 10, facial_measurements['nose_bridge'][1] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
        
        if 'forehead_center' in facial_measurements:
            cv2.circle(overlay_image, facial_measurements['forehead_center'], 5, (0, 0, 255), -1)
            cv2.putText(overlay_image, 'Forehead', 
                       (facial_measurements['forehead_center'][0] + 10, facial_measurements['forehead_center'][1] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
        
        # Draw measurement text
        y_offset = 30
        cv2.putText(overlay_image, f"IPD: {facial_measurements.get('estimated_ipd_mm', 0):.1f}mm", 
                   (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        y_offset += 25
        
        cv2.putText(overlay_image, f"Face Width: {facial_measurements.get('face_width_mm', 0):.1f}mm", 
                   (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        y_offset += 25
        
        if 'head_yaw_degrees' in facial_measurements:
            cv2.putText(overlay_image, f"Head Yaw: {facial_measurements['head_yaw_degrees']:.1f}°", 
                       (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            y_offset += 25
        
        if 'head_roll_degrees' in facial_measurements:
            cv2.putText(overlay_image, f"Head Roll: {facial_measurements['head_roll_degrees']:.1f}°", 
                       (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        return overlay_image
        
    except Exception as e:
        print(f"Error drawing measurement overlay: {e}")
        return image
