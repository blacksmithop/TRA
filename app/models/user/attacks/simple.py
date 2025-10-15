from pydantic import BaseModel
from typing import List, Optional, Dict

class AttackerSimple(BaseModel):
    id: Optional[int] = None  # attacker can be null
    faction_id: Optional[int] = None

class DefenderSimple(BaseModel):
    id: int
    faction_id: Optional[int] = None

class AttackSimple(BaseModel):
    id: int
    code: str
    started: int
    ended: int
    attacker: Optional[AttackerSimple] = None
    defender: DefenderSimple
    result: str
    respect_gain: float
    respect_loss: float

class Metadata(BaseModel):
    links: Dict[str, Optional[str]]

class FactionAttacksFullResponse(BaseModel):
    attacks: List[AttackSimple]
    _metadata: Metadata
    
__all__ = ["FactionAttacksFullResponse"]
