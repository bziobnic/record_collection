import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import router
from database.database import engine
from database.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create the FastAPI app
app = FastAPI(
    title="Record Collection API",
    description="API for managing a record collection",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(router, prefix="/api")

# Serve static files (frontend) in production
frontend_dir = Path(__file__).parent.parent / "frontend" / "dist"
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="static")


@app.get("/")
async def root():
    """Root endpoint for API health check."""
    return {"message": "Record Collection API is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
