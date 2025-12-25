from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import auth, models
from app.db.session import get_db
from app.reqtypes import schemas

router = APIRouter()


@router.post("/")
async def register_user(
    new_user: schemas.UserCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.User).filter(models.User.username == new_user.username)
    )
    user = result.first()

    if user:
        raise HTTPException(status_code=400, detail="Username already registered")

    new_user_db = models.User(
        username=new_user.username,
        latitude=new_user.latitude,
        longitude=new_user.longitude,
    )
    db.add(new_user_db)
    await db.commit()
    await db.refresh(new_user_db)
    return new_user_db


@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(
    username: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Get current user profile.
    """
    user = await auth.get_user_by_username(username=username, db=db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    response.set_cookie(key="username", value=username)
    return user


@router.put("/", response_model=schemas.UserOut)
async def update_user(
    user_update: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update user profile.
    """
    user = await auth.get_user_by_username(username=user_update.current_username, db=db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.new_username:
        result = await db.execute(
            select(models.User).filter(models.User.username == user_update.new_username)
        )
        if result.first():
            raise HTTPException(
                status_code=400, detail="New username already registered"
            )
        user.username = user_update.new_username

    if user_update.latitude is not None:
        user.latitude = user_update.latitude
    if user_update.longitude is not None:
        user.longitude = user_update.longitude

    await db.commit()
    await db.refresh(user)
    return user
