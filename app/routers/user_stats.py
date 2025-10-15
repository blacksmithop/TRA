from fastapi import APIRouter, Query
from typing import Optional
from app import models
from app.core import api_config, fetch_torn_api


router = APIRouter(prefix="/user", tags=["Torn API"])


@router.get("/profile", response_model=models.ProfileRoot)
async def get_user_profile(
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
    data = await fetch_torn_api(api_config.PROFILE_ENDPOINT, params)
    print(data)
    return models.ProfileRoot(**data)


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


@router.get("/battlestats", response_model=models.UserBattleStatsResponse)
async def get_user_battlestats(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get user battle stats.

    Fetches user battle statistics (strength, defense, speed, dexterity) from the Torn API.

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        UserBattleStatsResponse: User battle stats with modifiers.

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    data = await fetch_torn_api(api_config.BATTLESTATS_ENDPOINT, params)
    return models.UserBattleStatsResponse(**data)


@router.get("/cooldowns", response_model=models.UserCooldownsResponse)
async def get_user_cooldowns(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get user cooldowns.

    Fetches user cooldown timers (drug, medical, booster) from the Torn API.

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        UserCooldownsResponse: User cooldown timers.

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    data = await fetch_torn_api(api_config.COOLDOWNS_ENDPOINT, params)
    return models.UserCooldownsResponse(**data)


# @router.get("/attacks", response_model=models.FactionAttacksResponse)
# async def get_user_attacks(
#     filters: Optional[str] = Query(
#         None,
#         regex="^(incoming|outgoing)$",
#         description="Filter by incoming or outgoing attacks",
#     ),
#     limit: Optional[int] = Query(
#         100, ge=1, le=100, description="Number of rows to return (default 100)"
#     ),
#     sort: Optional[str] = Query(
#         None, regex="^(ASC|DESC)$", description="Sort by timestamp"
#     ),
#     to: Optional[int] = Query(None, description="Upper timestamp limit"),
#     from_: Optional[int] = Query(
#         None, alias="from", description="Lower timestamp limit"
#     ),
#     timestamp: Optional[int] = Query(
#         None, description="Bypass cache with current timestamp"
#     ),
#     comment: Optional[str] = Query(None, description="Comment for logging"),
# ):
#     """Get detailed user attacks.

#     Fetches detailed attack logs for the user from the Torn API.

#     Args:
#         filters: Filter by 'incoming' or 'outgoing' attacks.
#         limit: Number of attack records to return (1 to 100).
#         sort: Sort order for timestamps ('ASC' or 'DESC').
#         to: Upper timestamp limit for returned data.
#         from_: Lower timestamp limit for returned data.
#         timestamp: Current timestamp to bypass cache.
#         comment: Comment for logging in Torn API.

#     Returns:
#         FactionAttacksResponse: Detailed attack logs with metadata.

#     Raises:
#         HTTPException: If the API request fails or returns an error.
#     """
#     params = {
#         "filters": filters,
#         "limit": limit,
#         "sort": sort,
#         "to": to,
#         "from": from_,
#         "timestamp": timestamp,
#         "comment": comment,
#     }
#     data = await fetch_torn_api(api_config.ATTACKS_ENDPOINT, params)
#     return models.FactionAttacksResponse(**data)


# @router.get("/attacksfull", response_model=models.FactionAttacksFullResponse)
# async def get_user_attacks_full(
#     filters: Optional[str] = Query(
#         None,
#         regex="^(incoming|outgoing)$",
#         description="Filter by incoming or outgoing attacks",
#     ),
#     limit: Optional[int] = Query(
#         1000, ge=1, le=1000, description="Number of rows to return (default 1000)"
#     ),
#     sort: Optional[str] = Query(
#         None, regex="^(ASC|DESC)$", description="Sort by timestamp"
#     ),
#     to: Optional[int] = Query(None, description="Upper timestamp limit"),
#     from_: Optional[int] = Query(
#         None, alias="from", description="Lower timestamp limit"
#     ),
#     timestamp: Optional[int] = Query(
#         None, description="Bypass cache with current timestamp"
#     ),
#     comment: Optional[str] = Query(None, description="Comment for logging"),
# ):
#     """Get simplified user attacks.

#     Fetches simplified attack logs for the user from the Torn API.

#     Args:
#         filters: Filter by 'incoming' or 'outgoing' attacks.
#         limit: Number of attack records to return (1 to 1000).
#         sort: Sort order for timestamps ('ASC' or 'DESC').
#         to: Upper timestamp limit for returned data.
#         from_: Lower timestamp limit for returned data.
#         timestamp: Current timestamp to bypass cache.
#         comment: Comment for logging in Torn API.

#     Returns:
#         FactionAttacksFullResponse: Simplified attack logs with metadata.

#     Raises:
#         HTTPException: If the API request fails or returns an error.
#     """
#     params = {
#         "filters": filters,
#         "limit": limit,
#         "sort": sort,
#         "to": to,
#         "from": from_,
#         "timestamp": timestamp,
#         "comment": comment,
#     }
#     data = await fetch_torn_api(api_config.ATTACKS_FULL_ENDPOINT, params)
#     return models.FactionAttacksFullResponse(**data)

# @router.get("/bounties", response_model=models.UserBountiesResponse)
# async def get_user_bounties(
#     timestamp: Optional[int] = Query(
#         None, description="Bypass cache with current timestamp"
#     ),
#     comment: Optional[str] = Query(None, description="Comment for logging"),
# ):
#     """Get user bounties.

#     Fetches bounties placed on the user from the Torn API.

#     Args:
#         timestamp: Current timestamp to bypass cache.
#         comment: Comment for logging in Torn API.

#     Returns:
#         UserBountiesResponse: List of bounties on the user.

#     Raises:
#         HTTPException: If the API request fails or returns an error.
#     """
#     params = {"timestamp": timestamp, "comment": comment}
#     data = await fetch_torn_api(api_config.BOUNTIES_ENDPOINT, params)
#     return models.UserBountiesResponse(**data)
