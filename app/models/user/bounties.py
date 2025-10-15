from pydantic import BaseModel
from typing import List, Optional

class Bounty(BaseModel):
    target_id: int
    target_name: str
    target_level: int
    lister_id: Optional[int] = None
    lister_name: Optional[str] = None
    reward: int
    reason: str
    quantity: int
    is_anonymous: bool
    valid_until: int

class UserBountiesResponse(BaseModel):
    bounties: List[Bounty]
    
__all__ = ["UserBountiesResponse"]