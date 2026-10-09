import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite for zero-config local run, or PostgreSQL via environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./jurislink.db"
)

# SQLite requires connect_args for multithreading
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for yielding database sessions per request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
