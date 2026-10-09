import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

default_db = "sqlite:///./jurislink.db"
if os.getenv("VERCEL"):
    tmp_path = "/tmp/jurislink.db"
    if not os.path.exists(tmp_path) and os.path.exists("./jurislink.db"):
        try:
            shutil.copy("./jurislink.db", tmp_path)
        except Exception:
            pass
    default_db = f"sqlite:///{tmp_path}"

# Default to SQLite for zero-config local run, or PostgreSQL via environment variable
DATABASE_URL = os.getenv("DATABASE_URL", default_db)

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
