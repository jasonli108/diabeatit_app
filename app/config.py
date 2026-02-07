"""
Application configuration and environment settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Gemini API
    gemini_api_key: str
    
    # Database
    database_url: str
    
    # App Settings
    app_env: str = "development"
    debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated origins into list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    @property
    def is_development(self) -> bool:
        return self.app_env == "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Diabetic dietary guidelines
DIABETIC_GUIDELINES = {
    "type1": {
        "daily_carbs": 150,
        "per_meal_carbs": 45,
        "description": "Type 1 Diabetes"
    },
    "type2": {
        "daily_carbs": 130,
        "per_meal_carbs": 45,
        "description": "Type 2 Diabetes"
    },
    "prediabetic": {
        "daily_carbs": 160,
        "per_meal_carbs": 50,
        "description": "Pre-diabetic"
    },
    "gestational": {
        "daily_carbs": 175,
        "per_meal_carbs": 45,
        "description": "Gestational Diabetes"
    }
}

# Activity level multipliers for TDEE calculation
ACTIVITY_MULTIPLIERS = {
    1: {"multiplier": 1.2, "description": "Sedentary (little or no exercise)"},
    2: {"multiplier": 1.375, "description": "Light activity (1-3 days/week)"},
    3: {"multiplier": 1.55, "description": "Moderate activity (3-5 days/week)"},
    4: {"multiplier": 1.725, "description": "Very active (6-7 days/week)"}
}