from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.tryon import router as tryon_router

app = FastAPI(
    title="AR Try-On API",
    description="Backend API for virtual try-on using YOLO and MediaPipe",
    version="1.0"
)

# ✅ Add this CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(tryon_router)
