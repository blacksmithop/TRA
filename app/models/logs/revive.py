from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Faction(BaseModel):
    id: Optional[int]
    name: Optional[str]

class Reviver(BaseModel):
    id: int
    name: str
    faction: Optional[Faction]
    skill: Optional[float]

class Target(BaseModel):
    id: int
    name: str
    faction: Optional[Faction]
    hospital_reason: str
    early_discharge: bool
    last_action: int
    online_status: str

class Revive(BaseModel):
    id: int
    reviver: Reviver
    target: Target
    success_chance: float
    result: str
    timestamp: int

class Metadata(BaseModel):
    links: dict[str, Optional[str]]

class ReviveResponse(BaseModel):
    revives: List[Revive]
    _metadata: Metadata
    
__all__ = ["ReviveResponse"]