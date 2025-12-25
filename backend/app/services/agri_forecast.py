"""
Advanced Agricultural Forecasting Service

Implements comprehensive precision agriculture analytics:
- Growing Degree Days (GDD) & Phenology Tracking
- Water Balance & Root-Zone Health
- Vapor Pressure Deficit (VPD) & Stress Analysis
- Evapotranspiration (ET₀) Calculation
- Disease & Pest Risk Assessment
- Yield Estimation & Harvest Prediction
"""

import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.agri_constants import CROP_PROFILES, STEFAN_BOLTZMANN, PSYCHROMETRIC_CONST


# ============================================================================
# VAPOR PRESSURE & ATMOSPHERIC CALCULATIONS
# ============================================================================

def calculate_saturation_vapor_pressure(temp_c: float) -> float:
    """Calculate es in kPa from temperature in Celsius (Magnus formula)"""
    if temp_c is None:
        return 0.0
    return 0.6108 * math.exp((17.27 * temp_c) / (temp_c + 237.3))


def calculate_slope_vapor_pressure_curve(temp_c: float) -> float:
    """Calculate slope (Delta) in kPa/degC"""
    if temp_c is None:
        return 0.0
    val = (4098 * (0.6108 * math.exp((17.27 * temp_c) / (temp_c + 237.3)))) / math.pow((temp_c + 237.3), 2)
    return val


def calculate_vpd(temp_c: float, rh: float) -> float:
    """
    Calculate Vapor Pressure Deficit (VPD) in kPa.
    High VPD → stomata close → yield loss
    Low VPD → disease pressure
    """
    if temp_c is None or rh is None:
        return 1.0
    es = calculate_saturation_vapor_pressure(temp_c)
    ea = (rh / 100) * es
    return max(0, es - ea)


def classify_vpd_stress(vpd: float) -> Dict[str, Any]:
    """Classify VPD stress level"""
    if vpd < 0.4:
        return {"level": "Low", "status": "Disease Risk", "color": "blue"}
    elif vpd < 0.8:
        return {"level": "Optimal", "status": "Healthy", "color": "green"}
    elif vpd < 1.2:
        return {"level": "Moderate", "status": "Light Stress", "color": "yellow"}
    elif vpd < 1.6:
        return {"level": "High", "status": "Transpiration Stress", "color": "orange"}
    else:
        return {"level": "Critical", "status": "Severe Stress", "color": "red"}


# ============================================================================
# EVAPOTRANSPIRATION (ET₀) - FAO-56 PENMAN-MONTEITH
# ============================================================================

def calculate_et0(
    temp_min: float, temp_max: float, temp_mean: float,
    rh_mean: float, wind_speed: float, elevation: float,
    radiation: float, lat_rad: float = 0.5, day_of_year: int = 180
) -> float:
    """
    FAO-56 Penman-Monteith equation for reference evapotranspiration (ET0).
    Input units: Temp (C), RH (%), Wind (m/s at 2m), Radiation (W/m2), Elevation (m).
    Output: ET0 (mm/day)
    """
    if None in [temp_min, temp_max, temp_mean, rh_mean, wind_speed, radiation]:
        return 3.5  # Fallback average

    # 1. Psychrometric constant adjustment for altitude
    pressure = 101.3 * math.pow((293 - 0.0065 * elevation) / 293, 5.26)
    gamma = 0.000665 * pressure

    # 2. Vapor Pressure Deficit (es - ea)
    es_max = calculate_saturation_vapor_pressure(temp_max)
    es_min = calculate_saturation_vapor_pressure(temp_min)
    es = (es_max + es_min) / 2
    ea = (rh_mean / 100) * es
    vpd = max(0, es - ea)

    # 3. Slope of vapor pressure curve
    delta = calculate_slope_vapor_pressure_curve(temp_mean)

    # 4. Net Radiation (Rn) approximation
    # API gives W/m2. 1 W/m2 = 0.0864 MJ/m2/day
    rn = radiation * 0.0864 * 0.77  # Net is ~77% of incoming (albedo 0.23)

    # 5. Soil Heat Flux (G) -> assumed 0 for daily steps
    g = 0

    # 6. Wind speed adjustment (if given at 120m, reduce to 2m estimate)
    wind_2m = wind_speed * 0.4  # Rough reduction factor

    # 7. The Equation
    numerator = (0.408 * delta * (rn - g)) + (gamma * (900 / (temp_mean + 273)) * wind_2m * vpd)
    denominator = delta + (gamma * (1 + 0.34 * wind_2m))

    return max(0, numerator / denominator)


