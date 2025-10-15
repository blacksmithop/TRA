from fastapi import APIRouter, Query
from typing import Optional
from app import models
from app.core import api_config, fetch_torn_api


router = APIRouter(prefix="/user", tags=["Torn API"])


@router.get("/profile", response_model=models.MinimalProfileRoot)
async def get_basic_user_profile(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get user bars information.

    Fetches user status bars (energy, nerve, happy, life) from the Torn API.

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        UserBarsResponse: User bars data (energy, nerve, happy, life, chain).

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    data = await fetch_torn_api(api_config.BASIC_PROFILE_ENDPOINT, params)
    print(data)
    return models.MinimalProfileRoot(**data)


@router.get("/bars", response_model=models.UserBarsResponse)
async def get_user_bars(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get user bars information.

    Fetches user status bars (energy, nerve, happy, life) from the Torn API.

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        UserBarsResponse: User bars data (energy, nerve, happy, life, chain).

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    data = await fetch_torn_api(api_config.BARS_ENDPOINT, params)
    return models.UserBarsResponse(**data)
