from fastapi import APIRouter, Query, Depends
from typing import Optional
from app import models
from app.core import api_config, fetch_torn_api, get_api_key

router = APIRouter(prefix="/user", tags=["Torn API"])


@router.get("/basic", response_model=models.MinimalProfileRoot)
async def get_basic_user_profile(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
    api_key: str = Depends(get_api_key),
):
    """Get user basic profile information.

    Fetches user status bars (energy, nerve, happy, life) from the Torn API.

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.
        api_key: API key extracted from Authorization header.

    Returns:
        MinimalProfileRoot: User basic profile data.

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    endpoint = api_config.BASIC_PROFILE_ENDPOINT
    data = await fetch_torn_api(api_key=api_key, endpoint=endpoint, params=params, ttl=int(endpoint))
    return models.MinimalProfileRoot(**data)

@router.get("/bars", response_model=models.UserBarsResponse)
async def get_user_bars(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
    api_key: str = Depends(get_api_key),
):
    """Get user bars information.

    Fetches user status bars (energy, nerve, happy, life) from the Torn API.

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.
        api_key: API key extracted from Authorization header.

    Returns:
        UserBarsResponse: User bars data (energy, nerve, happy, life, chain).

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    endpoint = api_config.BARS_ENDPOINT
    data = await fetch_torn_api(api_key=api_key, endpoint=endpoint, params=params, ttl=int(endpoint))
    return models.UserBarsResponse(**data)