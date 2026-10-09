import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .seed import seed_database
from .routers import cases, reminders, ivr, nlp, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo court cases
    print("🚀 Initializing Jurislink Database and seeding demo records...")
    seed_database()
    yield
    print("🛑 Shutting down Jurislink API...")

app = FastAPI(
    title="Jurislink Backend API",
    description="Multilingual Case-Status & Telephony Accessibility Layer for Indian Courts (eCourts/NJDG)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(cases.router, prefix="/api")
app.include_router(reminders.router, prefix="/api")
app.include_router(ivr.router, prefix="/api")
app.include_router(nlp.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Jurislink FastAPI",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
