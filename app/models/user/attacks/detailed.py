from pydantic import BaseModel
from typing import List, Optional, Dict

class Attacker(BaseModel):
    id: int
    name: str
    level: int
    faction: Optional[Dict[str, Optional[object]]] = None  # faction can be null or {id: int, name: str}

class Defender(BaseModel):
    id: int
    name: str
    level: int
    faction: Optional[Dict[str, Optional[object]]] = None  # faction can be null or {id: int, name: str}

class Modifiers(BaseModel):
    fair_fight: float
    war: int
    retaliation: float
    group: int
    overseas: float
    chain: float
    warlord: int

class FinishingHitEffect(BaseModel):
    name: str
    value: int

class Attack(BaseModel):
    id: int
    code: str
    started: int
    ended: int
    attacker: Optional[Attacker] = None  # attacker can be null in some cases
    defender: Defender
    result: str
    respect_gain: float
    respect_loss: float
    chain: int
    is_interrupted: bool
    is_stealthed: bool
    is_raid: bool
    is_ranked_war: bool
    modifiers: Modifiers
    finishing_hit_effects: List[FinishingHitEffect]

class Metadata(BaseModel):
    links: Dict[str, Optional[str]]

class FactionAttacksResponse(BaseModel):
    attacks: List[Attack]
    _metadata: Metadata
    
__all__ = ["FactionAttacksResponse"]