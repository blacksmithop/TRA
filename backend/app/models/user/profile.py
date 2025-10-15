from pydantic import BaseModel
from typing import Optional


class Status(BaseModel):
    description: str
    details: Optional[str]  # Allow None as per JSON data
    state: str
    color: str
    until: Optional[int]  # Allow None as per JSON data
    plane_image_type: Optional[str] = None
    travel_type: Optional[str] = None


class MinimalProfile(BaseModel):
    id: int
    name: str
    level: int
    gender: str
    status: Status


class MinimalProfileRoot(BaseModel):
    profile: MinimalProfile


__all__ = ["MinimalProfileRoot"]
