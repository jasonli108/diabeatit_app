"""
Recipe and meal plan data models.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum


class RecipeCategory(str, Enum):
    PROTEIN = "protein"
    VEGETABLE = "vegetable"
    CARB = "carb"
    SOUP = "soup"
    SNACK = "snack"
    BEVERAGE = "beverage"


class GILevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Recipe(BaseModel):
    """Recipe model."""
    
    id: str
    name: str
    name_en: Optional[str] = None
    description: Optional[str] = None
    category: RecipeCategory
    
    # Nutrition per serving
    calories: int
    carbs: float
    protein: float
    fat: Optional[float] = None
    fiber: Optional[float] = None
    sodium: Optional[int] = None
    sugar: Optional[float] = None
    
    # Diabetic-specific
    gi_level: GILevel
    diabetic_friendly: bool = True
    
    # Cooking info
    cooking_time_mins: Optional[int] = None
    difficulty: str = "easy"
    servings: int = 1
    
    # Details
    cuisine: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    ingredients: List[str] = Field(default_factory=list)
    instructions: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "r001",
                "name": "Steamed Chicken Breast",
                "name_en": "Steamed Chicken Breast",
                "category": "protein",
                "calories": 180,
                "carbs": 0,
                "protein": 32,
                "sodium": 120,
                "gi_level": "low",
                "cooking_time_mins": 20,
                "ingredients": ["Chicken breast 200g", "Ginger 3 slices", "Green onion 1"],
                "instructions": ["Wash and dry chicken breast", "Add ginger and green onion", "Steam for 15 minutes"]
            }
        }


class MealItem(BaseModel):
    """Single item in a meal."""
    
    id: str
    name: str
    portion: str = "1 serving"
    carbs: float
    calories: int
    protein: float


class Meal(BaseModel):
    """A single meal (breakfast, lunch, etc.)."""
    
    recipes: List[MealItem]
    total_calories: int
    total_carbs: float
    total_protein: float


class DailyTotals(BaseModel):
    """Daily nutrition totals."""
    
    calories: int
    carbs: float
    protein: float
    within_limits: bool


class MealPlan(BaseModel):
    """Complete daily meal plan."""
    
    breakfast: Meal
    lunch: Meal
    dinner: Meal
    snacks: Meal
    daily_totals: DailyTotals
    tips: List[str] = Field(default_factory=list)
    message: str = ""


class MealPlanResponse(BaseModel):
    """API response for meal plan generation."""
    
    status: str = "success"
    meal_plan: MealPlan
    health_metrics: Dict
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "meal_plan": {
                    "breakfast": {
                        "recipes": [{"id": "r001", "name": "Tomato Egg Drop Soup", "carbs": 6}],
                        "total_carbs": 6,
                        "total_calories": 80
                    }
                },
                "health_metrics": {
                    "daily_calories": 1800,
                    "daily_carbs_limit": 130
                }
            }
        }