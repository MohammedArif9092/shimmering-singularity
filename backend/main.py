import sys
import os

# Add the backend directory to python path for Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, students, faculty, admin, placement, chatbot

app = FastAPI(
    title="CampusConnect API",
    description="Digital Campus Management System API",
    version="1.0.0",
)

# CORS – allow all origins in dev, restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(faculty.router, prefix="/api/faculty", tags=["Faculty"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(placement.router, prefix="/api/placement", tags=["Placement"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])


@app.get("/")
async def root():
    return {"message": "CampusConnect API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
