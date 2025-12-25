import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import RELOAD, UPLOAD_DIR
from app.db.session import engine
from app.db import models
from app.router import crop_router, disease_router, risk_router, soiltype_router, user_router, weather_router, chat_router, forum_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan, title="KrishiBot API", version="1.0.0")

# CORS Configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads (images)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# Include routers
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(disease_router, prefix="/tests", tags=["Disease Detection"])
app.include_router(soiltype_router, prefix="/tests", tags=["Soil Type"])
app.include_router(risk_router, prefix="/tests", tags=["Risk Assessment"])
app.include_router(crop_router, prefix="/crop", tags=["Crop Recommendation"])
app.include_router(weather_router, prefix="/weather", tags=["Weather"])
app.include_router(chat_router, prefix="/chat", tags=["AI Chat"])
app.include_router(forum_router, prefix="/forum", tags=["Community Forum"])


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "KrishiBot API"}


if __name__ == "__main__":
    uvicorn.run("app.__main__:app", host="0.0.0.0", port=8000, reload=RELOAD)
