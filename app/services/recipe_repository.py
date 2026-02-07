"""
Recipe database operations.
Standard SQL queries - NO AI needed.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.recipe import Recipe, RecipeCategory, GILevel


class RecipeRepository:
    """
    Repository for recipe database operations.
    Handles all CRUD and search operations for recipes.
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def search(
        self,
        category: Optional[str] = None,
        max_carbs: Optional[float] = None,
        max_sodium: Optional[int] = None,
        gi_level: str = "low",
        max_cooking_time: Optional[int] = None,
        exclude_ingredients: Optional[List[str]] = None,
        cuisine: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search recipes with filters.
        
        Args:
            category: Recipe category (protein, vegetable, carb, etc.)
            max_carbs: Maximum carbs per serving
            max_sodium: Maximum sodium per serving
            gi_level: Glycemic index level (low, medium, high)
            max_cooking_time: Maximum cooking time in minutes
            exclude_ingredients: Ingredients to exclude
            cuisine: Preferred cuisine type
            limit: Maximum number of results
            
        Returns:
            List of matching recipes
        """
        query = """
            SELECT * FROM recipes 
            WHERE diabetic_friendly = TRUE
        """
        params = {}
        
        if gi_level:
            query += " AND gi_level = :gi_level"
            params["gi_level"] = gi_level
        
        if category:
            query += " AND category = :category"
            params["category"] = category
        
        if max_carbs is not None:
            query += " AND carbs <= :max_carbs"
            params["max_carbs"] = max_carbs
        
        if max_sodium is not None:
            query += " AND (sodium IS NULL OR sodium <= :max_sodium)"
            params["max_sodium"] = max_sodium
        
        if max_cooking_time is not None:
            query += " AND (cooking_time_mins IS NULL OR cooking_time_mins <= :max_cooking_time)"
            params["max_cooking_time"] = max_cooking_time
        
        if cuisine:
            query += " AND cuisine = :cuisine"
            params["cuisine"] = cuisine
        
        # Order by carbs (lower first) and protein (higher first)
        query += " ORDER BY carbs ASC, protein DESC"
        query += " LIMIT :limit"
        params["limit"] = limit
        
        result = self.db.execute(text(query), params)
        return [dict(row._mapping) for row in result]
    
    def get_by_id(self, recipe_id: str) -> Optional[Dict[str, Any]]:
        """Get a single recipe by ID."""
        query = "SELECT * FROM recipes WHERE id = :recipe_id"
        result = self.db.execute(text(query), {"recipe_id": recipe_id})
        row = result.fetchone()
        return dict(row._mapping) if row else None
    
    def get_by_ids(self, recipe_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple recipes by IDs."""
        if not recipe_ids:
            return []
        
        placeholders = ", ".join([f":id_{i}" for i in range(len(recipe_ids))])
        query = f"SELECT * FROM recipes WHERE id IN ({placeholders})"
        params = {f"id_{i}": rid for i, rid in enumerate(recipe_ids)}
        
        result = self.db.execute(text(query), params)
        return [dict(row._mapping) for row in result]
    
    def get_by_category(self, category: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recipes by category."""
        return self.search(category=category, limit=limit)
    
    def get_low_gi_recipes(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get all low GI recipes."""
        return self.search(gi_level="low", limit=limit)
    
    def get_quick_recipes(self, max_time: int = 15, limit: int = 10) -> List[Dict[str, Any]]:
        """Get quick recipes under specified time."""
        return self.search(max_cooking_time=max_time, limit=limit)
    
    def get_all_for_meal_planning(self, max_carbs_per_meal: int = 45) -> Dict[str, List[Dict]]:
        """
        Get all recipes suitable for meal planning, grouped by category.
        
        Returns:
            Dict with categories as keys and recipe lists as values
        """
        recipes = self.search(max_carbs=max_carbs_per_meal, gi_level="low", limit=50)
        
        grouped = {
            "protein": [],
            "vegetable": [],
            "carb": [],
            "soup": [],
            "snack": []
        }
        
        for recipe in recipes:
            category = recipe.get("category", "other")
            if category in grouped:
                grouped[category].append(recipe)
        
        return grouped


# Standalone function for use without dependency injection
def get_recipes_for_agent(
    db_session: Session,
    category: Optional[str] = None,
    max_carbs: Optional[float] = None,
    max_cooking_time: Optional[int] = None,
    preference: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Helper function for agents to search recipes.
    This is called by the Conversation Agent via function calling.
    """
    repo = RecipeRepository(db_session)
    
    # Map preference keywords to filters
    filters = {
        "gi_level": "low"  # Always prioritize low GI for diabetics
    }
    
    if category:
        filters["category"] = category
    
    if max_carbs:
        filters["max_carbs"] = max_carbs
    
    if max_cooking_time:
        filters["max_cooking_time"] = max_cooking_time
    
    # Handle preference keywords
    if preference:
        preference = preference.lower()
        if "quick" in preference or "fast" in preference:
            filters["max_cooking_time"] = 15
        if "light" in preference:
            filters["max_carbs"] = 30
    
    return repo.search(**filters, limit=10)