from dataclasses import dataclass
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

@dataclass
class EndpointConfig:
    """Configuration for a Torn API endpoint.

    Attributes:
        path (str): The endpoint path (e.g., 'user/attacks').
        access_level (str): Required access level (e.g., 'Public', 'Minimal', 'Limited').
    """
    path: str
    access_level: str

class TornApiSettings(BaseSettings):
    """Pydantic settings for Torn API configuration.

    Manages the API key for Torn API requests, loaded from environment variables
    or a .env file.

    Attributes:
        TORN_API_KEY (str): The Torn API key for authentication.

    Environment:
        Loads from .env file or system environment variables.
    """
    TORN_API_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

class TornApiConfig:
    """Configuration class for Torn API base URL, endpoints, and API key.

    Encapsulates the base URL, endpoint details, and API key for the Torn API.
    Endpoint configurations are available as class attributes, and the API key
    is managed via Pydantic settings. Use this class to access endpoint URLs and
    authentication details for API requests.

    Attributes:
        BASE_URL (str): The base URL for the Torn API (https://api.torn.com/v2).
        ATTACKS_ENDPOINT (EndpointConfig): Configuration for /user/attacks endpoint.
        ATTACKS_FULL_ENDPOINT (EndpointConfig): Configuration for /user/attacksfull endpoint.
        BARS_ENDPOINT (EndpointConfig): Configuration for /user/bars endpoint.
        BATTLESTATS_ENDPOINT (EndpointConfig): Configuration for /user/battlestats endpoint.
        BOUNTIES_ENDPOINT (EndpointConfig): Configuration for /user/bounties endpoint.
        COOLDOWNS_ENDPOINT (EndpointConfig): Configuration for /user/cooldowns endpoint.
        settings (TornApiSettings): Pydantic settings containing the TORN_API_KEY.

    Example:
        config = TornApiConfig()
        attacks_url = config.get_endpoint_url(config.ATTACKS_ENDPOINT)
        auth_header = config.get_auth_header()
    """
    
    BASE_URL: str = "https://api.torn.com/v2"
    
    PROFILE_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/profile",
        access_level="Public"
    )
    """Endpoint for fetching user profile (requires Public access)."""
    
    ATTACKS_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/attacks",
        access_level="Limited"
    )
    """Endpoint for fetching detailed user attacks (requires Limited access)."""
    
    ATTACKS_FULL_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/attacksfull",
        access_level="Limited"
    )
    """Endpoint for fetching simplified user attacks (requires Limited access)."""
    
    BARS_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/bars",
        access_level="Minimal"
    )
    """Endpoint for fetching user bars information (requires Minimal access)."""
    
    BATTLESTATS_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/battlestats",
        access_level="Limited"
    )
    """Endpoint for fetching user battle stats (requires Limited access)."""
    
    BOUNTIES_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/bounties",
        access_level="Public"
    )
    """Endpoint for fetching user bounties (requires Public access)."""
    
    COOLDOWNS_ENDPOINT: EndpointConfig = EndpointConfig(
        path="user/cooldowns",
        access_level="Minimal"
    )
    """Endpoint for fetching user cooldowns (requires Minimal access)."""

    def __init__(self, base_url: Optional[str] = None):
        """Initialize the TornApiConfig with an optional custom base URL.

        Args:
            base_url (Optional[str]): Custom base URL to override the default.
                                      Defaults to None, using the class's BASE_URL.
        """
        if base_url:
            self.BASE_URL = base_url.rstrip("/")
        self.settings = TornApiSettings()

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

    def get_auth_header(self) -> dict[str, str]:
        """Get the Authorization header with the API key.

        Returns:
            dict[str, str]: Header dictionary with 'Authorization' key.
        """
        return {"Authorization": f"ApiKey {self.settings.TORN_API_KEY}"}