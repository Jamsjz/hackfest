import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, CloudRain, Thermometer, Activity, Layers, ArrowRight, Bug, FileText, RefreshCw, AlertCircle, Sun, Cloud, Zap, Sparkles, TrendingUp, Droplets, Wind } from './ui/Icons';
import { CropData, WeatherData } from '../types';
import ForecastingWidget from './ForecastingWidget';
import ForecastingHub from './ForecastingHub';


interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface DailyForecast {
  date: string;
  temperature_2m_max: number;
  temperature_2m_min: number;
}

interface DashboardProps {
  weather: WeatherData;
  activeCrop?: CropData;
  onAddCrop?: () => void;
  weatherLoading?: boolean;
  weatherError?: string | null;
  onRefreshWeather?: () => void;
  isBackendConnected?: boolean;
  soilData?: SoilData;
  dailyForecast?: DailyForecast[];
  cropRecommendations?: string[];
  recommendationsLoading?: boolean;
  onRefreshRecommendations?: () => void;
}

// Dark Mode Sensor Card Component with solid colored icon squares
const SensorCard = ({ title, icon: Icon, iconBgColor, delay, children, loading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card-dark p-5 relative overflow-hidden group"
  >
    <div className="flex items-center gap-3 mb-5 relative z-10">
      {/* Solid colored rounded square icon - matches reference image */}
      <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider">{title}</h3>
      <div className={`ml-auto w-2 h-2 rounded-full ${loading ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></div>
    </div>

    <div className="space-y-3 relative z-10">
      {loading ? (
        <div className="space-y-3">
          <div className="h-5 bg-zinc-800/50 rounded-lg animate-pulse shimmer-dark"></div>
          <div className="h-5 bg-zinc-800/50 rounded-lg animate-pulse shimmer-dark w-2/3"></div>
        </div>
      ) : (
        children
      )}
    </div>
  </motion.div>
);

const DataRow = ({ label, value, unit, status }: any) => (
  <div className="flex items-center justify-between group">
    <span className="text-zinc-500 text-xs font-medium uppercase tracking-wide">{label}</span>
    <div className="text-right">
      <div className="text-white font-bold text-lg leading-none">
        {value} <span className="text-xs text-zinc-500 font-normal ml-0.5">{unit}</span>
      </div>
      {status && <span className="text-[10px] text-zinc-600 font-medium">{status}</span>}
    </div>
  </div>
);

// Stat Card for Nutrient Display
const NutrientCard = ({ label, value, unit, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card-dark p-4 text-center relative overflow-hidden"
  >
    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-10 ${color}`}></div>
    <p className={`text-xs font-bold uppercase mb-2 ${color.replace('bg-', 'text-')}`}>{label}</p>
    <p className="text-2xl font-bold text-white">
      {value}<span className="text-sm text-zinc-500 font-normal ml-1">{unit}</span>
    </p>
  </motion.div>
);

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'Sunny': return Sun;
    case 'Cloudy': return Cloud;
    case 'Rainy': return CloudRain;
    case 'Stormy': return Zap;
    default: return Sun;
  }
};

