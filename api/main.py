from fastapi import FastAPI
from api.routes.tryon import router as tryon_router

app = FastAPI()

# ✅ Root route (this is missing)
@app.get("/")
def root():
    return {"message": "AR Try-On API is running"}

# Include your actual try-on router
app.include_router(tryon_router, prefix="/tryon")
