"""
Meal Plan Agent - Generates personalized meal plans with Gemini.
Uses Structured Output for reliable JSON responses.
"""

import json
from typing import Any, Dict, List, Optional

import google.generativeai as genai

from app.config import get_settings
from app.models.health import HealthMetrics


class MealPlanAgent:
    """
    Gemini-powered agent for generating personalized meal plans.

    Key Gemini Feature: Structured Output (JSON mode)
    """

    def __init__(self):
        """Initialize the meal plan agent."""
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)

        # Configure model for JSON output
        self.model = genai.GenerativeModel(
            "gemini-2.5-flash", generation_config={"response_mime_type": "application/json"}
        )

    async def generate_daily_plan(
        self,
        health_metrics: HealthMetrics,
        available_recipes: List[Dict],
        user_preferences: Optional[str] = None,
        language: str = "en",
    ) -> Dict[str, Any]:
        """
        Generate a complete daily meal plan.

        Args:
            health_metrics: User's health targets
            available_recipes: List of available recipes from database
            user_preferences: Optional user preferences
            language: Response language (en)

        Returns:
            Structured meal plan as dictionary
        """

        # Build the prompt
        prompt = f"""
        Create a diabetic-friendly daily meal plan based on the following:
        
        USER HEALTH TARGETS:
        - Daily Calories: {health_metrics.daily_calories} kcal
        - Maximum Carbs per Meal: {health_metrics.max_carbs_per_meal}g
        - Daily Carb Limit: {health_metrics.daily_carbs_limit}g
        - Protein Target: {health_metrics.protein_target}g
        - Sodium Limit: {health_metrics.sodium_limit}mg
        
        USER PREFERENCES:
        {user_preferences or "No specific preferences"}
        
        AVAILABLE RECIPES:
        {json.dumps(available_recipes, ensure_ascii=False, indent=2)}
        
        INSTRUCTIONS:
        1. Select recipes to create balanced meals for breakfast, lunch, dinner, and snacks
        2. Ensure each meal stays within the carb limit per meal
        3. Ensure daily totals stay within limits
        4. Include protein in every main meal
        5. Prioritize variety and nutrition balance
        6. Provide personalized tips for blood sugar management
        7. Write the message in English
        
        Return this EXACT JSON structure:
        {{
            "meal_plan": {{
                "breakfast": {{
                    "recipes": [
                        {{"id": "recipe_id", "name": "recipe_name", "portion": "1 serving", "carbs": 0, "calories": 0, "protein": 0}}
                    ],
                    "total_calories": 0,
                    "total_carbs": 0,
                    "total_protein": 0
                }},
                "lunch": {{
                    "recipes": [],
                    "total_calories": 0,
                    "total_carbs": 0,
                    "total_protein": 0
                }},
                "dinner": {{
                    "recipes": [],
                    "total_calories": 0,
                    "total_carbs": 0,
                    "total_protein": 0
                }},
                "snacks": {{
                    "recipes": [],
                    "total_calories": 0,
                    "total_carbs": 0,
                    "total_protein": 0
                }}
            }},
            "daily_totals": {{
                "calories": 0,
                "carbs": 0,
                "protein": 0,
                "within_limits": true
            }},
            "tips": [
                "Personalized tip 1",
                "Personalized tip 2",
                "Personalized tip 3"
            ],
            "message": "A warm, personalized message about today's meal plan"
        }}
        """

        try:
            response = await self.model.generate_content_async(prompt)
            result = json.loads(response.text)

            # Validate the response structure
            self._validate_meal_plan(result, health_metrics)

            return result

        except json.JSONDecodeError as e:
            return self._create_error_response(f"Failed to parse response: {e}")
        except Exception as e:
            print(e)
            return self._create_error_response(f"Failed to generate meal plan: {e}")

    async def adapt_recipe(
        self, recipe: Dict, health_metrics: HealthMetrics, adaptation_request: str
    ) -> Dict[str, Any]:
        """
        Adapt a recipe based on user needs.

        Args:
            recipe: Original recipe to adapt
            health_metrics: User's health targets
            adaptation_request: What the user wants to change

        Returns:
            Adapted recipe with explanation
        """

        prompt = f"""
        Adapt this recipe for a diabetic patient:
        
        ORIGINAL RECIPE:
        {json.dumps(recipe, ensure_ascii=False, indent=2)}
        
        USER REQUEST:
        {adaptation_request}
        
        USER LIMITS:
        - Max carbs per meal: {health_metrics.max_carbs_per_meal}g
        
        Provide substitutions that:
        1. Lower the glycemic impact
        2. Maintain similar taste and satisfaction
        3. Stay within carb limits
        
        Return this JSON structure:
        {{
            "adapted_recipe": {{
                "name": "Adapted recipe name",
                "changes": ["Change 1", "Change 2"],
                "new_ingredients": ["ingredient 1", "ingredient 2"],
                "new_instructions": ["step 1", "step 2"],
                "nutrition": {{
                    "calories": 0,
                    "carbs": 0,
                    "protein": 0
                }}
            }},
            "explanation": "Why these changes help with blood sugar management",
            "tips": ["Cooking tip 1"]
        }}
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return json.loads(response.text)
        except Exception as e:
            return {"error": str(e)}

    async def generate_weekly_plan(
        self, health_metrics: HealthMetrics, available_recipes: List[Dict], user_preferences: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a 7-day meal plan.

        Args:
            health_metrics: User's health targets
            available_recipes: Available recipes
            user_preferences: Optional preferences

        Returns:
            Weekly meal plan
        """

        prompt = f"""
        Create a 7-day diabetic-friendly meal plan.
        
        HEALTH TARGETS:
        - Daily Calories: {health_metrics.daily_calories} kcal
        - Max Carbs per Meal: {health_metrics.max_carbs_per_meal}g
        - Daily Carb Limit: {health_metrics.daily_carbs_limit}g
        
        AVAILABLE RECIPES:
        {json.dumps(available_recipes, ensure_ascii=False)}
        
        PREFERENCES: {user_preferences or "None"}
        
        REQUIREMENTS:
        1. Ensure variety - don't repeat the same meal too often
        2. Balance nutrition across the week
        3. Consider meal prep efficiency
        
        Return JSON with this structure:
        {{
            "weekly_plan": {{
                "monday": {{"breakfast": [], "lunch": [], "dinner": [], "snacks": []}},
                "tuesday": {{}},
                "wednesday": {{}},
                "thursday": {{}},
                "friday": {{}},
                "saturday": {{}},
                "sunday": {{}}
            }},
            "shopping_list": ["item 1", "item 2"],
            "meal_prep_tips": ["tip 1", "tip 2"],
            "weekly_summary": {{
                "avg_daily_calories": 0,
                "avg_daily_carbs": 0
            }}
        }}
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return json.loads(response.text)
        except Exception as e:
            return {"error": str(e)}

    def _validate_meal_plan(self, plan: Dict, metrics: HealthMetrics) -> None:
        """Validate that the meal plan meets requirements."""
        totals = plan.get("daily_totals", {})

        # Check if within limits
        if totals.get("carbs", 0) > metrics.daily_carbs_limit:
            plan["warnings"] = plan.get("warnings", [])
            plan["warnings"].append("Daily carbs exceed recommended limit")

        if totals.get("calories", 0) > metrics.daily_calories * 1.1:  # 10% buffer
            plan["warnings"] = plan.get("warnings", [])
            plan["warnings"].append("Daily calories exceed recommended limit")

    def _create_error_response(self, error_message: str) -> Dict[str, Any]:
        """Create a standardized error response."""
        return {"error": True, "message": error_message, "meal_plan": None}