# ============================================================================
# WATER BALANCE CALCULATIONS
# ============================================================================

def calculate_effective_rainfall(precipitation: float) -> float:
    """
    Calculate effective rainfall (usable water, not just total).
    Light rain evaporates, heavy rain runs off.
    """
    if precipitation is None or precipitation <= 0:
        return 0.0
    
    # USDA SCS method simplified
    if precipitation < 2:
        return precipitation * 0.3  # Light rain mostly evaporates
    elif precipitation < 10:
        return precipitation * 0.7  # Moderate rain
    elif precipitation < 30:
        return precipitation * 0.85  # Good infiltration
    else:
        return 25 + (precipitation - 30) * 0.5  # Heavy rain - runoff


def calculate_water_balance(rain: float, et0: float, soil_moisture: float) -> Dict[str, Any]:
    """
    Water Balance = Effective Rain + Soil Moisture − ET₀
    Returns irrigation need and drought stress indicators.
    """
    effective_rain = calculate_effective_rainfall(rain)
    
    # Soil moisture as proxy for available water (scaled 0-100%)
    available_water = (soil_moisture / 100) * 5  # Assume 5mm per 1% soil moisture
    
    balance = effective_rain + available_water - et0
    
    if balance > 2:
        status = "Surplus"
        irrigation_needed = False
        stress_level = 0
    elif balance > 0:
        status = "Adequate"
        irrigation_needed = False
        stress_level = 0
    elif balance > -2:
        status = "Mild Deficit"
        irrigation_needed = True
        stress_level = 1
    elif balance > -4:
        status = "Moderate Deficit"
        irrigation_needed = True
        stress_level = 2
    else:
        status = "Severe Deficit"
        irrigation_needed = True
        stress_level = 3
    
    return {
        "balance_mm": round(balance, 1),
        "effective_rain_mm": round(effective_rain, 1),
        "et0_mm": round(et0, 1),
        "status": status,
        "irrigation_needed": irrigation_needed,
        "stress_level": stress_level
    }


def classify_soil_moisture(soil_moisture: float) -> Dict[str, Any]:
    """Classify soil moisture status for root zone health"""
    if soil_moisture is None:
        return {"status": "Unknown", "level": "N/A", "risk": "none"}
    
    if soil_moisture < 20:
        return {"status": "Water Stress", "level": "Critical", "risk": "drought", "color": "red"}
    elif soil_moisture < 35:
        return {"status": "Low Moisture", "level": "Warning", "risk": "stress", "color": "orange"}
    elif soil_moisture < 60:
        return {"status": "Optimal", "level": "Healthy", "risk": "none", "color": "green"}
    elif soil_moisture < 80:
        return {"status": "High Moisture", "level": "Monitor", "risk": "minor", "color": "blue"}
    else:
        return {"status": "Excess Moisture", "level": "Warning", "risk": "root_disease", "color": "purple"}


def classify_soil_temperature(soil_temp: float, crop_name: str = "Rice") -> Dict[str, Any]:
    """Classify soil temperature impact on root activity"""
    profile = CROP_PROFILES.get(crop_name, CROP_PROFILES["Rice"])
    optimal_soil = profile.get("optimal_soil_temp", 25)
    
    if soil_temp is None:
        return {"status": "Unknown", "impact": "N/A"}
    
    diff = abs(soil_temp - optimal_soil)
    
    if diff < 3:
        return {"status": "Optimal", "impact": "Rapid growth", "temp": soil_temp}
    elif diff < 6:
        return {"status": "Acceptable", "impact": "Normal growth", "temp": soil_temp}
    elif soil_temp < optimal_soil:
        return {"status": "Cold", "impact": "Delayed growth", "temp": soil_temp}
    else:
        return {"status": "Warm", "impact": "Accelerated biomass", "temp": soil_temp}


