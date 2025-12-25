from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    ForeignKey,
    DateTime,
    Text,
    Date,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    latitude = Column(Numeric(precision=9, scale=6), nullable=True)
    longitude = Column(Numeric(precision=9, scale=6), nullable=True)
    is_expert = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships to other systems
    disease_scans = relationship("DiseaseDetection", back_populates="user")
    soil_type_predictions = relationship("SoilTypePrediction", back_populates="user")
    risk_reports = relationship("RiskPrediction", back_populates="user")
    questions = relationship("Question", back_populates="user")
    answers = relationship("Answer", back_populates="user")


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


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image_path = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
    votes = relationship("QuestionVote", back_populates="question", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    question = relationship("Question", back_populates="answers")
    user = relationship("User", back_populates="answers")
    votes = relationship("AnswerVote", back_populates="answer", cascade="all, delete-orphan")


class QuestionVote(Base):
    __tablename__ = "question_votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)

    # Constraint: Only one upvote per user per question
    question = relationship("Question", back_populates="votes")


class AnswerVote(Base):
    __tablename__ = "answer_votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=False)
    vote_type = Column(Integer, nullable=False)  # 1 for upvote, -1 for downvote

    answer = relationship("Answer", back_populates="votes")
