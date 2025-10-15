from pydantic import BaseModel
from typing import List, Optional, Union, Dict

__all__ = ["ApiErrorResponse", "RequestMetadata", "RequestMetadataWithLinks"]


class Error(BaseModel):
    code: int
    message: str


class ApiErrorResponse(BaseModel):
    error: Error


class Links(BaseModel):
    self: str
    prev: Optional[str] = None
    next: Optional[str] = None


class RequestMetadataWithLinks(BaseModel):
    request_id: str
    timestamp: int
    links: Links


class RequestMetadata(BaseModel):
    request_id: str
    timestamp: int
