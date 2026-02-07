/**
 * Meal Plan Display Component
 * Shows the AI-generated daily meal plan
 */

import { MEAL_TYPES } from '../utils/constants';

function MealPlan({ mealPlan, dailyCarbsLimit }) {
  if (!mealPlan) return null;

  // Calculate total carbs from meal plan
  const totalCarbs = MEAL_TYPES.reduce((sum, meal) => {
    const mealData = mealPlan.meal_plan?.[meal.key] || mealPlan[meal.key];
    return sum + (mealData?.total_carbs || 0);
  }, 0);

  // Get tips from meal plan
  const tips = mealPlan.tips || [];
  const message = mealPlan.message || '';

  return (
    <div className="card animate-slide-up">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        🍽️ Today's Meal Plan
      </h2>

      {/* Personalized Message */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 rounded-xl text-sm text-green-800">
          {message}
        </div>
      )}

      {/* Meals */}
      <div className="space-y-1">
        {MEAL_TYPES.map((meal) => {
          const mealData = mealPlan.meal_plan?.[meal.key] || mealPlan[meal.key];
          return (
            <MealSection
              key={meal.key}
              icon={meal.icon}
              label={meal.label}
              mealData={mealData}
            />
          );
        })}
      </div>

      {/* Daily Summary */}
      <div className="mt-4 pt-4 border-t bg-gradient-to-r from-green-50 to-blue-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Daily Carbs Total</span>
          <div className="text-right">
            <span className="font-bold text-green-600 text-lg">{totalCarbs}g</span>
            <span className="text-sm text-gray-500 ml-1">/ {dailyCarbsLimit}g</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalCarbs <= dailyCarbsLimit ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((totalCarbs / dailyCarbsLimit) * 100, 100)}%` }}
          />
        </div>
        
        {totalCarbs <= dailyCarbsLimit ? (
          <p className="text-xs text-green-600 mt-2">✅ Within daily carb limit</p>
        ) : (
          <p className="text-xs text-red-600 mt-2">⚠️ Exceeds daily carb limit</p>
        )}
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="mt-6 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Today's Tips</h3>
          <ul className="space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Single Meal Section
 */
function MealSection({ icon, label, mealData }) {
  const recipes = mealData?.recipes || [];
  const totalCarbs = mealData?.total_carbs || 0;

  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-800">
          {icon} {label}
        </span>
        <span className="text-sm text-orange-600 font-medium">
          {totalCarbs}g Carbs
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {recipes.length > 0 ? (
          recipes.map((recipe, index) => (
            <RecipeTag key={index} recipe={recipe} />
          ))
        ) : (
          <span className="text-sm text-gray-400">No recommendations</span>
        )}
      </div>
    </div>
  );
}

/**
 * Recipe Tag
 */
function RecipeTag({ recipe }) {
  // Handle both object and string formats
  const name = typeof recipe === 'string' ? recipe : (recipe.name || recipe);
  const carbs = typeof recipe === 'object' ? recipe.carbs : null;

  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-default">
      <span>{name}</span>
      {carbs !== null && (
        <span className="text-xs text-gray-500">({carbs}g)</span>
      )}
    </span>
  );
}

export default MealPlan;