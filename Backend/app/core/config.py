from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GEA API"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./gea.db"
    cors_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173"
    )
    session_cookie: str = "gea_sesion"
    session_hours: int = 8
    session_idle_minutes: int = 120
    secure_cookies: bool = False
    seed_demo: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="GEA_",
        extra="ignore",
    )

    @property
    def origins(self) -> list[str]:
        return [origen.strip() for origen in self.cors_origins.split(",") if origen.strip()]


settings = Settings()