# ============================================================================
# DISEASE & PEST RISK ASSESSMENT
# ============================================================================

def calculate_disease_risk(
    rh: float, temp_min: float, temp_max: float, 
    soil_moisture: float, wind_speed: float
) -> Dict[str, Any]:
    """
    Calculate fungal disease risk based on weather conditions.
    High risk when: RH > 85%, warm nights, wet soil + low wind
    """
    risk_score = 0
    triggers = []
    
    # Humidity factor (major driver)
    if rh is not None:
        if rh > 90:
            risk_score += 40
            triggers.append("Very high humidity (>90%)")
        elif rh > 85:
            risk_score += 30
            triggers.append("High humidity (>85%)")
        elif rh > 75:
            risk_score += 15
    
    # Warm nights (conducive to fungal growth)
    if temp_min is not None and temp_min > 18:
        risk_score += 20
        triggers.append("Warm nights encourage pathogen growth")
    
    # Wet soil with low wind (leaf wetness proxy)
    if soil_moisture is not None and soil_moisture > 60:
        if wind_speed is not None and wind_speed < 2:
            risk_score += 25
            triggers.append("High soil moisture + low wind")
        else:
            risk_score += 10
    
    # Optimal temperature range for fungi (15-25°C)
    if temp_max is not None and 15 <= temp_max <= 28:
        risk_score += 10
    
    # Classify
    if risk_score >= 60:
        level = "High"
        alert = "High disease risk - consider fungicide"
    elif risk_score >= 40:
        level = "Moderate"
        alert = "Monitor for early symptoms"
    elif risk_score >= 20:
        level = "Low"
        alert = "Conditions generally safe"
    else:
        level = "Minimal"
        alert = "Very low disease pressure"
    
    return {
        "risk_score": min(100, risk_score),
        "level": level,
        "alert": alert,
        "triggers": triggers
    }


# ============================================================================
# CROP GROWTH & PHENOLOGY
# ============================================================================

def calculate_gdd(t_max: float, t_min: float, t_base: float, t_upper: float = 40) -> float:
    """
    Calculate Growing Degree Days (GDD).
    GDD = ((Tmax + Tmin) / 2) − Tbase
    With upper cutoff for extreme heat.
    """
    if t_max is None or t_min is None:
        return 0.0
    
    # Apply cutoffs
    t_max_adj = min(t_max, t_upper)
    t_min_adj = max(t_min, t_base)
    
    t_mean = (t_max_adj + t_min_adj) / 2
    gdd = max(0, t_mean - t_base)
    
    return gdd


def determine_crop_stage(accumulated_gdd: float, crop_name: str = "Rice") -> Dict[str, Any]:
    """
    Determine crop phenological stage based on accumulated GDD.
    Returns stage name and progress percentage.
    """
    profile = CROP_PROFILES.get(crop_name, CROP_PROFILES["Rice"])
    stages = profile.get("stages", {
        "Germination": 100,
        "Vegetative": 400,
        "Flowering": 700,
        "Grain Filling": 1000,
        "Ripening": 1300
    })
    
    current_stage = "Germination"
    progress = 0
    days_to_next = 0
    next_stage = "Vegetative"
    
    stages_list = list(stages.items())
    
    for i, (stage_name, gdd_threshold) in enumerate(stages_list):
        if accumulated_gdd < gdd_threshold:
            current_stage = stage_name
            prev_threshold = stages_list[i - 1][1] if i > 0 else 0
            progress = min(100, int(((accumulated_gdd - prev_threshold) / (gdd_threshold - prev_threshold)) * 100))
            next_stage = stages_list[i + 1][0] if i + 1 < len(stages_list) else "Harvest"
            days_to_next = int((gdd_threshold - accumulated_gdd) / 15)  # Assume ~15 GDD/day
            break
    else:
        current_stage = "Ripening"
        progress = 100
        next_stage = "Harvest Ready"
        days_to_next = 0
    
    return {
        "stage": current_stage,
        "progress": progress,
        "next_stage": next_stage,
        "days_to_next": max(0, days_to_next),
        "accumulated_gdd": round(accumulated_gdd, 1)
    }


