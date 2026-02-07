/**
 * Application Constants
 */

// Activity level options
export const ACTIVITY_LEVELS = [
  { value: 1, label: 'Sedentary (Office work)' },
  { value: 2, label: 'Light Activity' },
  { value: 3, label: 'Moderate Activity' },
  { value: 4, label: 'Very Active' },
];

// Diabetic type options
export const DIABETIC_TYPES = [
  { value: 'type2', label: 'Type 2 Diabetes' },
  { value: 'type1', label: 'Type 1 Diabetes' },
  { value: 'prediabetic', label: 'Pre-diabetic' },
  { value: 'gestational', label: 'Gestational Diabetes' },
];

// Meal types
export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'lunch', label: 'Lunch', icon: '☀️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
  { key: 'snacks', label: 'Snacks', icon: '🍎' },
];

// Recipe categories
export const RECIPE_CATEGORIES = [
  { value: 'protein', label: 'Protein', color: 'bg-red-50 text-red-600' },
  { value: 'vegetable', label: 'Vegetable', color: 'bg-green-50 text-green-600' },
  { value: 'carb', label: 'Carb', color: 'bg-yellow-50 text-yellow-600' },
  { value: 'soup', label: 'Soup', color: 'bg-blue-50 text-blue-600' },
  { value: 'snack', label: 'Snack', color: 'bg-purple-50 text-purple-600' },
];

// Chat suggested messages
export const SUGGESTED_MESSAGES = [
  'I want something light',
  'Any quick meal recommendations?',
  'I am allergic to seafood',
  'What should I have for dinner today?',
  'Recommend some high-protein recipes',
];

// Default profile values
export const DEFAULT_PROFILE = {
  height_cm: 170,
  weight_kg: 70,
  activity_level: 2,
  exercise_freq_per_week: 2,
  diabetic_type: 'type2',
};

// Metric display config
export const METRIC_CONFIG = [
  {
    key: 'daily_calories',
    label: 'Daily Calories',
    unit: 'kcal',
    color: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    key: 'daily_carbs_limit',
    label: 'Daily Carbs Limit',
    unit: 'g',
    color: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  {
    key: 'max_carbs_per_meal',
    label: 'Max Carbs per Meal',
    unit: 'g',
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    key: 'protein_target',
    label: 'Protein Target',
    unit: 'g',
    color: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
];