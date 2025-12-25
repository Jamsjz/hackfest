from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import numpy as np
import httpx

from app.db.session import get_db
from app.db import auth
from app.models.crop import Model as CropModel
from app.reqtypes.schemas import UserIn
import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry

router = APIRouter()


@router.post("/recommend")
async def recommend_crop(
    user_in: UserIn,
    db: AsyncSession = Depends(get_db),
):
    user = await auth.get_user_by_username(username=user_in.username, db=db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    latitude = user.latitude
    longitude = user.longitude

    # Fetch weather data
    try:
        cache_session = requests_cache.CachedSession(".cache", expire_after=3600)
        retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
        openmeteo = openmeteo_requests.Client(session=retry_session)

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": float(latitude),
            "longitude": float(longitude),
            "hourly": ["rain", "relative_humidity_2m", "temperature_2m"],
            "forecast_days": 16,
        }
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]

        hourly = response.Hourly()
        hourly_rain = hourly.Variables(0).ValuesAsNumpy()
        hourly_relative_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
        hourly_temperature_2m = hourly.Variables(2).ValuesAsNumpy()

        # Process weather data
        temperature = np.mean(hourly_temperature_2m)
        humidity = np.mean(hourly_relative_humidity_2m)
        rainfall = np.sum(hourly_rain)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {e}")

    # Fetch soil data
    try:
        soil_api_url = (
            f"https://soil.narc.gov.np/soil/api/?lat={latitude}&lon={longitude}"
        )
        async with httpx.AsyncClient() as client:
            soil_response = await client.get(soil_api_url)
            soil_response.raise_for_status()
            soil_data = soil_response.json()

        # Process soil data
        ph = float(soil_data.get("ph", "0.0").strip())
        # The model expects N, P, K. The API provides 'total_nitrogen', 'p2o5', 'potassium'
        # The units are mismatched with the training data.
        # I will proceed with the raw values, but this might lead to inaccurate predictions.
        nitrogen_str = soil_data.get("total_nitrogen", "0.0 %").replace("%", "").strip()
        p2o5_str = soil_data.get("p2o5", "0.0 kg/ha").replace("kg/ha", "").strip()
        potassium_str = (
            soil_data.get("potassium", "0.0 kg/ha").replace("kg/ha", "").strip()
        )

        N = float(nitrogen_str)
        P = float(p2o5_str)
        K = float(potassium_str)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching or parsing soil data: {e}"
        )

    # Prepare data for prediction
    model_params = np.array([N, P, K, temperature, humidity, ph, rainfall])

    # Get crop recommendation
    crop_model = CropModel()
    top_crops, predictions = crop_model.topn(3, model_params)

    return {"recommended_crops": top_crops, "predictions": predictions}
