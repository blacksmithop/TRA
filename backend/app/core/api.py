from fastapi import Header, HTTPException
import hishel
import httpx
from app.config import EndpointConfig
from app.config import TornApiConfig
from pydantic import BaseModel
from .config import settings
from redis import Redis


class ApiErrorResponse(BaseModel):
    error: dict[str, object]


api_config = TornApiConfig()
# Create base storage without TTL (will be set per request)
base_storage = hishel.RedisStorage(
    client=Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT), ttl=7200.0
)

BASE_HEADERS = {"User-Agent": "TornApiClient/1.0"}


async def fetch_torn_api(api_key: str, endpoint: EndpointConfig, params: dict, cache: bool = True, ttl: int = 300) -> dict:
    """Helper function to make requests to the Torn API with caching.

    Args:
        endpoint (EndpointConfig): The endpoint configuration from TornApiConfig.
        params (dict): Query parameters to include in the request.
        cache (bool): Whether to cache or not. Defaults to True.
        ttl (int): How long to keep cache in seconds. Defaults to 300 (5 minutes).

    Returns:
        dict: The JSON response from the Torn API.

    Raises:
        HTTPException: If the request fails or the API returns an error.
    """
    headers = {**BASE_HEADERS, **api_config.get_auth_header(api_key=api_key)}

    # Set cache control headers
    if cache:
        headers["Cache-Control"] = f"max-age={ttl}"
    else:
        headers["Cache-Control"] = "no-cache"

    try:
        if cache:
            # Use hishel with caching (httpx-based)
            with hishel.CacheClient(storage=base_storage) as client:
                response = client.get(
                    api_config.get_endpoint_url(endpoint),
                    params=params,
                    headers=headers,
                    timeout=10.0,
                )
        else:
            # Bypass cache completely using regular httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    api_config.get_endpoint_url(endpoint),
                    params=params,
                    headers=headers,
                    timeout=10.0,
                )

        response.raise_for_status()
        data = response.json()
        
        if "error" in data:
            raise HTTPException(
                status_code=403,
                detail="Access level of this key is not high enough",
            )
        return data
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except httpx.HTTPStatusError as e:
        # Handle HTTP errors (4xx, 5xx)
        try:
            error_data = e.response.json()
            raise HTTPException(
                status_code=e.response.status_code,
                detail=ApiErrorResponse(**error_data).error,
            )
        except (ValueError, AttributeError):
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Torn API returned an error: {e.response.text}",
            )
    except httpx.RequestError as e:
        # Handle connection errors, timeouts, etc.
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to Torn API: {str(e)}"
        )
    except Exception as e:
        print(f"Unexpected error fetching Torn API: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while calling Torn API"
        )


async def get_api_key(authorization: str = Header(...)):
    """Extract API key from Authorization header in 'Bearer' format."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Expected 'Bearer <api_key>'",
        )
    return authorization.replace("Bearer ", "").strip()


__all__ = ["api_config", "fetch_torn_api", "get_api_key"]