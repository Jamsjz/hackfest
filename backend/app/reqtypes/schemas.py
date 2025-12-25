from pydantic import BaseModel, EmailStr, Field, ConfigDict, condecimal
from typing import List, Optional, Any
from datetime import datetime, date
from decimal import Decimal


class UserBase(BaseModel):
    username: str
    latitude: float
    longitude: float


class DiseaseBase(BaseModel):
    image_path: str
    detected_disease: str
    confidence_score: condecimal(max_digits=5, decimal_places=2)  # type: ignore
    precautions: Optional[str] = None
    solutions: Optional[str] = None


class RiskBase(BaseModel):
    crop_name: str
    risk_level: str
    risk_factors: str


# --- Request Models (Input) ---


class UserCreate(UserBase): ...


class UserLogin(BaseModel):
    username: str
    password: str


class UserIn(BaseModel):
    username: str


class UserUpdate(BaseModel):
    current_username: str
    new_username: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SoilTypePredictionBase(BaseModel):
    image_path: str
    predicted_soil_type: str


class SoilTypePredictionCreate(SoilTypePredictionBase):
    pass


class DiseaseDetectionCreate(BaseModel):
    # For file uploads, we usually process the file first,
    # then creating a record might just need metadata or we use Form data.
    # This model assumes you might send metadata after upload.
    image_path: str
    detected_disease: str
    confidence_score: Decimal
    precautions: str
    solutions: str


class RiskPredictionCreate(BaseModel):
    crop_name: str
    # Other fields are calculated by the system, so we only need input


# --- Response Models (Output) ---


class DiseaseOut(DiseaseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SoilTypePredictionOut(SoilTypePredictionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RiskOut(RiskBase):
    id: int
    forecast_start_date: date
    forecast_end_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserOut(UserBase):
    id: int
    disease_scans: List[DiseaseOut] = []
    soil_type_predictions: List[SoilTypePredictionOut] = []
    risk_reports: List[RiskOut] = []
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    history: List[ChatMessage]
    message: str
    context: Optional[str] = None

