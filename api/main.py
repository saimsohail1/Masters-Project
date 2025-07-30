from fastapi import FastAPI
from api.routes.tryon import router as tryon_router

app = FastAPI(
    title="AR Try-On API",
    description="Backend API for virtual try-on using YOLO and MediaPipe",
    version="1.0"
)

# Register routes
app.include_router(tryon_router)
