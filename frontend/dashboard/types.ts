export interface CropData {
  id: string;
  name: string;
  variety: string;
  plantingDate: string;
  area: number;
  areaUnit: 'hectare' | 'acre' | 'ropani' | 'bigha';
  irrigationType: 'rainfed' | 'drip' | 'sprinkler' | 'flood';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface UserProfile {
  username: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Water Balance Analysis
export interface WaterBalance {
  balance_mm: number;
  effective_rain_mm: number;
  et0_mm: number;
  status: string;
  irrigation_needed: boolean;
  stress_level: number;
}

// VPD Status
export interface VPDStatus {
  level: string;
  status: string;
  color: string;
}

// Soil Status
export interface SoilStatus {
  status: string;
  level: string;
  risk: string;
  color?: string;
}

// Disease Risk
export interface DiseaseRisk {
  risk_score: number;
  level: string;
  alert: string;
  triggers: string[];
}

// Risk Event
export interface RiskEvent {
  type: string;
  severity: string;
  desc: string;
  yield_impact?: number;
}

// Daily Agronomic Forecast
export interface AgriForecastDay {
  day_index: number;
  date: string;

  // Temperature
  t_max: number;
  t_min: number;
  t_mean: number;

  // GDD & Growth
  gdd: number;
  accumulated_gdd: number;
  crop_stage: string;
  stage_progress: number;
  days_to_next_stage: number;

  // Water
  precipitation: number;
  et0: number;
  water_balance: WaterBalance;
  soil_moisture: number;
  soil_status: SoilStatus;
  soil_temperature: number;

  // Atmospheric
  humidity: number;
  wind_speed: number;
  vpd: number;
  vpd_status: VPDStatus;
  radiation: number;

  // Risks
  disease_risk: DiseaseRisk;
  risks: RiskEvent[];
  irrigation_needed: boolean;
}

// Yield Estimation
export interface YieldEstimate {
  modifier: number;
  percentage: string;
  classification: string;
  factors: {
    heat_impact: number;
    cold_impact: number;
    drought_impact: number;
    waterlog_impact: number;
    radiation_impact: number;
  };
}

// Harvest Prediction
export interface HarvestPrediction {
  estimated_date: string;
  days_remaining: number;
  readiness_percent: number;
  rain_risk: string;
  harvest_window: string;
}

// Full Agronomic Summary
export interface AgriForecastSummary {
  crop: string;
  analysis_period: string;

  // Growth
  current_stage: string;
  stage_progress: number;
  total_gdd: number;
  avg_daily_gdd: number;

  // Water
  total_precipitation: number;
  irrigation_days_needed: number;

  // Stress
  heat_stress_days: number;
  cold_stress_days: number;
  drought_stress_days: number;
  waterlog_days: number;
  total_risk_days: number;

  // Yield & Harvest
  yield_estimate: YieldEstimate;
  harvest: HarvestPrediction;

  // Recommendations
  recommendations: string[];
}

// Complete Agronomic Forecast Response
export interface AgriForecast {
  daily: AgriForecastDay[];
  summary: AgriForecastSummary;
}

export interface WeatherData {
  tempMax: number;
  tempMin: number;
  humidity: number;
  rain: number;
  windSpeed: number;
  soilMoisture: number;
  soilTemperature?: number;
  solarRadiation?: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy';
  agriForecast?: AgriForecast;
  dailyData?: any[];
  hourlyData?: any[];
  soilData?: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CROP_WIZARD = 'CROP_WIZARD',
  DISEASE_DETECT = 'DISEASE_DETECT',
  SOIL_TEST = 'SOIL_TEST',
  REPORTS = 'REPORTS'
}

export interface AnalysisResult {
  title: string;
  confidence: number;
  description: string;
  recommendation: string;
  type: 'disease' | 'soil';
}