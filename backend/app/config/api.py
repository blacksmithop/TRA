from dataclasses import dataclass
from typing import Optional

@dataclass
class EndpointConfig:
    """Configuration for a Torn API endpoint.

    Attributes:
        path (str): The endpoint path (e.g., 'user/attacks').
        access_level (str): Required access level (e.g., 'Public', 'Minimal', 'Limited').
    """
    path: str
    access_level: str


class TornApiConfig:
    """Configuration class for Torn API base URL, endpoints, and API key.

    Encapsulates the base URL, endpoint details, and API key for the Torn API.
    Endpoint configurations are available as class attributes, and the API key
    is managed via Pydantic settings. Use this class to access endpoint URLs and
    authentication details for API requests.

    Attributes:

    Example:
        config = TornApiConfig()
        attacks_url = config.get_endpoint_url(config.ATTACKS_ENDPOINT)
        auth_header = config.get_auth_header()
    """
    
    BASE_URL: str = "https://api.torn.com/v2"

    BASIC_PROFILE_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/basic",
        access_level="Public"
    )
    """Endpoint for fetching basic user profile (requires Public access)."""

    BARS_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/bars",
        access_level="Minimal"
    )
    """Endpoint for fetching user bars information (requires Minimal access)."""
    
    REVIVES_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/revives",
        access_level="Minimal"
    )
    """Endpoint for fetching user revives (requires Minimal access)."""

    REVIVES_STATISTICS_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/personalstats",
        access_level="Public"
    )
    """Endpoint for fetching user revive statistics (requires Public access)."""
    
    def __init__(self, base_url: Optional[str] = None):
        """Initialize the TornApiConfig with an optional custom base URL.

        Args:
            base_url (Optional[str]): Custom base URL to override the default.
                                      Defaults to None, using the class's BASE_URL.
        """
        if base_url:
            self.BASE_URL = base_url.rstrip("/")

    def __str__(self) -> str:
        """Return a human-readable string representation of the config.

        Returns:
            str: String describing the base URL and number of endpoints.
        """
        endpoints = [
            attr for attr in dir(self)
            if isinstance(getattr(self, attr), EndpointConfig)
        ]
        return f"TornApiConfig(base_url={self.BASE_URL}, endpoints={len(endpoints)})"

    def __repr__(self) -> str:
        """Return a detailed string representation for debugging.

        Returns:
            str: Detailed string with base URL and endpoint details.
        """
        endpoints = [
            f"{attr}: {getattr(self, attr).path} ({getattr(self, attr).access_level})"
            for attr in dir(self)
            if isinstance(getattr(self, attr), EndpointConfig)
        ]
        return f"TornApiConfig(base_url={self.BASE_URL}, endpoints={endpoints})"

    def get_endpoint_url(self, endpoint: EndpointConfig) -> str:
        """Get the full URL for a given endpoint.

        Args:
            endpoint (EndpointConfig): The endpoint configuration.

        Returns:
            str: The full URL combining the base URL and endpoint path.
        """
        return f"{self.BASE_URL}/{endpoint.path}"

    def get_auth_header(self, api_key) -> dict[str, str]:
        """Get the Authorization header with the API key.

        Returns:
            dict[str, str]: Header dictionary with 'Authorization' key.
        """
        return {"Authorization": f"ApiKey {api_key}"}