from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import auth, models
from app.db.session import get_db

router = APIRouter()


@router.delete("/risk/{report_id}", status_code=204)
async def delete_risk_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a risk report by ID.
    """
    result = await db.execute(
        select(models.RiskPrediction).filter(
            models.RiskPrediction.id == report_id,
            models.RiskPrediction.user_id == current_user.id,
        )
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Risk report not found")

    await db.delete(report)
    await db.commit()
    return
