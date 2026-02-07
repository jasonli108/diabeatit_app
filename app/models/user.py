"""
User-related data models.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class DiabeticType(str, Enum):
    TYPE1 = "type1"
    TYPE2 = "type2"
    PREDIABETIC = "prediabetic"
    GESTATIONAL = "gestational"


class ActivityLevel(int, Enum):
    SEDENTARY = 1
    LIGHT = 2
    MODERATE = 3
    ACTIVE = 4


class UserProfileRequest(BaseModel):
    """Request model for user registration."""
    
    user_id: Optional[str] = None
    height_cm: float = Field(..., gt=0, le=300, description="Height in centimeters")
    weight_kg: float = Field(..., gt=0, le=500, description="Weight in kilograms")
    activity_level: ActivityLevel = Field(..., description="1=Sedentary, 2=Light, 3=Moderate, 4=Active")
    exercise_freq_per_week: int = Field(default=0, ge=0, le=7, description="Exercise sessions per week")
    diabetic_type: DiabeticType
    
    class Config:
        json_schema_extra = {
            "example": {
                "height_cm": 170,
                "weight_kg": 75,
                "activity_level": 2,
                "exercise_freq_per_week": 3,
                "diabetic_type": "type2"
            }
        }


class UserProfile(BaseModel):
    """Complete user profile with calculated metrics."""
    
    user_id: str
    height_cm: float
    weight_kg: float
    activity_level: ActivityLevel
    exercise_freq_per_week: int
    diabetic_type: DiabeticType
    
    # Calculated fields
    bmr: Optional[int] = None
    tdee: Optional[int] = None
    daily_calories: Optional[int] = None
    max_carbs_per_meal: Optional[int] = None
    daily_carbs_limit: Optional[int] = None
    protein_target: Optional[int] = None


class UserPreferences(BaseModel):
    """User dietary preferences and restrictions."""
    
    user_id: str
    allergies: List[str] = Field(default_factory=list)
    disliked_ingredients: List[str] = Field(default_factory=list)
    preferred_cuisines: List[str] = Field(default_factory=list)
    max_cooking_time: Optional[int] = Field(default=None, description="Max cooking time in minutes")
    spicy_tolerance: str = Field(default="mild", pattern="^(none|mild|medium|hot)$")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "allergies": ["seafood", "peanuts"],
                "disliked_ingredients": ["cilantro"],
                "preferred_cuisines": ["chinese", "japanese"],
                "max_cooking_time": 30,
                "spicy_tolerance": "mild"
            }
        }