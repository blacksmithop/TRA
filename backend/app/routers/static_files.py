from fastapi import APIRouter
from fastapi.responses import FileResponse
from app import models
import os

router = APIRouter(prefix="/static", tags=["Torn API"])
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")


@router.get("/logo")
async def get_image():
    file_path = os.path.join(STATIC_DIR, "logo.png")
    if not os.path.exists(file_path):
        return {"error": "Image not found"}
    return FileResponse(file_path, media_type="image/jpeg")