const Dashboard: React.FC<DashboardProps> = ({
  weather,
  activeCrop,
  onAddCrop,
  weatherLoading = false,
  weatherError = null,
  onRefreshWeather,
  isBackendConnected = false,
  soilData,
  dailyForecast,
  cropRecommendations = [],
  recommendationsLoading = false,
  onRefreshRecommendations
}) => {
  const WeatherIcon = getWeatherIcon(weather.condition);

  // Calculate soil health index from NPK and pH
  const calculateSoilIndex = () => {
    if (!soilData) return { value: 'N/A', status: 'No data' };

    const phScore = soilData.ph >= 6 && soilData.ph <= 7.5 ? 10 : 6;
    const nScore = soilData.nitrogen > 0.1 ? 10 : 5;
    const pScore = soilData.phosphorus > 20 ? 10 : 5;
    const kScore = soilData.potassium > 100 ? 10 : 5;

    const avgScore = (phScore + nScore + pScore + kScore) / 4;
    const status = avgScore > 8 ? 'Nutrient Rich' : avgScore > 6 ? 'Moderate' : 'Needs Improvement';

    return { value: avgScore.toFixed(1), status };
  };

  const soilIndex = calculateSoilIndex();

  return (
    <div className="space-y-6 pb-24">
      {/* Header Section */}
      <div className="flex justify-between items-end pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Field Monitoring</h2>
          <p className="text-zinc-500 text-sm mt-1">Real-time sensor data from your farm</p>
        </div>
        <div className="flex items-center gap-3">
          {onRefreshWeather && (
            <button
              onClick={onRefreshWeather}
              disabled={weatherLoading}
              className="btn-ghost-dark p-2.5 rounded-xl disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <span className={`badge-dark text-xs font-bold px-3 py-1.5 ${isBackendConnected ? 'badge-success-dark' : 'badge-warning-dark'
            }`}>
            {isBackendConnected ? '● LIVE DATA' : '○ DEMO MODE'}
          </span>
        </div>
      </div>

      {/* Weather Error Alert */}
      {weatherError && (
        <div className="glass-card-dark p-4 flex items-center gap-3 text-red-400 border-red-500/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Failed to load weather data</p>
            <p className="text-xs text-zinc-500">{weatherError}</p>
          </div>
        </div>
      )}

      {/* Section 1: Real-Time Sensor Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Air & Atmosphere */}
        <SensorCard title="Atmosphere" icon={Thermometer} iconBgColor="bg-gradient-to-br from-orange-500 to-red-500" delay={0.1} loading={weatherLoading}>
          <DataRow label="Temperature" value={Math.round(weather.tempMax)} unit="°C" status={`Low: ${Math.round(weather.tempMin)}°C`} />
          <div className="divider-dark my-3"></div>
          <DataRow label="Humidity" value={Math.round(weather.humidity)} unit="%" status={weather.humidity > 70 ? 'High' : 'Optimal'} />
        </SensorCard>

        {/* Soil Health */}
        <SensorCard title="Soil Status" icon={Layers} iconBgColor="bg-gradient-to-br from-amber-500 to-orange-500" delay={0.2} loading={weatherLoading}>
          <DataRow label="Moisture (10cm)" value={Math.round(weather.soilMoisture * 100)} unit="%" status={weather.soilMoisture > 0.5 ? 'Good' : 'Adequate'} />
          <div className="divider-dark my-3"></div>
          {soilData ? (
            <DataRow label="pH Level" value={soilData.ph.toFixed(1)} unit="" status={soilData.ph > 6 && soilData.ph < 7.5 ? 'Optimal' : 'Check'} />
          ) : (
            <DataRow label="Temperature" value={Math.round(weather.tempMax - 4)} unit="°C" status="Root zone" />
          )}
        </SensorCard>

        {/* Water & Rain */}
        <SensorCard title="Hydrology" icon={Droplets} iconBgColor="bg-gradient-to-br from-blue-500 to-cyan-500" delay={0.3} loading={weatherLoading}>
          <DataRow label="Precipitation" value={Math.round(weather.rain)} unit="mm" status="Past 24h" />
          <div className="divider-dark my-3"></div>
          <DataRow label="Irrigation" value={weather.rain > 5 ? "HOLD" : "NEEDED"} unit="" status={weather.rain > 5 ? "Rain expected" : "Check schedule"} />
        </SensorCard>

        {/* Field Conditions */}
        <SensorCard title="Field Cond." icon={Wind} iconBgColor="bg-gradient-to-br from-slate-500 to-zinc-600" delay={0.4} loading={weatherLoading}>
          <DataRow label="Wind Speed" value={Math.round(weather.windSpeed)} unit="km/h" status="NW Direction" />
          <div className="divider-dark my-3"></div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wide">Condition</span>
            <div className="flex items-center gap-2">
              <WeatherIcon className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold">{weather.condition}</span>
            </div>
          </div>
        </SensorCard>
      </section>

      {/* Soil Nutrient Data (if available from backend) */}
      {soilData && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NutrientCard label="Nitrogen (N)" value={soilData.nitrogen.toFixed(2)} unit="%" color="bg-emerald-500" delay={0.5} />
          <NutrientCard label="Phosphorus (P)" value={soilData.phosphorus.toFixed(2)} unit="kg/ha" color="bg-blue-500" delay={0.55} />
          <NutrientCard label="Potassium (K)" value={soilData.potassium.toFixed(2)} unit="kg/ha" color="bg-purple-500" delay={0.6} />
          <NutrientCard label="pH Level" value={soilData.ph.toFixed(2)} unit="" color="bg-orange-500" delay={0.65} />
        </section>
      )}

      {/* Section 3: Full-Width Forecasting Hub */}
      {weather.agriForecast && weather.agriForecast.daily && weather.agriForecast.daily.length > 0 && (
        <section className="space-y-6">
          <ForecastingHub
            forecast={weather.agriForecast}
            cropName={activeCrop?.name || "Rice"}
            activeCrop={activeCrop}
            cropRecommendations={cropRecommendations}
            recommendationsLoading={recommendationsLoading}
            onRefreshRecommendations={onRefreshRecommendations}
            soilData={soilData}
            isBackendConnected={isBackendConnected}
            onAddCrop={onAddCrop}
          />
        </section>
      )}
    </div>
  );
};

export default Dashboard;