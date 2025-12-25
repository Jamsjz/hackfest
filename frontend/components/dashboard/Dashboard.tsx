import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, CloudRain, Thermometer, Activity, Layers, ArrowRight, Bug, FileText } from './ui/Icons';
import { CropData, WeatherData } from '../../lib/dashboard-types';

interface DashboardProps {
    weather: WeatherData;
    activeCrop?: CropData;
    onAddCrop?: () => void;
}

// Reusable Technical Sensor Card
const SensorCard = ({ title, icon: Icon, color, delay, children }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-xl p-5 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-[0.03] ${color}`}>
            <Icon className="w-24 h-24 transform translate-x-6 -translate-y-6" />
        </div>

        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
            <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">{title}</h3>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>

        <div className="space-y-4 relative z-10">
            {children}
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

const Dashboard: React.FC<DashboardProps> = ({ weather, activeCrop, onAddCrop }) => {
    return (
        <div className="space-y-6 pb-24">
            {/* Header with Timestamp */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Field Monitoring</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                        SENSOR_ID: KP-2049 • UPDATED: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                        SYSTEM NORMAL
                    </span>
                </div>
            </div>

            {/* Section 1: Real-Time Sensor Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Air & Atmosphere */}
                <SensorCard title="Atmosphere" icon={Thermometer} color="text-red-600" delay={0.1}>
                    <DataRow label="Temperature" value={weather.tempMax} unit="°C" status={`Low: ${weather.tempMin}°C`} />
                    <div className="h-px bg-gray-100 w-full"></div>
                    <DataRow label="Humidity" value={weather.humidity} unit="%" status="Optimal range" />
                </SensorCard>

                {/* Soil Health */}
                <SensorCard title="Soil Status" icon={Layers} color="text-amber-600" delay={0.2}>
                    <DataRow label="Moisture (10cm)" value={weather.soilMoisture} unit="%" status="Adequate" />
                    <div className="h-px bg-gray-100 w-full"></div>
                    <DataRow label="Temperature" value={weather.tempMax - 4} unit="°C" status="Root zone" />
                </SensorCard>

                {/* Water & Rain */}
                <SensorCard title="Hydrology" icon={CloudRain} color="text-blue-600" delay={0.3}>
                    <DataRow label="Precipitation" value={weather.rain} unit="mm" status="Past 24h" />
                    <div className="h-px bg-gray-100 w-full"></div>
                    <DataRow label="Irrigation" value="OFF" unit="" status="Next: Tomorrow" />
                </SensorCard>

                {/* Field Conditions */}
                <SensorCard title="Field Cond." icon={Activity} color="text-slate-600" delay={0.4}>
                    <DataRow label="Wind Speed" value={weather.windSpeed} unit="km/h" status="NW Direction" />
                    <div className="h-px bg-gray-100 w-full"></div>
                    <DataRow label="Solar Rad." value="High" unit="" status="UV Index: 6" />
                </SensorCard>
            </section>

            {/* Section 2: Farm Summary & Forecasting System */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Farm Summary System */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                                <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Farm Summary</h3>
                                <p className="text-xs text-gray-400 font-medium">REAL-TIME OVERVIEW</p>
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
                            <p className="text-lg font-bold text-gray-800">8.4/10</p>
                            <p className="text-xs text-green-600 font-medium">Nutrient Rich</p>
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
                                <p className="text-xs text-gray-500">Recommended to hold irrigation due to rain forecast.</p>
                            </div>
                            <span className="ml-auto text-xs text-gray-400 font-mono">Today</span>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="mt-1 bg-amber-50 p-1.5 rounded-md">
                                <Bug className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Pest Monitoring</p>
                                <p className="text-xs text-gray-500">Low risk of fall armyworm in this region.</p>
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

                {/* Forecasting System */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col"
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
                                <h4 className="text-3xl font-bold">High</h4>
                                <span className="text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm font-medium border border-white/10">+12% vs Avg</span>
                            </div>
                            <p className="text-xs text-indigo-100 opacity-90">Based on current weather and soil data models.</p>
                        </div>
                        <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10 rotate-12" />
                    </div>

                    {/* Weather & Disease Forecast */}
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-3">Weather Outlook</p>
                            <div className="space-y-3">
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
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-3">Disease Risk</p>

                            <div className="flex flex-col items-center justify-center h-full pb-2">
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div className="bg-green-500 h-2 rounded-full w-[20%]"></div>
                                </div>
                                <p className="text-sm font-bold text-gray-700">Low (20%)</p>
                                <p className="text-[10px] text-gray-400 text-center leading-tight mt-1">Fungal infection probability</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button className="w-full py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                            View Full Forecast Report <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                </motion.div>
            </section>
        </div>
    );
};

export default Dashboard;
