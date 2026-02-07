/**
 * Recipe Card Component
 * Displays a single recipe with nutrition info
 */

import { Clock, Flame, Wheat } from 'lucide-react';
import { RECIPE_CATEGORIES } from '../utils/constants';

function RecipeCard({ recipe, onClick, compact = false }) {
  const categoryConfig = RECIPE_CATEGORIES.find(c => c.value === recipe.category) || {};

  if (compact) {
    return (
      <div
        onClick={() => onClick?.(recipe)}
        className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryConfig.color || 'bg-gray-100'}`}>
          <span className="text-lg">{getCategoryEmoji(recipe.category)}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{recipe.name}</h4>
          <p className="text-xs text-gray-500">
            {recipe.calories} kcal · {recipe.carbs}g Carbs
          </p>
        </div>

        {/* GI Badge */}
        <GIBadge level={recipe.gi_level} />
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(recipe)}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
    >
      {/* Image placeholder */}
      <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
        <span className="text-5xl">{getCategoryEmoji(recipe.category)}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category badge */}
        <span className={`text-xs px-2 py-1 rounded-full ${categoryConfig.color || 'bg-gray-100 text-gray-600'}`}>
          {categoryConfig.label || recipe.category}
        </span>

        {/* Name */}
        <h3 className="font-semibold text-gray-800 mt-2 mb-1">{recipe.name}</h3>
        {recipe.name_en && (
          <p className="text-xs text-gray-400 mb-2">{recipe.name_en}</p>
        )}

        {/* Nutrition */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mt-3">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>{recipe.calories} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <Wheat className="w-3 h-3 text-yellow-600" />
            <span>{recipe.carbs}g</span>
          </div>
          {recipe.cooking_time_mins && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>{recipe.cooking_time_mins} min</span>
            </div>
          )}
        </div>

        {/* GI Level */}
        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="text-xs text-gray-500">GI Level</span>
          <GIBadge level={recipe.gi_level} />
        </div>
      </div>
    </div>
  );
}

/**
 * GI Level Badge
 */
function GIBadge({ level }) {
  const config = {
    low: { label: 'Low', color: 'bg-green-100 text-green-700' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    high: { label: 'High', color: 'bg-red-100 text-red-700' },
  };

  const { label, color } = config[level] || config.low;

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label} GI
    </span>
  );
}

/**
 * Get emoji for recipe category
 */
function getCategoryEmoji(category) {
  const emojis = {
    protein: '🍗',
    vegetable: '🥬',
    carb: '🍚',
    soup: '🍲',
    snack: '🥜',
    beverage: '🥤',
  };
  return emojis[category] || '🍽️';
}

export default RecipeCard;