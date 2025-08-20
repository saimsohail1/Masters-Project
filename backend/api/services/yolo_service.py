from ultralytics import YOLO

model = YOLO("yolov8n.pt")

def detect_objects(image_path: str):
    results = model(image_path)
    detections = []

    for box in results[0].boxes:
        bbox = box.xyxy[0].tolist()
        cls = int(box.cls.item())      # ✅ Use .item() to convert tensor to int
        conf = float(box.conf.item())  # ✅ Use .item() to convert tensor to float

        detections.append({
            "bbox": bbox,
            "class_id": cls,
            "confidence": round(conf, 3)
        })

    return detections
