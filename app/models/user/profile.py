from pydantic import BaseModel
from typing import Optional

class Property(BaseModel):
    id: int
    name: str

class Status(BaseModel):
    description: str
    details: Optional[str]  # Allow None as per JSON data
    state: str
    color: str
    until: Optional[int]  # Allow None as per JSON data
    plane_image_type: str
    travel_type: Optional[str]  # Added to match JSON data

class Spouse(BaseModel):
    id: int
    name: str
    status: str
    days_married: int

class LastAction(BaseModel):
    status: str
    timestamp: int
    relative: str

class Life(BaseModel):
    current: int
    maximum: int

class Profile(BaseModel):
    id: int
    name: str
    level: int
    rank: str
    title: str
    donator_status: str
    age: int
    signed_up: int
    faction_id: Optional[int]  # Allow None as per JSON data
    honor_id: int
    property: Property
    image: str
    gender: str
    revivable: bool
    role: str
    status: Status
    spouse: Spouse
    awards: int
    friends: int
    enemies: int
    forum_posts: int
    karma: int
    last_action: LastAction
    life: Life

class ProfileRoot(BaseModel):
    profile: Profile

__all__ = ["ProfileRoot"]