# ============================================================================
# STRESS ANALYSIS
# ============================================================================

def analyze_heat_stress(t_max: float, crop_name: str = "Rice") -> Optional[Dict[str, Any]]:
    """Analyze heat stress risk (flower sterility, grain filling reduction)"""
    profile = CROP_PROFILES.get(crop_name, CROP_PROFILES["Rice"])
    heat_threshold = profile.get("stress_thresholds", {}).get("heat", 35)
    
    if t_max is None:
        return None
    
    if t_max >= heat_threshold + 5:
        return {
            "type": "Heat Stress",
            "severity": "Critical",
            "desc": f"Extreme heat ({t_max:.0f}°C) - flower sterility risk",
            "yield_impact": -15
        }
    elif t_max >= heat_threshold:
        return {
            "type": "Heat Stress",
            "severity": "High",
            "desc": f"High temperature ({t_max:.0f}°C) - reduced grain filling",
            "yield_impact": -8
        }
    return None


def analyze_cold_stress(t_min: float, crop_name: str = "Rice") -> Optional[Dict[str, Any]]:
    """Analyze cold stress risk"""
    profile = CROP_PROFILES.get(crop_name, CROP_PROFILES["Rice"])
    cold_threshold = profile.get("stress_thresholds", {}).get("cold", 10)
    
    if t_min is None:
        return None
    
    if t_min <= cold_threshold - 5:
        return {
            "type": "Cold Stress",
            "severity": "High",
            "desc": f"Cold night ({t_min:.0f}°C) - growth halted",
            "yield_impact": -10
        }
    elif t_min <= cold_threshold:
        return {
            "type": "Cold Stress",
            "severity": "Medium",
            "desc": f"Cool night ({t_min:.0f}°C) - slowed metabolism",
            "yield_impact": -3
        }
    return None


def analyze_lodging_risk(wind_speed: float, soil_moisture: float) -> Optional[Dict[str, Any]]:
    """Analyze lodging risk (wet soil + strong wind)"""
    if wind_speed is None or soil_moisture is None:
        return None
    
    if wind_speed > 15 and soil_moisture > 70:
        return {
            "type": "Lodging Risk",
            "severity": "High",
            "desc": "Strong wind + saturated soil - high lodging probability",
            "yield_impact": -20
        }
    elif wind_speed > 10 and soil_moisture > 60:
        return {
            "type": "Lodging Risk",
            "severity": "Medium",
            "desc": "Moderate wind with wet soil - monitor crops",
            "yield_impact": -5
        }
    return None


def analyze_waterlogging(precipitation: float, soil_moisture: float) -> Optional[Dict[str, Any]]:
    """Analyze waterlogging risk (root suffocation, nutrient loss)"""
    if precipitation is None or soil_moisture is None:
        return None
    
    if precipitation > 30 and soil_moisture > 80:
        return {
            "type": "Waterlogging",
            "severity": "High",
            "desc": "Heavy rain + saturated soil - root suffocation risk",
            "yield_impact": -12
        }
    elif soil_moisture > 85:
        return {
            "type": "Waterlogging",
            "severity": "Medium",
            "desc": "Excess soil moisture - monitor drainage",
            "yield_impact": -5
        }
    return None


# ============================================================================
# YIELD ESTIMATION
# ============================================================================

