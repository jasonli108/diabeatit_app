"""
Conversation Agent - Handles natural language understanding with Gemini.
Uses Function Calling to interact with the recipe database.
"""

import json
from typing import Any, Callable, Dict, List, Optional

import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

from app.config import get_settings
from app.models.health import HealthMetrics


class ConversationAgent:
    """
    Gemini-powered conversation agent for understanding user intent
    and calling appropriate functions to search recipes.

    Key Gemini Feature: Function Calling
    """

    # System prompt for the conversation agent
    SYSTEM_PROMPT = """
    You are a friendly and supportive diabetic meal assistant. Your role is to:
    
    1. Understand what the user wants to eat
    2. Consider their diabetic dietary restrictions
    3. Use the available functions to find suitable recipes
    4. Provide helpful, encouraging responses
    
    IMPORTANT GUIDELINES:
    - Always prioritize LOW GI foods
    - Keep carbohydrate portions controlled
    - Ensure balanced nutrition with protein in each meal
    - Be warm and supportive - managing diabetes is challenging
    
    LANGUAGE:
    - Respond in English.
    
    FUNCTION USAGE:
    - Use search_recipes when user asks for food recommendations
    - Use get_meal_suggestion when user asks about specific meals (breakfast/lunch/dinner)
    - Extract preferences like "light", "quick", "no seafood" from user messages
    """

    def __init__(self, recipe_search_func: Callable):
        """
        Initialize the conversation agent.

        Args:
            recipe_search_func: Function to search recipes (injected for testability)
        """
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)

        self.recipe_search_func = recipe_search_func
        self.functions = self._define_functions()
        self.tools = Tool(function_declarations=self.functions)

        self.model = genai.GenerativeModel(
            "gemini-3-flash-preview", tools=[self.tools], system_instruction=self.SYSTEM_PROMPT
        )

        self.chat = None
        self.health_metrics: Optional[HealthMetrics] = None

    def _define_functions(self) -> List[FunctionDeclaration]:
        """Define the functions that Gemini can call."""
        return [
            FunctionDeclaration(
                name="search_recipes",
                description="Search for diabetic-friendly recipes based on user criteria. Use this when user asks for food recommendations.",
                parameters={
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": ["protein", "vegetable", "carb", "soup", "snack"],
                            "description": "Type of dish to search for",
                        },
                        "max_carbs": {"type": "integer", "description": "Maximum carbohydrates per serving in grams"},
                        "max_cooking_time": {"type": "integer", "description": "Maximum cooking time in minutes"},
                        "preference": {
                            "type": "string",
                            "description": "User preference keywords like: light, filling, quick, simple",
                        },
                    },
                },
            ),
            FunctionDeclaration(
                name="get_meal_suggestion",
                description="Get a complete meal suggestion for a specific meal time (breakfast, lunch, dinner, or snack).",
                parameters={
                    "type": "object",
                    "properties": {
                        "meal_type": {
                            "type": "string",
                            "enum": ["breakfast", "lunch", "dinner", "snack"],
                            "description": "Which meal to get suggestions for",
                        },
                        "carb_budget": {"type": "integer", "description": "Carbohydrate budget for this meal in grams"},
                    },
                    "required": ["meal_type"],
                },
            ),
        ]

    def start_conversation(self, health_metrics: HealthMetrics) -> None:
        """
        Start a new conversation with user health context.

        Args:
            health_metrics: User's calculated health metrics
        """
        self.health_metrics = health_metrics

        # Create context message with user's health info
        context = f"""
        User's Daily Nutritional Targets:
        - Daily Calories: {health_metrics.daily_calories} kcal
        - Max Carbs per Meal: {health_metrics.max_carbs_per_meal}g
        - Daily Carb Limit: {health_metrics.daily_carbs_limit}g
        - Protein Target: {health_metrics.protein_target}g
        - Sodium Limit: {health_metrics.sodium_limit}mg
        
        Please help this user find suitable meals within these limits.
        """

        # Initialize chat with context
        self.chat = self.model.start_chat(
            history=[
                {"role": "user", "parts": [context]},
                {
                    "role": "model",
                    "parts": [
                        "Understood! I will recommend suitable meals based on your nutritional targets. What would you like to eat today?"
                    ],
                },
            ]
        )

    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Process a user message and return response.

        Args:
            user_message: The user's input message

        Returns:
            Dict with response type and content
        """
        if self.chat is None:
            return {"type": "error", "message": "Conversation not started. Please register first."}

        try:
            # Send message to Gemini
            response = await self.chat.send_message_async(user_message)

            # Check if Gemini wants to call a function
            for part in response.parts:
                if hasattr(part, "function_call") and part.function_call:
                    return await self._handle_function_call(part.function_call)

            # Regular text response
            return {"type": "text", "message": response.text}

        except Exception as e:
            return {"type": "error", "message": f"Sorry, something went wrong: {str(e)}"}

    async def _handle_function_call(self, function_call) -> Dict[str, Any]:
        """
        Handle a function call from Gemini.

        Args:
            function_call: The function call object from Gemini

        Returns:
            Dict with response including function results
        """
        func_name = function_call.name
        func_args = dict(function_call.args)

        # Execute the appropriate function
        if func_name == "search_recipes":
            recipes = self.recipe_search_func(**func_args)

            # Send results back to Gemini for natural language response
            result_message = f"Search results: {json.dumps(recipes, ensure_ascii=False)}"
            follow_up = await self.chat.send_message_async(result_message)

            return {
                "type": "recipes_found",
                "recipes": recipes,
                "message": follow_up.text,
                "function_called": func_name,
                "function_args": func_args,
            }

        elif func_name == "get_meal_suggestion":
            # For meal suggestions, search multiple categories
            meal_type = func_args.get("meal_type", "lunch")
            carb_budget = func_args.get("carb_budget", self.health_metrics.max_carbs_per_meal)

            # Get protein and vegetable options
            proteins = self.recipe_search_func(category="protein", max_carbs=carb_budget)
            vegetables = self.recipe_search_func(category="vegetable", max_carbs=carb_budget)

            combined = {"proteins": proteins, "vegetables": vegetables}
            result_message = f"Food options for {meal_type}: {json.dumps(combined, ensure_ascii=False)}"
            follow_up = await self.chat.send_message_async(result_message)

            return {"type": "meal_suggestion", "recipes": combined, "message": follow_up.text, "meal_type": meal_type}

        return {"type": "unknown_function", "message": f"Unknown function: {func_name}"}

    def reset_conversation(self) -> None:
        """Reset the conversation history."""
        if self.health_metrics:
            self.start_conversation(self.health_metrics)
        else:
            self.chat = None
