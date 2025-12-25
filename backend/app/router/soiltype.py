from io import BytesIO
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from app.core.config import UPLOAD_DIR
from app.db import auth, models
from app.db.session import get_db
from app.models.soil import predict_soil_type_from_file
import uuid
import os
from app.reqtypes import schemas

_UPLOAD_DIR = UPLOAD_DIR + "/soil_images"
os.makedirs(_UPLOAD_DIR, exist_ok=True)
router = APIRouter()


@router.post("/soiltype/predict", response_model=schemas.SoilTypePredictionOut)
async def predict_soil_type(
    image: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db=Depends(get_db),
):
    # 1. Validate File Type (Optional but recommended)
    if image.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only JPEG/PNG allowed."
        )
    # 2. Generate a unique filename to prevent overwrites and directory traversal attacks
    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename should be provided!",
        )

    contents = await image.read()

    # 3. Save the file to disk
    file_extension = os.path.splitext(image.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(_UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    file_obj = BytesIO(contents)
    predicted_soil_type, confidence_score = predict_soil_type_from_file(file_obj)

    # 5. Save to Database
    new_soil_type_prediction = models.SoilTypePrediction(
        user_id=current_user.id,
        image_path=file_path,
        predicted_soil_type=predicted_soil_type,
    )

    db.add(new_soil_type_prediction)
    await db.commit()
    await db.refresh(new_soil_type_prediction)

    return new_soil_type_prediction


@router.delete("/soiltype/{prediction_id}", status_code=204)
async def delete_soil_type_prediction(
    prediction_id: int,
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db=Depends(get_db),
):
    """
    Delete a soil type prediction by ID.
    """
    result = await db.execute(
        select(models.SoilTypePrediction).filter(
            models.SoilTypePrediction.id == prediction_id,
            models.SoilTypePrediction.user_id == current_user.id,
        )
    )
    prediction = result.scalar_one_or_none()

    if not prediction:
        raise HTTPException(status_code=404, detail="Soil type prediction not found")

    # Optionally delete the image file from the server
    if os.path.exists(prediction.image_path):
        os.remove(prediction.image_path)

    await db.delete(prediction)
    await db.commit()
    return
