from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    ForeignKey,
    DateTime,
    Text,
    Date,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    latitude = 28.573
    longitude = 80.806
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships to other systems
    disease_scans = relationship("DiseaseDetection", back_populates="user")
    soil_type_predictions = relationship("SoilTypePrediction", back_populates="user")
    risk_reports = relationship("RiskPrediction", back_populates="user")


class DiseaseDetection(Base):
    """
    Stores history of user uploaded images for disease detection.
    Includes the prediction results and suggested precautions.
    """

    __tablename__ = "disease_detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Store path to the image file, not the BLOB itself for performance
    image_path = Column(String, nullable=False)

    # Prediction results
    detected_disease = Column(String, nullable=False)
    confidence_score = Column(Numeric(5, 2), nullable=False)

    # JSON or long text for detailed solutions
    precautions = Column(Text)
    solutions = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="disease_scans")


class SoilTypePrediction(Base):
    """
    Stores image path and predicted soil type.
    """

    __tablename__ = "soil_type_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_path = Column(String, nullable=False)
    predicted_soil_type = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="soil_type_predictions")


class RiskPrediction(Base):
    """
    Stores risk assessments for specific crops based on 120-day weather data.
    """

    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Input: What user is farming
    crop_name = Column(String, nullable=False)

    # Output: Risk analysis
    risk_level = Column(String)  # e.g., "High", "Medium", "Low"
    risk_factors = Column(Text)  # e.g., "High probability of drought in 45 days"

    # Metadata about the prediction window
    forecast_start_date = Column(Date, default=func.current_date())
    forecast_end_date = Column(Date)  # Calculated as start_date + 120 days

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="risk_reports")
