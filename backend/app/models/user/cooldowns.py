from pydantic import BaseModel
from typing import Optional

class Cooldowns(BaseModel):
    drug: int
    medical: int
    booster: int

class UserCooldownsResponse(BaseModel):
    cooldowns: Cooldowns
    
__all__ = ["UserCooldownsResponse"]