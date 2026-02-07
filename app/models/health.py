"""
Health metrics data models.
"""

from pydantic import BaseModel, Field
from dataclasses import dataclass


@dataclass
class HealthMetrics:
    """Internal health metrics dataclass."""
    
    bmr: int                    # Basal Metabolic Rate
    tdee: int                   # Total Daily Energy Expenditure
    daily_calories: int         # Target daily calories
    max_carbs_per_meal: int     # Max carbs per meal (grams)
    daily_carbs_limit: int      # Daily carb limit (grams)
    protein_target: int         # Daily protein target (grams)
    sodium_limit: int = 2000    # Daily sodium limit (mg)


class HealthMetricsResponse(BaseModel):
    """API response model for health metrics."""
    
    bmr: int = Field(..., description="Basal Metabolic Rate (kcal)")
    tdee: int = Field(..., description="Total Daily Energy Expenditure (kcal)")
    daily_calories: int = Field(..., description="Recommended daily calories (kcal)")
    max_carbs_per_meal: int = Field(..., description="Maximum carbs per meal (grams)")
    daily_carbs_limit: int = Field(..., description="Daily carbohydrate limit (grams)")
    protein_target: int = Field(..., description="Daily protein target (grams)")
    sodium_limit: int = Field(default=2000, description="Daily sodium limit (mg)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "bmr": 1650,
                "tdee": 2270,
                "daily_calories": 2040,
                "max_carbs_per_meal": 45,
                "daily_carbs_limit": 130,
                "protein_target": 90,
                "sodium_limit": 2000
            }
        }