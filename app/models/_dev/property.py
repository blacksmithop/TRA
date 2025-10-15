from pydantic import BaseModel
from typing import List, Optional, Union, Dict

# Note: Due to truncation, limited Property schemas are available. Adding the provided one (TornProperties).
# Placeholders for referenced schemas like PropertyTypeId, PropertyModificationEnum, PropertyStaffEnum.
PropertyTypeId = int
PropertyModificationEnum = str
PropertyStaffEnum = str

class Property(BaseModel):
    id: int
    name: str
    cost: int
    happy: int
    upkeep: int
    modifications: List[str]
    staff: List[str]

class TornProperties(BaseModel):
    properties: Optional[List[Property]] = None