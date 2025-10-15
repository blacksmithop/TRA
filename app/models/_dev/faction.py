from pydantic import BaseModel
from typing import List, Optional, Union, Dict

# Note: Due to truncation, limited Faction schemas are available. Adding the provided ones (e.g., FactionHofValues).
# Placeholders for referenced schemas like FactionId, FactionStatEnum, FactionBranchId, etc.
FactionId = int
FactionStatEnum = str
FactionBranchId = int
FactionTerritoryEnum = str

class FactionHofValues(BaseModel):
    chain: Optional[int] = None
    chain_duration: Optional[int] = None
    respect: Optional[int] = None