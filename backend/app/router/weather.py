import openmeteo_requests
import pandas as pd
import requests_cache
from fastapi import APIRouter, Depends, HTTPException, Query
from retry_requests import retry
import numpy as np
import httpx
import math

from app.db.session import get_db
from app.db import auth, models
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


def json_safe(obj):
    """
    Recursively replace NaN and Infinity with None (JSON null)
    to prevent FastAPI/Starlette serialization errors.
    """
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: json_safe(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [json_safe(v) for v in obj]
    return obj


@router.get("/")
async def get_weather_data(
    user: models.User = Depends(auth.get_user_by_username),
    db: AsyncSession = Depends(get_db),
):
    latitude = user.latitude
    longitude = user.longitude

    # Setup the Open-Meteo API client with cache and retry on error
    cache_session = requests_cache.CachedSession(".cache", expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": ["temperature_2m_max", "temperature_2m_min"],
        "hourly": [
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "wind_speed_120m",
            "temperature_120m",
            "soil_temperature_54cm",
            "soil_moisture_27_to_81cm",
            "terrestrial_radiation",
            "temperature_2m",
        ],
        "forecast_days": 16,
    }

    try:
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {e}")

    # --- PROCESS HOURLY DATA ---
    hourly = response.Hourly()

    # Extract data as numpy arrays
    hourly_data = {
        "date": pd.date_range(
            start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
            end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=hourly.Interval()),
            inclusive="left",
        ),
        "relative_humidity_2m": hourly.Variables(0).ValuesAsNumpy(),
        "precipitation": hourly.Variables(1).ValuesAsNumpy(),
        "rain": hourly.Variables(2).ValuesAsNumpy(),
        "wind_speed_120m": hourly.Variables(3).ValuesAsNumpy(),
        "temperature_120m": hourly.Variables(4).ValuesAsNumpy(),
        "soil_temperature_54cm": hourly.Variables(5).ValuesAsNumpy(),
        "soil_moisture_27_to_81cm": hourly.Variables(6).ValuesAsNumpy(),
        "terrestrial_radiation": hourly.Variables(7).ValuesAsNumpy(),
        "temperature_2m": hourly.Variables(8).ValuesAsNumpy(),
    }

    hourly_dataframe = pd.DataFrame(data=hourly_data)

    # Note: explicit cleaning here is good, but json_safe below handles the rest
    hourly_dataframe = hourly_dataframe.replace([np.inf, -np.inf], np.nan)
    hourly_dataframe = hourly_dataframe.where(pd.notnull(hourly_dataframe), None)

    # --- PROCESS DAILY DATA ---
    daily = response.Daily()

    daily_data = {
        "date": pd.date_range(
            start=pd.to_datetime(daily.Time(), unit="s", utc=True),
            end=pd.to_datetime(daily.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=daily.Interval()),
            inclusive="left",
        ),
        "temperature_2m_max": daily.Variables(0).ValuesAsNumpy(),
        "temperature_2m_min": daily.Variables(1).ValuesAsNumpy(),
    }

    daily_dataframe = pd.DataFrame(data=daily_data)
    daily_dataframe = daily_dataframe.replace([np.inf, -np.inf], np.nan)
    daily_dataframe = daily_dataframe.where(pd.notnull(daily_dataframe), None)

    # --- PROCESS AGGREGATES ---
    temp_mean = np.nanmean(hourly_data["temperature_2m"])
    humid_mean = np.nanmean(hourly_data["relative_humidity_2m"])
    rain_sum = np.nansum(hourly_data["rain"])

    temperature_for_rec = None if np.isnan(temp_mean) else float(temp_mean)
    humidity_for_rec = None if np.isnan(humid_mean) else float(humid_mean)
    rainfall_for_rec = float(rain_sum)

    # --- PROCESS SOIL DATA ---
    soil_data_for_rec = {}
    try:
        soil_api_url = (
            f"https://soil.narc.gov.np/soil/api/?lat={latitude}&lon={longitude}"
        )
        async with httpx.AsyncClient() as client:
            soil_response = await client.get(soil_api_url)
            soil_response.raise_for_status()
            soil_data = soil_response.json()

        ph = float(soil_data.get("ph", "0.0").strip())
        N = float(soil_data.get("total_nitrogen", "0.0 %").replace("%", "").strip())
        P = float(soil_data.get("p2o5", "0.0 kg/ha").replace("kg/ha", "").strip())
        K = float(soil_data.get("potassium", "0.0 kg/ha").replace("kg/ha", "").strip())

        soil_data_for_rec = {"ph": ph, "nitrogen": N, "phosphorus": P, "potassium": K}

    except Exception as e:
        print(f"Error fetching or parsing soil data: {e}")

    # Construct the payload
    payload = {
        "coordinates": {
            "latitude": response.Latitude(),
            "longitude": response.Longitude(),
        },
        "elevation": response.Elevation(),
        "timezone_offset_seconds": response.UtcOffsetSeconds(),
        "hourly": hourly_dataframe.to_dict(orient="records"),
        "daily": daily_dataframe.to_dict(orient="records"),
        "processed_weather_for_recommendation": {
            "temperature_2m_mean": temperature_for_rec,
            "relative_humidity_2m_mean": humidity_for_rec,
            "total_rainfall": rainfall_for_rec,
        },
        "soil_data": soil_data_for_rec,
    }

    # Wrap the entire payload in json_safe before returning
    return json_safe(payload)
