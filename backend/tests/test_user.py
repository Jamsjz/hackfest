import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.__main__ import app
from app.db.session import get_db, Base
from app.db import models

# Use an in-memory SQLite database for testing, with aiosqlite driver
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency override for a test database session
async def override_get_db():
    async with TestingSessionLocal() as db:
        yield db


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
async def db_session():
    # Setup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as db:
        yield db
        
    # Teardown: Drop tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session):
    """
    A test client for the app.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_create_user(client):
    response = await client.post(
        "/users/",
        json={
            "username": "testuser",
            "latitude": 10.0,
            "longitude": 10.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"


@pytest.mark.anyio
async def test_update_user(client, db_session):
    # Create a user to update
    await client.post(
        "/users/",
        json={
            "username": "testuser",
            "latitude": 10.0,
            "longitude": 10.0,
        },
    )

    # Update the user
    response = await client.put(
        "/users/",
        json={
            "current_username": "testuser",
            "new_username": "newtestuser",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newtestuser"

    # Verify the update in the database
    # Need to execute a query in the async session
    result = await db_session.execute(
        select(models.User).filter_by(username="newtestuser")
    )
    user = result.scalar_one_or_none()
    assert user is not None


@pytest.mark.anyio
async def test_update_user_username_conflict(client):
    # Create two users
    await client.post(
        "/users/",
        json={
            "username": "testuser1",
            "latitude": 10.0,
            "longitude": 10.0,
        },
    )
    await client.post(
        "/users/",
        json={
            "username": "testuser2",
            "latitude": 10.0,
            "longitude": 10.0,
        },
    )

    # Try to update testuser1's username to testuser2's username
    response = await client.put(
        "/users/",
        json={"current_username": "testuser1", "new_username": "testuser2"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "New username already registered"


@pytest.mark.anyio
async def test_read_users_me_with_soil_type_predictions(client, db_session):
    # Create a user
    await client.post(
        "/users/",
        json={
            "username": "user_with_predictions",
            "latitude": 10.0,
            "longitude": 10.0,
        },
    )
    
    # Manually add a soil type prediction to the user
    # We first need to fetch the user ID
    result = await db_session.execute(
        select(models.User).filter_by(username="user_with_predictions")
    )
    user = result.scalar_one()

    new_prediction = models.SoilTypePrediction(
        user_id=user.id,
        image_path="/path/to/image.jpg",
        predicted_soil_type="sandy",
    )
    db_session.add(new_prediction)
    await db_session.commit()
    # No refresh needed for this test logic strictly, but good practice
    # await db_session.refresh(user) 

    # Get user details
    response = await client.get(
        "/users/me?username=user_with_predictions",
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "user_with_predictions"
    assert len(data["soil_type_predictions"]) == 1
    assert data["soil_type_predictions"][0]["predicted_soil_type"] == "sandy"
