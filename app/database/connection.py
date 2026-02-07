"""
Database connection and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator

from app.config import get_settings


# Create engine
settings = get_settings()
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,   # Recycle connections after 1 hour
    echo=settings.debug  # Log SQL in debug mode
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session.
    
    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database session.
    
    Usage:
        with get_db_context() as db:
            ...
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


class DatabaseManager:
    """Manager class for database operations."""
    
    @staticmethod
    def create_tables():
        """Create all tables from schema."""
        from sqlalchemy import text
        
        with get_db_context() as db:
            # Read and execute schema file
            with open("app/database/schema.sql", "r", encoding="utf-8") as f:
                schema = f.read()
                
            # Split by statement and execute
            statements = [s.strip() for s in schema.split(";") if s.strip()]
            for statement in statements:
                if statement:
                    db.execute(text(statement))
    
    @staticmethod
    def seed_sample_data():
        """Insert sample recipe data."""
        from sqlalchemy import text
        
        sample_recipes = [
            ("r001", "Steamed Chicken Breast", "Steamed Chicken Breast", "protein", 180, 0, 32, 4, 0, 120, "low", 20),
            ("r002", "Garlic Broccoli", "Garlic Broccoli", "vegetable", 55, 8, 4, 2, 3, 80, "low", 10),
            ("r003", "Brown Rice", "Brown Rice", "carb", 150, 32, 3, 1, 2, 5, "medium", 40),
            ("r004", "Stir-fried Spinach", "Stir-fried Spinach", "vegetable", 45, 5, 3, 2, 3, 100, "low", 8),
            ("r005", "Pan-seared Salmon", "Pan-seared Salmon", "protein", 220, 0, 28, 12, 0, 90, "low", 15),
            ("r006", "Cucumber Salad", "Cucumber Salad", "vegetable", 25, 4, 1, 0, 1, 150, "low", 5),
            ("r007", "Tomato Egg Drop Soup", "Tomato Egg Drop Soup", "soup", 80, 6, 6, 4, 1, 200, "low", 15),
            ("r008", "Edamame", "Edamame", "snack", 120, 9, 11, 5, 4, 50, "low", 10),
        ]
        
        with get_db_context() as db:
            for recipe in sample_recipes:
                # Check if exists (compatible with SQLite and MySQL)
                exists = db.execute(
                    text("SELECT 1 FROM recipes WHERE id = :id"), 
                    {"id": recipe[0]}
                ).scalar()
                
                if not exists:
                    db.execute(
                        text("""
                            INSERT INTO recipes 
                            (id, name, name_en, category, calories, carbs, protein, fat, fiber, sodium, gi_level, cooking_time_mins, diabetic_friendly)
                            VALUES (:id, :name, :name_en, :category, :calories, :carbs, :protein, :fat, :fiber, :sodium, :gi_level, :cooking_time, 1)
                        """),
                        {
                            "id": recipe[0], "name": recipe[1], "name_en": recipe[2],
                            "category": recipe[3], "calories": recipe[4], "carbs": recipe[5],
                            "protein": recipe[6], "fat": recipe[7], "fiber": recipe[8],
                            "sodium": recipe[9], "gi_level": recipe[10], "cooking_time": recipe[11]
                        }
                    )