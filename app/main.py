"""
Main application entry point.
Diabetic Recipe App - Powered by Gemini AI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.api.routes import router
from app.database.connection import DatabaseManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.
    Runs on startup and shutdown.
    """
    # Startup
    print("🚀 Starting Diabetic Recipe App...")
    settings = get_settings()
    
    if settings.is_development:
        print("📦 Development mode - initializing database...")
        try:
            DatabaseManager.create_tables()
            DatabaseManager.seed_sample_data()
            print("✅ Database initialized with sample data")
        except Exception as e:
            print(f"⚠️ Database initialization skipped: {e}")
    
    print("✅ Application started successfully!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Diabetic Recipe App",
    description="""
    A personalized meal planning application for diabetic patients.
    
    ## Features
    - 🧮 Health metrics calculation (BMR, TDEE, carb limits)
    - 💬 AI-powered conversation for recipe recommendations
    - 📋 Personalized daily and weekly meal plans
    - 🥗 Low GI recipe database
    
    ## Powered by
    - Google Gemini AI for natural language understanding
    - Function calling for smart recipe search
    - Structured output for reliable meal plans
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "Diabetic Recipe App",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to the Diabetic Recipe App API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "register": "POST /api/register",
            "chat": "POST /api/chat/{user_id}",
            "meal_plan": "POST /api/meal-plan/{user_id}",
            "recipes": "GET /api/recipes"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.is_development
    )