from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import settings
from app.routes import chat

app = FastAPI(title="Nick's Chat API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


# Serve static files (frontend build)
# Try multiple possible locations for dist folder
possible_paths = [
    Path(__file__).parent.parent / "dist",  # backend/dist
    Path(__file__).parent.parent.parent / "dist",  # root dist
]

for dist_path in possible_paths:
    if dist_path.exists() and (dist_path / "index.html").exists():
        app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")
        break
