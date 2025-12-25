import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.__main__ import app

from app.db.session import get_db, Base
from app.db import models

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency override for a test database session
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    A test client for the app.
    """
    return TestClient(app)


def test_create_user(client):
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "latitude": 10.0,
            "longitude": 10.0,
            "land_area_ropani": 1.0,
            "money": 1000,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["money"] == 1000


def test_update_user(client, db_session):
    # Create a user to update
    client.post(
        "/users/register",
        json={
            "username": "testuser",
            "latitude": 10.0,
            "longitude": 10.0,
            "land_area_ropani": 1.0,
            "money": 1000,
        },
    )

    # Update the user
    response = client.post(
        "/users/update",
        json={
            "current_username": "testuser",
            "new_username": "newtestuser",
            "money": 2000,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newtestuser"
    assert data["money"] == 2000

    # Verify the update in the database
    user = db_session.query(models.User).filter_by(username="newtestuser").first()
    assert user is not None
    assert user.money == 2000


def test_update_user_username_conflict(client):
    # Create two users
    client.post(
        "/users/register",
        json={
            "username": "testuser1",
            "latitude": 10.0,
            "longitude": 10.0,
            "land_area_ropani": 1.0,
            "money": 1000,
        },
    )
    client.post(
        "/users/register",
        json={
            "username": "testuser2",
            "latitude": 10.0,
            "longitude": 10.0,
            "land_area_ropani": 1.0,
            "money": 1000,
        },
    )

    # Try to update testuser1's username to testuser2's username
    response = client.post(
        "/users/update",
        json={"current_username": "testuser1", "new_username": "testuser2"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "New username already registered"


def test_read_users_me_with_soil_type_predictions(client, db_session):
    # Create a user
    client.post(
        "/users/register",
        json={
            "username": "user_with_predictions",
            "latitude": 10.0,
            "longitude": 10.0,
            "land_area_ropani": 1.0,
            "money": 1000,
        },
    )
    
    # Manually add a soil type prediction to the user
    user = db_session.query(models.User).filter_by(username="user_with_predictions").first()
    new_prediction = models.SoilTypePrediction(
        user_id=user.id,
        image_path="/path/to/image.jpg",
        predicted_soil_type="sandy",
    )
    db_session.add(new_prediction)
    db_session.commit()
    db_session.refresh(user)

    # Get user details
    response = client.post(
        "/users/me",
        json={"username": "user_with_predictions"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "user_with_predictions"
    assert len(data["soil_type_predictions"]) == 1
    assert data["soil_type_predictions"][0]["predicted_soil_type"] == "sandy"

