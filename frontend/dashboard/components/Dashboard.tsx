import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, CloudRain, Thermometer, Activity, Layers, ArrowRight, Bug, FileText, RefreshCw, AlertCircle, Sun, Cloud, Zap, Sparkles } from './ui/Icons';
import { CropData, WeatherData } from '../types';

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
          <p className="text-xs text-gray-500 font-mono mt-1">
            SENSOR_ID: KP-2049 • UPDATED: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
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

      {/* Section 2: Farm Summary & Forecasting System */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Column 1: Farm Summary & AI Recommendations */}
        <div className="space-y-6">
          {/* Farm Summary System */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Farm Summary</h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {isBackendConnected ? 'REAL-TIME DATA' : 'DEMO DATA'}
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                OPTIMAL
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Active Cultivation</p>
                {activeCrop ? (
                  <div>
                    <p className="text-lg font-bold text-gray-800">{activeCrop.name}</p>
                    <p className="text-xs text-gray-500">{activeCrop.area} {activeCrop.areaUnit} • {activeCrop.variety}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No active crops</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Soil Index</p>
                <p className="text-lg font-bold text-gray-800">{soilIndex.value}/10</p>
                <p className={`text-xs font-medium ${soilIndex.status === 'Nutrient Rich' ? 'text-green-600' : soilIndex.status === 'Moderate' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {soilIndex.status}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Recent Alerts & Tasks</h4>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="mt-1 bg-blue-50 p-1.5 rounded-md">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Irrigation Schedule</p>
                  <p className="text-xs text-gray-500">
                    {weather.rain > 5
                      ? 'Recommended to hold irrigation due to rain forecast.'
                      : 'Check irrigation - low rainfall detected.'
                    }
                  </p>
                </div>
                <span className="ml-auto text-xs text-gray-400 font-mono">Today</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="mt-1 bg-amber-50 p-1.5 rounded-md">
                  <Bug className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Pest Monitoring</p>
                  <p className="text-xs text-gray-500">
                    {weather.humidity > 80
                      ? 'High humidity - increased pest risk. Monitor closely.'
                      : 'Low risk of fall armyworm in this region.'
                    }
                  </p>
                </div>
                <span className="ml-auto text-xs text-gray-400 font-mono">Yesterday</span>
              </div>
            </div>

            {onAddCrop && !activeCrop && (
              <button
                onClick={onAddCrop}
                className="mt-6 w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <Leaf className="w-4 h-4" /> Add New Crop
              </button>
            )}
          </motion.div>

          {/* AI Crop Recommendation System */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-6 flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] text-agri-600">
              <Sparkles className="w-20 h-20" />
            </div>

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-agri-50 p-2.5 rounded-lg border border-agri-100">
                  <Sparkles className="w-5 h-5 text-agri-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">AI Precision Planting</h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Recommended for your soil</p>
                </div>
              </div>
              {onRefreshRecommendations && (
                <button
                  onClick={onRefreshRecommendations}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={recommendationsLoading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {recommendationsLoading ? (
                // Shimmer loading
                [1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                ))
              ) : cropRecommendations && cropRecommendations.length > 0 ? (
                cropRecommendations.map((crop, idx) => (
                  <div
                    key={crop}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm hover:scale-[1.02] cursor-default
                      ${idx === 0 ? 'bg-gradient-to-r from-agri-50 to-emerald-50 border-agri-200' : 'bg-white border-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                        ${idx === 0 ? 'bg-agri-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {idx + 1}
                      </div>
                      <span className={`font-bold ${idx === 0 ? 'text-agri-900' : 'text-gray-700'}`}>{crop}</span>
                    </div>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold bg-agri-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Best Choice
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 italic">No recommendations available</p>
                  <p className="text-[10px] text-gray-400 mt-1">Connect backend to enable AI insights</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-[10px] text-gray-400 leading-tight">
                *Predictions are based on NARC Nepal soil data and OpenMeteo weather forecasts for your specific coordinates.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Column 2: Forecasting System */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Forecasting System</h3>
                <p className="text-xs text-gray-400 font-medium">AI PREDICTIVE MODELS</p>
              </div>
            </div>
          </div>

          {/* Yield Prediction */}
          <div className="mb-6 p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
            <div className="relative z-10">
              <p className="text-indigo-100 text-xs font-bold uppercase mb-1">Estimated Yield</p>
              <div className="flex items-end gap-2 mb-2">
                <h4 className="text-3xl font-bold">
                  {weather.humidity > 60 && weather.tempMax < 35 && weather.tempMax > 15 ? 'High' : 'Moderate'}
                </h4>
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm font-medium border border-white/10">
                  {weather.humidity > 60 ? '+12%' : '+5%'} vs Avg
                </span>
              </div>
              <p className="text-xs text-indigo-100 opacity-90">
                Based on {isBackendConnected ? 'real-time' : 'simulated'} weather and soil data models.
              </p>
            </div>
            <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10 rotate-12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 font-bold uppercase mb-3">Weather Outlook</p>
              <div className="space-y-3">
                {dailyForecast && dailyForecast.length > 1 ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tomorrow</span>
                      <div className="flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-blue-500" />
                        <span className="font-bold text-gray-800">{dailyForecast[1]?.temperature_2m_max?.toFixed(0) || 22}°C</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Day After</span>
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-amber-500" />
                        <span className="font-bold text-gray-800">{dailyForecast[2]?.temperature_2m_max?.toFixed(0) || 25}°C</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tomorrow</span>
                      <div className="flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-blue-500" />
                        <span className="font-bold text-gray-800">22°C</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Friday</span>
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-amber-500" />
                        <span className="font-bold text-gray-800">25°C</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 font-bold uppercase mb-3">Disease Risk</p>
              <div className="flex flex-col items-center justify-center h-full pb-2">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${weather.humidity > 80 ? 'bg-yellow-500 w-[50%]' : 'bg-green-500 w-[20%]'}`}
                  ></div>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {weather.humidity > 80 ? 'Medium (50%)' : 'Low (20%)'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Dashboard;