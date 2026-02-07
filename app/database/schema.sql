-- ============================================================
-- DIABETIC RECIPE APP - DATABASE SCHEMA
-- Compatible with SQLite and MySQL
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User health profiles
CREATE TABLE IF NOT EXISTS user_health_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    activity_level INT NOT NULL CHECK (activity_level BETWEEN 1 AND 4),
    exercise_freq_per_week INT DEFAULT 0,
    diabetic_type VARCHAR(20) NOT NULL, -- type1, type2, prediabetic, gestational
    
    -- Calculated metrics (cached)
    bmr DECIMAL(7,2),
    tdee DECIMAL(7,2),
    daily_calories INT,
    max_carbs_per_meal INT,
    daily_carbs_limit INT,
    protein_target INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    description TEXT,
    category VARCHAR(20) NOT NULL, -- protein, vegetable, carb, soup, snack, beverage
    
    -- Nutrition per serving
    calories INT NOT NULL,
    carbs DECIMAL(5,1) NOT NULL,
    protein DECIMAL(5,1) NOT NULL,
    fat DECIMAL(5,1),
    fiber DECIMAL(5,1),
    sodium INT,
    sugar DECIMAL(5,1),
    
    -- Diabetic-specific fields
    gi_level VARCHAR(10) NOT NULL DEFAULT 'low', -- low, medium, high
    diabetic_friendly BOOLEAN DEFAULT TRUE,
    blood_sugar_impact VARCHAR(20) DEFAULT 'minimal', -- minimal, moderate, significant
    
    -- Cooking info
    cooking_time_mins INT,
    difficulty VARCHAR(10) DEFAULT 'easy', -- easy, medium, hard
    servings INT DEFAULT 1,
    
    -- Metadata
    cuisine VARCHAR(50),
    tags TEXT, -- JSON
    ingredients TEXT, -- JSON
    instructions TEXT, -- JSON
    image_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    allergies TEXT, -- JSON
    disliked_ingredients TEXT, -- JSON
    preferred_cuisines TEXT, -- JSON
    cooking_time_preference VARCHAR(10) DEFAULT 'any', -- quick, normal, any
    spicy_tolerance VARCHAR(10) DEFAULT 'mild', -- none, mild, medium, hot
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Meal logs for tracking
CREATE TABLE IF NOT EXISTS meal_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
    recipe_ids TEXT NOT NULL, -- JSON
    total_calories INT,
    total_carbs DECIMAL(5,1),
    blood_sugar_before DECIMAL(5,1),
    blood_sugar_after DECIMAL(5,1),
    notes TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat history for conversation context
CREATE TABLE IF NOT EXISTS chat_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(10) NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    metadata TEXT, -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
