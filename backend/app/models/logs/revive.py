from pydantic import BaseModel
from typing import Optional, List, Dict
from typing import Literal


__all__ = [
    "ReviveResponse",
    "ReviveResponseFull",
    "ReviveChance",
    "PersonalStat",
    "ReviveStats",
    "ReviveSkillSuccessCorrelation"
]

# Models for ReviveResponse (dataset with nested faction)
class FactionFull(BaseModel):
    id: Optional[int]
    name: Optional[str]

class ReviverFull(BaseModel):
    id: int
    name: Optional[str]
    faction: Optional[FactionFull]
    skill: Optional[float]

class TargetFull(BaseModel):
    id: int
    name: Optional[str]
    faction: Optional[FactionFull]
    hospital_reason: str
    early_discharge: bool
    last_action: int
    online_status: str

class ReviveFull(BaseModel):
    id: int
    reviver: ReviverFull
    target: TargetFull
    success_chance: float
    result: str
    timestamp: int

class MetadataFull(BaseModel):
    links: Dict[str, Optional[str]]

class ReviveResponse(BaseModel):
    revives: List[ReviveFull]
    _metadata: MetadataFull

# Models for ReviveResponseFull (dataset with faction_id)
class Reviver(BaseModel):
    id: int
    faction_id: Optional[int]

class Target(BaseModel):
    id: int
    faction_id: Optional[int]
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
    links: Dict[str, Optional[str]]

class ReviveResponseFull(BaseModel):
    revives: List[Revive]
    _metadata: Metadata

class ReviveChance(BaseModel):
    target_score: float
    revive_chance: float

class PersonalStat(BaseModel):
    name: Literal["reviveskill", "revives", "revivesreceived"]
    value: int
    timestamp: int

class ReviveStats(BaseModel):
    personalstats: List[PersonalStat]

class ReviveSkillSuccessCorrelation(BaseModel):
    correlation: float
    p_value: float
