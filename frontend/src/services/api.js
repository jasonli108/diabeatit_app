/**
 * API Service for Diabetic Recipe App
 * Handles all communication with the backend
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for AI responses
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    let errorMessage = error.response?.data?.detail || error.message;

    // Check for rate limit / quota errors
    const isQuotaError = 
      error.response?.status === 429 || 
      (typeof errorMessage === 'string' && (
        errorMessage.toLowerCase().includes('quota') || 
        errorMessage.toLowerCase().includes('limit') ||
        errorMessage.toLowerCase().includes('resource exhausted')
      ));

    if (isQuotaError) {
      errorMessage = "⚠️ AI Service Usage Limit Reached. Please try again later.";
    }

    console.error('❌ API Error:', errorMessage);

    // Propagate the specific error message
    if (error.response) {
      if (!error.response.data) error.response.data = {};
      // Ensure detail is set if it's an object, or replace data if it's not (though usually it is)
      if (typeof error.response.data === 'object') {
        error.response.data.detail = errorMessage;
      }
    } else {
      error.message = errorMessage;
    }

    return Promise.reject(error);
  }
);

/**
 * User Registration & Health Profile
 */
export const userApi = {
  /**
   * Register a new user and calculate health metrics
   * @param {Object} profile - User profile data
   * @returns {Promise} Response with user_id and health_metrics
   */
  register: async (profile) => {
    const response = await api.post('/register', profile);
    return response.data;
  },

  /**
   * Get health metrics for a user
   * @param {string} userId - User ID
   * @returns {Promise} Health metrics
   */
  getHealthMetrics: async (userId) => {
    const response = await api.get(`/health-metrics/${userId}`);
    return response.data;
  },
};

/**
 * Chat / Conversation Agent
 */
export const chatApi = {
  /**
   * Send a message to the AI assistant
   * @param {string} userId - User ID
   * @param {string} message - User message
   * @returns {Promise} AI response
   */
  sendMessage: async (userId, message) => {
    const response = await api.post(`/chat/${userId}`, { message });
    return response.data;
  },

  /**
   * Reset conversation history
   * @param {string} userId - User ID
   * @returns {Promise} Reset confirmation
   */
  resetChat: async (userId) => {
    const response = await api.post(`/chat/${userId}/reset`);
    return response.data;
  },
};

/**
 * Meal Plan Agent
 */
export const mealPlanApi = {
  /**
   * Generate a daily meal plan
   * @param {string} userId - User ID
   * @param {string} preferences - Optional user preferences
   * @returns {Promise} Generated meal plan
   */
  generateDaily: async (userId, preferences = null) => {
    const response = await api.post(`/meal-plan/${userId}`, {
      preferences: preferences,
    });
    return response.data;
  },

  /**
   * Generate a weekly meal plan
   * @param {string} userId - User ID
   * @param {string} preferences - Optional user preferences
   * @returns {Promise} Generated weekly plan
   */
  generateWeekly: async (userId, preferences = null) => {
    const response = await api.post(`/meal-plan/${userId}/weekly`, {
      preferences: preferences,
    });
    return response.data;
  },
};

/**
 * Recipe Search
 */
export const recipeApi = {
  /**
   * Search recipes with filters
   * @param {Object} filters - Search filters
   * @returns {Promise} List of recipes
   */
  search: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.maxCarbs) params.append('max_carbs', filters.maxCarbs);
    if (filters.maxCookingTime) params.append('max_cooking_time', filters.maxCookingTime);
    if (filters.giLevel) params.append('gi_level', filters.giLevel);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/recipes?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single recipe by ID
   * @param {string} recipeId - Recipe ID
   * @returns {Promise} Recipe details
   */
  getById: async (recipeId) => {
    const response = await api.get(`/recipes/${recipeId}`);
    return response.data;
  },

  /**
   * Get recipes grouped by category
   * @returns {Promise} Recipes grouped by category
   */
  getByCategories: async () => {
    const response = await api.get('/recipes/categories/all');
    return response.data;
  },
};

export default api;