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

export interface AgriForecastDay {
  day_index: number;
  date: string;
  gdd: number;
  accumulated_gdd: number;
  crop_stage: string;
  risks: Array<{ type: string; severity: string; desc: string }>;
  t_max: number;
  t_min: number;
  et0: number;
}

export interface WeatherData {
  tempMax: number;
  tempMin: number;
  humidity: number;
  rain: number;
  windSpeed: number;
  soilMoisture: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy';
  agriForecast?: AgriForecastDay[]; // New field
  dailyData?: any[]; // Keep existing daily support
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