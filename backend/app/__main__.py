import uvicorn

from fastapi import FastAPI
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.config import RELOAD
from app.db.session import engine
from app.db import models
from app.router import crop_router, disease_router, risk_router, soiltype_router, user_router, weather_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)
app.include_router(user_router, prefix="/users")
app.include_router(disease_router, prefix="/tests")
app.include_router(soiltype_router, prefix="/tests")
app.include_router(risk_router, prefix="/tests")
app.include_router(crop_router, prefix="/crop")
app.include_router(weather_router, prefix="/weather")

if __name__ == "__main__":
    uvicorn.run("app.__main__:app", host="0.0.0.0", port=8000, reload=RELOAD)
