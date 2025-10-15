from pydantic import BaseModel
from typing import Optional

class Bar(BaseModel):
    current: int
    maximum: int
    increment: int
    interval: int
    tick_time: int
    full_time: int

class Chain(BaseModel):
    pass  # Placeholder; appears as null in sample, may have structure in other cases

class Bars(BaseModel):
    energy: Bar
    nerve: Bar
    happy: Bar
    life: Bar
    chain: Optional[Chain] = None

class UserBarsResponse(BaseModel):
    bars: Bars
    
__all__ = ["UserBarsResponse"]