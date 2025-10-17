from fastapi import APIRouter, Depends, Query
from typing import Optional
from app import models
from app.core import api_config, fetch_torn_api, get_api_key
from app.machine_learning import (
    calculate_skill_success_correlation,
    calculate_revive_chance,
)


router = APIRouter(prefix="/logs", tags=["Torn API"])


@router.get("/revives", response_model=models.ReviveResponse)
async def revives(
    to_timestamp: Optional[int] = None,
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
    api_key: str = Depends(get_api_key),
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
    cache = False # don't cache first request
    if to_timestamp:
        cache = True # cache older records
        params.update({"to": to_timestamp})
    data = await fetch_torn_api(
        api_key=api_key, endpoint=api_config.REVIVES_ENDPOINT, params=params, cache=cache
    )
    return models.ReviveResponse(**data)


@router.get("/revivesfull", response_model=models.ReviveResponseFull)
async def revives(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
    api_key: str = Depends(get_api_key),
):
    """Get (full) user revive stats.

    Fetches user revive statistics

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        ReviveResponseFull: User revive (full) response

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment, "limit": 1000}
    
    endpoint = api_config.REVIVES_FULL_ENDPOINT
    data = await fetch_torn_api(
        api_key=api_key, endpoint=endpoint, params=params, ttl=int(endpoint)
    )
    return models.ReviveResponseFull(**data)


@router.get("/revive_stats", response_model=models.ReviveStats)
async def revive_stats(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
    api_key: str = Depends(get_api_key),
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
    params = {
        "timestamp": timestamp,
        "comment": comment,
        "stat": "reviveskill,revives,revivesreceived",
    }
    endpoint = api_config.REVIVES_STATISTICS_ENDPOINT
    data = await fetch_torn_api(
        api_key=api_key, endpoint=endpoint, params=params, ttl=int(endpoint)
    )
    return models.ReviveStats(**data)


@router.get(
    "/revive_skill_correlation", response_model=models.ReviveSkillSuccessCorrelation
)
async def revive_skill_correlation(
    user_id: Optional[int] = None,
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
    api_key: str = Depends(get_api_key),
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
    endpoint = api_config.REVIVES_ENDPOINT
    data = await fetch_torn_api(
        api_key=api_key, endpoint=endpoint, params=params, ttl=int(endpoint)
    )
    try:
        corr, p_value = calculate_skill_success_correlation(data=data, my_id=user_id)
    except ValueError:
        corr, p_value = 0.0, 0.0
    return models.ReviveSkillSuccessCorrelation(correlation=corr, p_value=p_value)


@router.get("/revive_chance", response_model=models.ReviveChance)
async def revives(
    target_api_key: str,
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
    api_key: str = Depends(get_api_key),
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
    data = await fetch_torn_api(
        api_key=target_api_key,
        endpoint=api_config.REVIVES_ENDPOINT,
        params={
            "timestamp": timestamp,
            "comment": comment,
            "filter": "incoming",
            "limit": 100,
        },
        cache=False
    )
    target_incoming_revives = models.ReviveResponse(**data)
    endpoint = api_config.REVIVES_STATISTICS_ENDPOINT
    data = await fetch_torn_api(
        api_key=api_key,
        endpoint=endpoint,
        ttl=int(endpoint),
        params={"timestamp": timestamp, "comment": comment, "stat": "reviveskill,revives,revivesreceived"},
    )
    reviver_stats = models.ReviveStats(**data).personalstats
    skill_stat: models.PersonalStat = reviver_stats[0]
    revive_skill = skill_stat.value
    return calculate_revive_chance(
        skill_reviver=revive_skill, revives=target_incoming_revives
    )
