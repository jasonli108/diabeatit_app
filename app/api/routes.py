"""
API Routes for the Diabetic Recipe App.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import uuid4

from app.database.connection import get_db
from app.models.user import UserProfileRequest, UserPreferences
from app.models.health import HealthMetricsResponse
from app.models.recipe import Recipe, MealPlanResponse
from app.services.health_calculator import HealthCalculator
from app.services.recipe_repository import RecipeRepository, get_recipes_for_agent
from app.agents.conversation_agent import ConversationAgent
from app.agents.meal_plan_agent import MealPlanAgent

# Create router
router = APIRouter(prefix="/api", tags=["Diabetic Recipe API"])

# Store active sessions (in production, use Redis or database)
active_sessions = {}


# ============================================================
# Health Profile Endpoints
# ============================================================

@router.post("/register", response_model=dict)
async def register_user(
    profile: UserProfileRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user and calculate their health metrics.
    
    This endpoint:
    1. Validates user profile data
    2. Calculates BMR, TDEE, and nutritional targets
    3. Initializes conversation agent for the user
    
    Returns health metrics and a session ID.
    """
    # Generate user ID if not provided
    user_id = profile.user_id or str(uuid4())
    
    # Calculate health metrics (no AI needed)
    metrics = HealthCalculator.calculate(profile)
    
    # Create recipe search function for this session
    def recipe_search_func(**kwargs):
        return get_recipes_for_agent(db, **kwargs)
    
    # Initialize conversation agent
    conversation_agent = ConversationAgent(recipe_search_func)
    conversation_agent.start_conversation(metrics)
    
    # Initialize meal plan agent
    meal_plan_agent = MealPlanAgent()
    
    # Store session
    active_sessions[user_id] = {
        "profile": profile,
        "metrics": metrics,
        "conversation_agent": conversation_agent,
        "meal_plan_agent": meal_plan_agent
    }
    
    return {
        "status": "success",
        "user_id": user_id,
        "health_metrics": {
            "bmr": metrics.bmr,
            "tdee": metrics.tdee,
            "daily_calories": metrics.daily_calories,
            "max_carbs_per_meal": metrics.max_carbs_per_meal,
            "daily_carbs_limit": metrics.daily_carbs_limit,
            "protein_target": metrics.protein_target,
            "sodium_limit": metrics.sodium_limit
        }
    }


@router.get("/health-metrics/{user_id}", response_model=HealthMetricsResponse)
async def get_health_metrics(user_id: str):
    """Get health metrics for a registered user."""
    if user_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    metrics = active_sessions[user_id]["metrics"]
    return HealthMetricsResponse(
        bmr=metrics.bmr,
        tdee=metrics.tdee,
        daily_calories=metrics.daily_calories,
        max_carbs_per_meal=metrics.max_carbs_per_meal,
        daily_carbs_limit=metrics.daily_carbs_limit,
        protein_target=metrics.protein_target,
        sodium_limit=metrics.sodium_limit
    )


# ============================================================
# Chat Endpoints (Conversation Agent)
# ============================================================

@router.post("/chat/{user_id}")
async def chat(
    user_id: str,
    message: dict,
    db: Session = Depends(get_db)
):
    """
    Send a message to the conversation agent.
    
    The agent will:
    1. Understand user intent
    2. Call appropriate functions (search recipes, etc.)
    3. Return a helpful response
    
    Request body: {"message": "I want something light"}
    """
    if user_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    user_message = message.get("message", "")
    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )
    
    agent = active_sessions[user_id]["conversation_agent"]
    response = await agent.process_message(user_message)
    
    return response


@router.post("/chat/{user_id}/reset")
async def reset_chat(user_id: str):
    """Reset the conversation history for a user."""
    if user_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    agent = active_sessions[user_id]["conversation_agent"]
    agent.reset_conversation()
    
    return {"status": "success", "message": "Conversation reset."}


# ============================================================
# Meal Plan Endpoints (Meal Plan Agent)
# ============================================================

@router.post("/meal-plan/{user_id}")
async def generate_meal_plan(
    user_id: str,
    preferences: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """
    Generate a personalized daily meal plan.
    
    Request body (optional): {"preferences": "I want something light"}
    """
    if user_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    session = active_sessions[user_id]
    metrics = session["metrics"]
    meal_plan_agent = session["meal_plan_agent"]
    
    # Get available recipes from database
    repo = RecipeRepository(db)
    recipes = repo.search(
        max_carbs=metrics.max_carbs_per_meal,
        gi_level="low",
        limit=20
    )
    
    # Generate meal plan with Gemini
    user_prefs = preferences.get("preferences") if preferences else None
    plan = await meal_plan_agent.generate_daily_plan(
        health_metrics=metrics,
        available_recipes=recipes,
        user_preferences=user_prefs
    )
    
    return {
        "status": "success",
        "meal_plan": plan,
        "health_metrics": {
            "daily_calories": metrics.daily_calories,
            "daily_carbs_limit": metrics.daily_carbs_limit
        }
    }


@router.post("/meal-plan/{user_id}/weekly")
async def generate_weekly_plan(
    user_id: str,
    preferences: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """Generate a 7-day meal plan."""
    if user_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    
    session = active_sessions[user_id]
    metrics = session["metrics"]
    meal_plan_agent = session["meal_plan_agent"]
    
    repo = RecipeRepository(db)
    recipes = repo.search(gi_level="low", limit=30)
    
    user_prefs = preferences.get("preferences") if preferences else None
    plan = await meal_plan_agent.generate_weekly_plan(
        health_metrics=metrics,
        available_recipes=recipes,
        user_preferences=user_prefs
    )
    
    return {"status": "success", "weekly_plan": plan}


# ============================================================
# Recipe Endpoints
# ============================================================

@router.get("/recipes")
async def search_recipes(
    category: Optional[str] = None,
    max_carbs: Optional[float] = None,
    max_cooking_time: Optional[int] = None,
    gi_level: str = "low",
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Search recipes with filters.
    
    Query parameters:
    - category: protein, vegetable, carb, soup, snack
    - max_carbs: Maximum carbs per serving
    - max_cooking_time: Maximum cooking time in minutes
    - gi_level: low, medium, high (default: low)
    - limit: Number of results (default: 10)
    """
    repo = RecipeRepository(db)
    recipes = repo.search(
        category=category,
        max_carbs=max_carbs,
        max_cooking_time=max_cooking_time,
        gi_level=gi_level,
        limit=limit
    )
    
    return {"recipes": recipes, "count": len(recipes)}


@router.get("/recipes/{recipe_id}")
async def get_recipe(
    recipe_id: str,
    db: Session = Depends(get_db)
):
    """Get a single recipe by ID."""
    repo = RecipeRepository(db)
    recipe = repo.get_by_id(recipe_id)
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found."
        )
    
    return recipe


@router.get("/recipes/categories/all")
async def get_recipes_by_categories(
    db: Session = Depends(get_db)
):
    """Get all recipes grouped by category."""
    repo = RecipeRepository(db)
    grouped = repo.get_all_for_meal_planning()
    
    return {"categories": grouped}