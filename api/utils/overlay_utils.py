import cv2
import numpy as np

def overlay_png(background, overlay, x, y, scale=1.0):
    """Overlays a transparent PNG onto a background image at (x, y)."""
    # Resize overlay
    overlay = cv2.resize(overlay, (0, 0), fx=scale, fy=scale)

    h, w, _ = overlay.shape
    rows, cols, _ = background.shape

    if x + w > cols or y + h > rows:
        return background  # Avoid overlay going out of bounds

    # Split overlay into BGR and Alpha channels
    b, g, r, a = cv2.split(overlay)
    overlay_rgb = cv2.merge((b, g, r))
    mask = cv2.merge((a, a, a))

    roi = background[y:y+h, x:x+w]

    # Blend the images using the alpha mask
    blended = cv2.addWeighted(roi, 1, overlay_rgb, 1, 0, mask=mask)
    background[y:y+h, x:x+w] = blended
    return background