def estimate_yield_modifier(
    heat_stress_days: int, cold_stress_days: int,
    drought_days: int, waterlog_days: int,
    radiation_factor: float  # 0.8-1.2 based on avg radiation
) -> Dict[str, Any]:
    """
    Estimate yield modifier based on accumulated stress factors.
    Returns a multiplier (e.g., 0.85 = 15% yield loss).
    """
    base_yield = 1.0
    
    # Apply penalties
    heat_penalty = heat_stress_days * 0.02
    cold_penalty = cold_stress_days * 0.015
    drought_penalty = drought_days * 0.03
    waterlog_penalty = waterlog_days * 0.02
    
    # Radiation bonus/penalty
    radiation_mod = (radiation_factor - 1.0) * 0.1
    
    modifier = base_yield - heat_penalty - cold_penalty - drought_penalty - waterlog_penalty + radiation_mod
    modifier = max(0.5, min(1.2, modifier))  # Clamp to reasonable range
    
    return {
        "modifier": round(modifier, 2),
        "percentage": f"{int(modifier * 100)}%",
        "classification": "High" if modifier > 0.9 else "Moderate" if modifier > 0.75 else "Low",
        "factors": {
            "heat_impact": -round(heat_penalty * 100, 1),
            "cold_impact": -round(cold_penalty * 100, 1),
            "drought_impact": -round(drought_penalty * 100, 1),
            "waterlog_impact": -round(waterlog_penalty * 100, 1),
            "radiation_impact": round(radiation_mod * 100, 1)
        }
    }


# ============================================================================
# HARVEST PREDICTION
# ============================================================================

def predict_harvest(
    accumulated_gdd: float, target_gdd: float,
    avg_daily_gdd: float, rain_forecast_days: int
) -> Dict[str, Any]:
    """Predict harvest date and readiness"""
    remaining_gdd = max(0, target_gdd - accumulated_gdd)
    
    if avg_daily_gdd > 0:
        days_to_maturity = int(remaining_gdd / avg_daily_gdd)
    else:
        days_to_maturity = 30  # Fallback
    
    harvest_date = datetime.now() + timedelta(days=days_to_maturity)
    readiness = min(100, int((accumulated_gdd / target_gdd) * 100))
    
    # Assess rain risk during harvest window
    if rain_forecast_days >= 3:
        rain_risk = "High"
    elif rain_forecast_days >= 1:
        rain_risk = "Moderate"
    else:
        rain_risk = "Low"
    
    return {
        "estimated_date": harvest_date.strftime("%Y-%m-%d"),
        "days_remaining": days_to_maturity,
        "readiness_percent": readiness,
        "rain_risk": rain_risk,
        "harvest_window": f"{days_to_maturity - 3} - {days_to_maturity + 5} days"
    }


# ============================================================================
# MAIN ANALYSIS FUNCTION
# ============================================================================

