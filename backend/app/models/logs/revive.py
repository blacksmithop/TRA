from pydantic import BaseModel
from typing import List, Literal, Optional
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
    name: Optional[str] = None # /revivesfull doesn't include name
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


class ReviveSkillSuccessCorrelation(BaseModel):
    correlation: float
    p_value: float


class PersonalStat(BaseModel):
    name: Literal["reviveskill", "revives", "revivesreceived"]
    value: int
    timestamp: int


class ReviveStats(BaseModel):
    personalstats: List[PersonalStat]

class ReviveChance(BaseModel):
    target_score: float
    revive_chance: float
    
__all__ = ["PersonalStat", "ReviveChance", "ReviveResponse", "ReviveSkillSuccessCorrelation", "ReviveStats"]
