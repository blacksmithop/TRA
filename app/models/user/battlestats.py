from pydantic import BaseModel
from typing import List, Dict, Optional

class Modifier(BaseModel):
    effect: str
    value: float
    type: str

class Stat(BaseModel):
    value: int
    modifier: int
    modifiers: List[Modifier]

class BattleStats(BaseModel):
    strength: Stat
    defense: Stat
    speed: Stat
    dexterity: Stat
    total: int

class UserBattleStatsResponse(BaseModel):
    battlestats: BattleStats

__all__ = ["UserBattleStatsResponse"]