def analyze_forecast_for_crop(
    crop_name: str,
    daily_weather: List[Dict],
    hourly_weather: List[Dict],
    elevation: float
) -> Dict[str, Any]:
    """
    Process 15-day raw weather data into comprehensive agronomic insights.
    Returns both daily analysis and a seasonal summary.
    """
    profile = CROP_PROFILES.get(crop_name, CROP_PROFILES["Rice"])

    analyzed_days = []
    accumulated_gdd = 0.0
    accumulated_precip = 0.0
    
    # Stress counters for yield estimation
    heat_stress_days = 0
    cold_stress_days = 0
    drought_days = 0
    waterlog_days = 0
    total_radiation = 0
    rain_forecast_days = 0
    
    # Process each day
    for i, day in enumerate(daily_weather):
        t_max = day.get('temperature_2m_max', 30)
        t_min = day.get('temperature_2m_min', 20)
        precipitation = day.get('precipitation_sum', 0) or day.get('rain_sum', 0) or 0
        
        # Get hourly data for this day if available
        hourly_start = i * 24
        hourly_end = (i + 1) * 24
        day_hourly = hourly_weather[hourly_start:hourly_end] if hourly_weather else []
        
        # Calculate daily means from hourly data
        if day_hourly:
            rh_mean = sum(h.get('relative_humidity_2m', 65) or 65 for h in day_hourly) / len(day_hourly)
            wind_mean = sum(h.get('wind_speed_120m', 5) or 5 for h in day_hourly) / len(day_hourly)
            soil_moisture = sum(h.get('soil_moisture_27_to_81cm', 40) or 40 for h in day_hourly) / len(day_hourly)
            soil_temp = sum(h.get('soil_temperature_54cm', 22) or 22 for h in day_hourly) / len(day_hourly)
            radiation = sum(h.get('terrestrial_radiation', 500) or 500 for h in day_hourly) / len(day_hourly)
        else:
            rh_mean = 65
            wind_mean = 5
            soil_moisture = 40
            soil_temp = 22
            radiation = 500
        
        # ===== CALCULATIONS =====
        
        # 1. GDD
        t_mean = (t_max + t_min) / 2
        daily_gdd = calculate_gdd(t_max, t_min, profile['T_base'], profile['T_max'])
        accumulated_gdd += daily_gdd
        accumulated_precip += precipitation
        
        # 2. Crop Stage
        stage_info = determine_crop_stage(accumulated_gdd, crop_name)
        
        # 3. ET0 & Water Balance
        et0 = calculate_et0(t_min, t_max, t_mean, rh_mean, wind_mean, elevation, radiation)
        water_balance = calculate_water_balance(precipitation, et0, soil_moisture)
        
        # 4. VPD
        vpd = calculate_vpd(t_mean, rh_mean)
        vpd_status = classify_vpd_stress(vpd)
        
        # 5. Soil Status
        soil_status = classify_soil_moisture(soil_moisture)
        soil_temp_status = classify_soil_temperature(soil_temp, crop_name)
        
        # 6. Disease Risk
        disease_risk = calculate_disease_risk(rh_mean, t_min, t_max, soil_moisture, wind_mean)
        
        # 7. Stress Analysis
        risks = []
        
        heat_risk = analyze_heat_stress(t_max, crop_name)
        if heat_risk:
            risks.append(heat_risk)
            heat_stress_days += 1
        
        cold_risk = analyze_cold_stress(t_min, crop_name)
        if cold_risk:
            risks.append(cold_risk)
            cold_stress_days += 1
        
        lodging_risk = analyze_lodging_risk(wind_mean, soil_moisture)
        if lodging_risk:
            risks.append(lodging_risk)
        
        waterlog_risk = analyze_waterlogging(precipitation, soil_moisture)
        if waterlog_risk:
            risks.append(waterlog_risk)
            waterlog_days += 1
        
        if water_balance["stress_level"] >= 2:
            drought_days += 1
            risks.append({
                "type": "Drought Stress",
                "severity": "High" if water_balance["stress_level"] >= 3 else "Medium",
                "desc": f"Water deficit: {water_balance['balance_mm']}mm",
                "yield_impact": -5
            })
        
        # Track rain forecast
        if precipitation > 1:
            rain_forecast_days += 1
        
        total_radiation += radiation
        
        # ===== BUILD DAY RESULT =====
        analyzed_days.append({
            "day_index": i + 1,
            "date": day.get('date'),
            
            # Temperature
            "t_max": round(t_max, 1),
            "t_min": round(t_min, 1),
            "t_mean": round(t_mean, 1),
            
            # GDD & Growth
            "gdd": round(daily_gdd, 1),
            "accumulated_gdd": round(accumulated_gdd, 1),
            "crop_stage": stage_info["stage"],
            "stage_progress": stage_info["progress"],
            "days_to_next_stage": stage_info["days_to_next"],
            
            # Water
            "precipitation": round(precipitation, 1),
            "et0": round(et0, 1),
            "water_balance": water_balance,
            "soil_moisture": round(soil_moisture, 1),
            "soil_status": soil_status,
            "soil_temperature": round(soil_temp, 1),
            
            # Atmospheric
            "humidity": round(rh_mean, 1),
            "wind_speed": round(wind_mean, 1),
            "vpd": round(vpd, 2),
            "vpd_status": vpd_status,
            "radiation": round(radiation, 0),
            
            # Risks
            "disease_risk": disease_risk,
            "risks": risks,
            
            # Irrigation
            "irrigation_needed": water_balance["irrigation_needed"]
        })
    
    # ===== SEASONAL SUMMARY =====
    
    avg_daily_gdd = accumulated_gdd / len(daily_weather) if daily_weather else 15
    avg_radiation = total_radiation / len(daily_weather) if daily_weather else 500
    radiation_factor = avg_radiation / 500  # Normalize to baseline
    
    yield_estimate = estimate_yield_modifier(
        heat_stress_days, cold_stress_days,
        drought_days, waterlog_days,
        radiation_factor
    )
    
    harvest_prediction = predict_harvest(
        accumulated_gdd,
        profile.get("target_gdd", 1300),
        avg_daily_gdd,
        rain_forecast_days
    )
    
    summary = {
        "crop": crop_name,
        "analysis_period": f"{len(daily_weather)} days",
        
        # Growth Summary
        "current_stage": analyzed_days[-1]["crop_stage"] if analyzed_days else "Unknown",
        "stage_progress": analyzed_days[-1]["stage_progress"] if analyzed_days else 0,
        "total_gdd": round(accumulated_gdd, 1),
        "avg_daily_gdd": round(avg_daily_gdd, 1),
        
        # Water Summary
        "total_precipitation": round(accumulated_precip, 1),
        "irrigation_days_needed": sum(1 for d in analyzed_days if d["irrigation_needed"]),
        
        # Stress Summary
        "heat_stress_days": heat_stress_days,
        "cold_stress_days": cold_stress_days,
        "drought_stress_days": drought_days,
        "waterlog_days": waterlog_days,
        "total_risk_days": heat_stress_days + cold_stress_days + drought_days + waterlog_days,
        
        # Yield & Harvest
        "yield_estimate": yield_estimate,
        "harvest": harvest_prediction,
        
        # Recommendations
        "recommendations": generate_recommendations(analyzed_days, yield_estimate, water_balance if analyzed_days else {})
    }
    
    return {
        "daily": analyzed_days,
        "summary": summary
    }


