import cv2
import mediapipe as mp

def draw_yolo_boxes(image_path, detections):
    image = cv2.imread(image_path)
    for det in detections:
        x1, y1, x2, y2 = map(int, det["bbox"])
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
    return image

def draw_landmarks(image, landmarks_list):
    for (x, y) in landmarks_list:
        cv2.circle(image, (x, y), 1, (255, 0, 0), -1)
    return image

