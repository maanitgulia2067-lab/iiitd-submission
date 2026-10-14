import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import init_db
from .seed_data import seed
from .routers import (
    auth, students, projects, matching,
    requests, skillshare, clubs, opportunities,
    notifications, showcase, chat
)

app = FastAPI(
    title="GroundUp API",
    description="A Student-First Cross-College Collaboration and Project-Building Platform (HackShift SRS v0.2)",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(projects.router)
app.include_router(matching.router)
app.include_router(requests.router)
app.include_router(skillshare.router)
app.include_router(clubs.router)
app.include_router(opportunities.router)
app.include_router(notifications.router_notifs)
app.include_router(notifications.router_mod)
app.include_router(showcase.router)
app.include_router(chat.router)

@app.on_event("startup")
def on_startup():
    init_db()
    seed()

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "GroundUp",
        "version": "0.2.0",
        "database": "SQLite (PostgreSQL Compatible)"
    }

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/")
    def serve_index():
        idx = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(idx):
            return FileResponse(idx)
        return {"message": "CampusConnect API is running. Visit /docs for OpenAPI documentation."}

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Endpoint not found")
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        idx = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(idx):
            return FileResponse(idx)
        return {"message": "CampusConnect API is running."}