def generate_recommendations(daily_data: List[Dict], yield_est: Dict, water_balance: Dict) -> List[str]:
    """Generate actionable recommendations based on analysis"""
    recs = []
    
    # Irrigation
    irrigation_days = sum(1 for d in daily_data if d.get("irrigation_needed"))
    if irrigation_days > 3:
        recs.append(f"💧 Irrigation needed for {irrigation_days} of the next 15 days - prepare water supply")
    elif irrigation_days > 0:
        recs.append(f"💧 Minor irrigation may be needed - monitor soil moisture")
    else:
        recs.append("✅ Rainfall should meet water requirements")
    
    # Heat stress
    heat_days = sum(1 for d in daily_data if any(r.get("type") == "Heat Stress" for r in d.get("risks", [])))
    if heat_days > 0:
        recs.append(f"🌡️ Heat stress expected on {heat_days} days - consider shade nets or mulching")
    
    # Disease risk
    high_disease_days = sum(1 for d in daily_data if d.get("disease_risk", {}).get("level") in ["High", "Moderate"])
    if high_disease_days >= 3:
        recs.append("🦠 Elevated disease pressure - apply preventive fungicide")
    elif high_disease_days > 0:
        recs.append("🦠 Monitor for early disease symptoms")
    
    # Yield
    if yield_est["modifier"] < 0.8:
        recs.append("⚠️ Yield may be significantly impacted - review stress mitigation options")
    elif yield_est["modifier"] >= 0.95:
        recs.append("🌾 Excellent growing conditions - expect good yields")
    
    return recs
