import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, CloudRain, Thermometer, Activity, Layers, ArrowRight, Bug, FileText, RefreshCw, AlertCircle, Sun, Cloud, Zap, Sparkles } from './ui/Icons';
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

// Reusable Technical Sensor Card
const SensorCard = ({ title, icon: Icon, color, delay, children, loading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/70 backdrop-blur-md rounded-xl p-5 border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-[0.03] ${color}`}>
      <Icon className="w-24 h-24 transform translate-x-6 -translate-y-6" />
    </div>

    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
      <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">{title}</h3>
      <div className={`ml-auto w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
    </div>

    <div className="space-y-4 relative z-10">
      {loading ? (
        <div className="space-y-3">
          <div className="h-5 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded animate-pulse w-2/3"></div>
        </div>
      ) : (
        children
      )}
    </div>
  </motion.div>
);

const DataRow = ({ label, value, unit, status }: any) => (
  <div className="flex items-center justify-between group">
    <span className="text-gray-500 text-xs font-medium uppercase">{label}</span>
    <div className="text-right">
      <div className="text-gray-900 font-bold text-lg leading-none">
        {value} <span className="text-xs text-gray-400 font-normal ml-0.5">{unit}</span>
      </div>
      {status && <span className="text-[10px] text-gray-400 font-medium">{status}</span>}
    </div>
  </div>
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
      {/* Header with Timestamp and Connection Status */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Field Monitoring</h2>
        </div>
        <div className="flex items-center gap-3">
          {onRefreshWeather && (
            <button
              onClick={onRefreshWeather}
              disabled={weatherLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${weatherLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isBackendConnected
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
            }`}>
            {isBackendConnected ? 'LIVE DATA' : 'DEMO MODE'}
          </span>
        </div>
      </div>

      {/* Weather Error Alert */}
      {weatherError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Failed to load weather data</p>
            <p className="text-xs opacity-80">{weatherError}</p>
          </div>
        </div>
      )}

      {/* Section 1: Real-Time Sensor Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Air & Atmosphere */}
        <SensorCard title="Atmosphere" icon={Thermometer} color="text-red-600" delay={0.1} loading={weatherLoading}>
          <DataRow label="Temperature" value={Math.round(weather.tempMax)} unit="°C" status={`Low: ${Math.round(weather.tempMin)}°C`} />
          <div className="h-px bg-gray-100 w-full"></div>
          <DataRow label="Humidity" value={Math.round(weather.humidity)} unit="%" status={weather.humidity > 70 ? 'High' : 'Optimal'} />
        </SensorCard>

        {/* Soil Health */}
        <SensorCard title="Soil Status" icon={Layers} color="text-amber-600" delay={0.2} loading={weatherLoading}>
          <DataRow label="Moisture (10cm)" value={Math.round(weather.soilMoisture * 100)} unit="%" status={weather.soilMoisture > 0.5 ? 'Good' : 'Adequate'} />
          <div className="h-px bg-gray-100 w-full"></div>
          {soilData ? (
            <DataRow label="pH Level" value={soilData.ph.toFixed(1)} unit="" status={soilData.ph > 6 && soilData.ph < 7.5 ? 'Optimal' : 'Check'} />
          ) : (
            <DataRow label="Temperature" value={Math.round(weather.tempMax - 4)} unit="°C" status="Root zone" />
          )}
        </SensorCard>

        {/* Water & Rain */}
        <SensorCard title="Hydrology" icon={CloudRain} color="text-blue-600" delay={0.3} loading={weatherLoading}>
          <DataRow label="Precipitation" value={Math.round(weather.rain)} unit="mm" status="Past 24h" />
          <div className="h-px bg-gray-100 w-full"></div>
          <DataRow label="Irrigation" value={weather.rain > 5 ? "HOLD" : "NEEDED"} unit="" status={weather.rain > 5 ? "Rain expected" : "Check schedule"} />
        </SensorCard>

        {/* Field Conditions */}
        <SensorCard title="Field Cond." icon={Activity} color="text-slate-600" delay={0.4} loading={weatherLoading}>
          <DataRow label="Wind Speed" value={Math.round(weather.windSpeed)} unit="km/h" status="NW Direction" />
          <div className="h-px bg-gray-100 w-full"></div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs font-medium uppercase">Condition</span>
            <div className="flex items-center gap-2">
              <WeatherIcon className="w-5 h-5 text-amber-500" />
              <span className="text-gray-900 font-bold">{weather.condition}</span>
            </div>
          </div>
        </SensorCard>
      </section>

      {/* Soil Nutrient Data (if available from backend) */}
      {soilData && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-sm"
          >
            <p className="text-xs text-green-700 font-bold uppercase mb-1">Nitrogen (N)</p>
            <p className="text-2xl font-bold text-green-900">{soilData.nitrogen.toFixed(2)}<span className="text-sm font-normal ml-1">%</span></p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-sm"
          >
            <p className="text-xs text-blue-700 font-bold uppercase mb-1">Phosphorus (P)</p>
            <p className="text-2xl font-bold text-blue-900">{soilData.phosphorus.toFixed(2)}<span className="text-sm font-normal ml-1">kg/ha</span></p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-sm"
          >
            <p className="text-xs text-purple-700 font-bold uppercase mb-1">Potassium (K)</p>
            <p className="text-2xl font-bold text-purple-900">{soilData.potassium.toFixed(2)}<span className="text-sm font-normal ml-1">kg/ha</span></p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-sm"
          >
            <p className="text-xs text-orange-700 font-bold uppercase mb-1">pH Level</p>
            <p className="text-2xl font-bold text-orange-900">{soilData.ph.toFixed(2)}</p>
          </motion.div>
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
