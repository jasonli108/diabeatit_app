"""
Health metrics calculation service.
Pure math calculations - NO AI needed.
"""

from app.models.user import UserProfile, UserProfileRequest
from app.models.health import HealthMetrics
from app.config import DIABETIC_GUIDELINES, ACTIVITY_MULTIPLIERS


class HealthCalculator:
    """
    Calculates health metrics based on user profile.
    Uses Mifflin-St Jeor equation for BMR calculation.
    """
    
    @staticmethod
    def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
        """
        Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.
        
        Male: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age(y) + 5
        Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age(y) - 161
        """
        base = 10 * weight_kg + 6.25 * height_cm - 5 * age
        
        if gender == "male":
            return base + 5
        else:
            return base - 161
    
    @staticmethod
    def calculate_tdee(bmr: float, activity_level: int, exercise_freq: int = 0) -> float:
        """
        Calculate Total Daily Energy Expenditure.
        
        TDEE = BMR × Activity Multiplier + Exercise Bonus
        """
        multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, {}).get("multiplier", 1.2)
        tdee = bmr * multiplier
        
        # Add bonus for exercise frequency
        exercise_bonus = exercise_freq * 50  # ~50 kcal per exercise session
        tdee += exercise_bonus
        
        return tdee
    
    @staticmethod
    def get_diabetic_limits(diabetic_type: str) -> dict:
        """Get carbohydrate limits based on diabetic type."""
        return DIABETIC_GUIDELINES.get(
            diabetic_type,
            {"daily_carbs": 150, "per_meal_carbs": 45}
        )
    
    @classmethod
    def calculate(cls, profile: UserProfileRequest) -> HealthMetrics:
        """
        Calculate all health metrics for a user.
        
        Args:
            profile: User profile with physical stats and activity level
            
        Returns:
            HealthMetrics with all calculated values
        """
        # Calculate BMR
        bmr = cls.calculate_bmr(
            weight_kg=profile.weight_kg,
            height_cm=profile.height_cm,
            age=profile.age,
            gender=profile.gender.value
        )
        
        # Calculate TDEE
        tdee = cls.calculate_tdee(
            bmr=bmr,
            activity_level=profile.activity_level.value,
            exercise_freq=profile.exercise_freq_per_week
        )
        
        # Get diabetic-specific limits
        limits = cls.get_diabetic_limits(profile.diabetic_type.value)
        
        # Calculate targets
        # Use 90% of TDEE for slight caloric deficit (common for diabetes management)
        daily_calories = round(tdee * 0.9)
        
        # Protein target: ~1.2g per kg body weight
        protein_target = round(profile.weight_kg * 1.2)
        
        return HealthMetrics(
            bmr=round(bmr),
            tdee=round(tdee),
            daily_calories=daily_calories,
            max_carbs_per_meal=limits["per_meal_carbs"],
            daily_carbs_limit=limits["daily_carbs"],
            protein_target=protein_target,
            sodium_limit=2000  # Standard recommendation
        )
    
    @classmethod
    def calculate_from_dict(cls, profile_dict: dict) -> HealthMetrics:
        """Calculate metrics from a dictionary input."""
        profile = UserProfileRequest(**profile_dict)
        return cls.calculate(profile)