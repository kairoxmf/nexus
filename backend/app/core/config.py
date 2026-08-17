from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "NEXUS City Recovery Platform"
    app_version: str = "1.0.0"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://nexus:nexus@localhost:5432/nexus"
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"

    sim_tick_ms: int = 1100
    snapshot_interval: int = 10
    default_tenant: str = "dc-metro"
    auth_required: bool = False
    city_center_lat: float = 38.9072
    city_center_lng: float = -77.0369

    jwt_secret: str = "nexus-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_model: str = "claude-3-5-haiku-20241022"
    gemini_model: str = "gemini-2.0-flash"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
