from fastapi import APIRouter, Query
from typing import Optional
from app import models
from app.core import api_config, fetch_torn_api
from app.machine_learning import calculate_skill_successs_correlation


router = APIRouter(prefix="/logs", tags=["Torn API"])


@router.get("/revives", response_model=models.ReviveResponse)
async def get_user_battlestats(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get user revive stats.

    Fetches user revive statistics

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        ReviveResponse: User revive response

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    data = await fetch_torn_api(api_config.REVIVES_ENDPOINT, params)
    return models.ReviveResponse(**data)


@router.get("/revive_skill_correlation", response_model=models.ReviveSkillSuccessCorrelation)
async def get_user_battlestats(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get user revive stats.

    Fetches user revive statistics

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        ReviveResponse: User revive response

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    data = await fetch_torn_api(api_config.REVIVES_ENDPOINT, params)
    try:
        corr, p_value = calculate_skill_successs_correlation(data=data, my_id=1712955)
    except ValueError:
        corr, p_value = 0.0, 0.0
    return models.ReviveSkillSuccessCorrelation(correlation=corr, p_value=p_value)
    