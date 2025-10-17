from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application configuration settings.
    
    Attributes:
        REDIS_HOST (str): Hostname or IP address of Redis server.
            Default: "localhost"
        REDIS_PORT (int): Port number for Redis server connection.
            Default: 6379
    """
    
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    
    class Config:
        env_file = ".env"


settings = Settings()
