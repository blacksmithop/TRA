from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import httpx
from app import models
from app.config import EndpointConfig, TornApiConfig
from pydantic import BaseModel

router = APIRouter(prefix="/torn", tags=["Torn API"])
api_config = TornApiConfig()


# Common headers for all requests (User-Agent)
BASE_HEADERS = {"User-Agent": "TornApiClient/1.0"}


# Common error response model (from OpenAPI spec)
class ApiErrorResponse(BaseModel):
    error: dict[str, object]


async def fetch_torn_api(endpoint: EndpointConfig, params: dict) -> dict:
    """Helper function to make requests to the Torn API.

    Args:
        endpoint (EndpointConfig): The endpoint configuration from TornApiConfig.
        params (dict): Query parameters to include in the request.

    Returns:
        dict: The JSON response from the Torn API.

    Raises:
        HTTPException: If the request fails or the API returns an error.
    """
    headers = {**BASE_HEADERS, **api_config.get_auth_header()}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                api_config.get_endpoint_url(endpoint),
                params={k: v for k, v in params.items() if v is not None},
                headers=headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            try:
                error_data = response.json()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=ApiErrorResponse(**error_data).error,
                )
            except ValueError:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Torn API returned an error",
                )
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")


@router.get("/attacks", response_model=models.FactionAttacksResponse)
async def get_user_attacks(
    filters: Optional[str] = Query(
        None,
        regex="^(incoming|outgoing)$",
        description="Filter by incoming or outgoing attacks",
    ),
    limit: Optional[int] = Query(
        100, ge=1, le=100, description="Number of rows to return (default 100)"
    ),
    sort: Optional[str] = Query(
        None, regex="^(ASC|DESC)$", description="Sort by timestamp"
    ),
    to: Optional[int] = Query(None, description="Upper timestamp limit"),
    from_: Optional[int] = Query(
        None, alias="from", description="Lower timestamp limit"
    ),
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get detailed user attacks.

    Fetches detailed attack logs for the user from the Torn API.

    Args:
        filters: Filter by 'incoming' or 'outgoing' attacks.
        limit: Number of attack records to return (1 to 100).
        sort: Sort order for timestamps ('ASC' or 'DESC').
        to: Upper timestamp limit for returned data.
        from_: Lower timestamp limit for returned data.
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        FactionAttacksResponse: Detailed attack logs with metadata.

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {
        "filters": filters,
        "limit": limit,
        "sort": sort,
        "to": to,
        "from": from_,
        "timestamp": timestamp,
        "comment": comment,
    }
    data = await fetch_torn_api(api_config.ATTACKS_ENDPOINT, params)
    return models.FactionAttacksResponse(**data)


@router.get("/attacksfull", response_model=models.FactionAttacksFullResponse)
async def get_user_attacks_full(
    filters: Optional[str] = Query(
        None,
        regex="^(incoming|outgoing)$",
        description="Filter by incoming or outgoing attacks",
    ),
    limit: Optional[int] = Query(
        1000, ge=1, le=1000, description="Number of rows to return (default 1000)"
    ),
    sort: Optional[str] = Query(
        None, regex="^(ASC|DESC)$", description="Sort by timestamp"
    ),
    to: Optional[int] = Query(None, description="Upper timestamp limit"),
    from_: Optional[int] = Query(
        None, alias="from", description="Lower timestamp limit"
    ),
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get simplified user attacks.

    Fetches simplified attack logs for the user from the Torn API.

    Args:
        filters: Filter by 'incoming' or 'outgoing' attacks.
        limit: Number of attack records to return (1 to 1000).
        sort: Sort order for timestamps ('ASC' or 'DESC').
        to: Upper timestamp limit for returned data.
        from_: Lower timestamp limit for returned data.
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        FactionAttacksFullResponse: Simplified attack logs with metadata.

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {
        "filters": filters,
        "limit": limit,
        "sort": sort,
        "to": to,
        "from": from_,
        "timestamp": timestamp,
        "comment": comment,
    }
    data = await fetch_torn_api(api_config.ATTACKS_FULL_ENDPOINT, params)
    return models.FactionAttacksFullResponse(**data)


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


@router.get("/bounties", response_model=models.UserBountiesResponse)
async def get_user_bounties(
    timestamp: Optional[int] = Query(
        None, description="Bypass cache with current timestamp"
    ),
    comment: Optional[str] = Query(None, description="Comment for logging"),
):
    """Get user bounties.

    Fetches bounties placed on the user from the Torn API.

    Args:
        timestamp: Current timestamp to bypass cache.
        comment: Comment for logging in Torn API.

    Returns:
        UserBountiesResponse: List of bounties on the user.

    Raises:
        HTTPException: If the API request fails or returns an error.
    """
    params = {"timestamp": timestamp, "comment": comment}
    data = await fetch_torn_api(api_config.BOUNTIES_ENDPOINT, params)
    return models.UserBountiesResponse(**data)


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
