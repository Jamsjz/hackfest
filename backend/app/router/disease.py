from io import BytesIO
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from app.core.config import UPLOAD_DIR
from app.core.constants import DISEASES_INFO
from app.db import auth, models
from app.db.session import get_db
from app.models.disease import predict_disease_from_file
import uuid
import os
from app.reqtypes import schemas

_UPLOAD_DIR = UPLOAD_DIR + "/disease_images"
os.makedirs(_UPLOAD_DIR, exist_ok=True)
router = APIRouter()


@router.post("/disease/predict", response_model=schemas.DiseaseOut)
async def predict_disease(
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
    disease_name, confidence_score = predict_disease_from_file(file_obj)

    # 5. Save to Database
    dummy_dict = {"Precautions": "", "Solution": ""}
    new_disease_scan = models.DiseaseDetection(
        user_id=current_user.id,
        image_path=file_path,
        detected_disease=disease_name,
        confidence_score=confidence_score,
        precautions=DISEASES_INFO.get(disease_name, dummy_dict).get("Precautions"),
        solutions=DISEASES_INFO.get(disease_name, dummy_dict).get("Solution"),
    )

    db.add(new_disease_scan)
    await db.commit()
    await db.refresh(new_disease_scan)

    return new_disease_scan


@router.delete("/disease/{scan_id}", status_code=204)
async def delete_disease_scan(
    scan_id: int,
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db=Depends(get_db),
):
    """
    Delete a disease scan by ID.
    """
    result = await db.execute(
        select(models.DiseaseDetection).filter(
            models.DiseaseDetection.id == scan_id,
            models.DiseaseDetection.user_id == current_user.id,
        )
    )
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(status_code=404, detail="Disease scan not found")

    # Optionally delete the image file from the server
    if os.path.exists(scan.image_path):
        os.remove(scan.image_path)

    await db.delete(scan)
    await db.commit()
    return
