from fastapi import Depends, Cookie, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import app.db.models as models
from app.db.session import get_db


async def get_user_by_username(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.User)
        .options(
            selectinload(models.User.disease_scans),
            selectinload(models.User.soil_type_predictions),
            selectinload(models.User.risk_reports),
        )
        .filter(models.User.username == username)
    )
    return result.scalars().first()


async def get_user_from_cookie(
    username: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await get_user_by_username(username=username, db=db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username from cookie",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
