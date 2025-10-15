from fastapi import Header, HTTPException
import hishel
from app.config import EndpointConfig
from app.config import TornApiConfig
from pydantic import BaseModel

class ApiErrorResponse(BaseModel):
    error: dict[str, object]


api_config = TornApiConfig()

BASE_HEADERS = {"User-Agent": "TornApiClient/1.0"}


async def fetch_torn_api(api_key: str ,endpoint: EndpointConfig, params: dict) -> dict:
    """Helper function to make requests to the Torn API with caching.

    Args:
        endpoint (EndpointConfig): The endpoint configuration from TornApiConfig.
        params (dict): Query parameters to include in the request.

    Returns:
        dict: The JSON response from the Torn API.

    Raises:
        HTTPException: If the request fails or the API returns an error.
    """
    headers = {**BASE_HEADERS, **api_config.get_auth_header(api_key=api_key)}
    
    # Configure Hishel's AsyncCacheClient with in-memory storage
    async with hishel.AsyncCacheClient(
    ) as client:
        try:
            response = await client.get(
                api_config.get_endpoint_url(endpoint),
                params={k: v for k, v in params.items() if v is not None},
                headers=headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()
        except hishel.HTTPStatusError as e:
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
        except hishel.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")

async def get_api_key(authorization: str = Header(...)):
    """Extract API key from Authorization header in 'Bearer' format."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Expected 'Bearer <api_key>'")
    return authorization.replace("Bearer ", "").strip()

__all__ = ["api_config", "fetch_torn_api", "get_api_key"]