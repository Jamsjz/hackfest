import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, CloudRain, Thermometer, Wind, AlertCircle, Droplets, Calendar, Zap } from '../components/ui/Icons';
import { AgriForecastDay } from '../types';

interface ForecastingWidgetProps {
    forecast: AgriForecastDay[];
    cropName: string;
}

const ForecastingWidget: React.FC<ForecastingWidgetProps> = ({ forecast, cropName }) => {
    const [dayIndex, setDayIndex] = useState(0);
    const currentDay = forecast[dayIndex];

    if (!currentDay) return null;

    // Calculate percentages for gauges
    const gddProgress = Math.min(100, (currentDay.accumulated_gdd / 2000) * 100); // 2000 assumed total
    const et0Level = Math.min(100, (currentDay.et0 / 10) * 100);

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-agri-700 to-agri-900 px-6 py-4 flex justify-between items-center text-white">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        AI Growth Simulation
                    </h3>
                    <p className="text-xs text-agri-200">Predictive analysis for {cropName}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold font-mono">Day {currentDay.day_index}</p>
                    <p className="text-xs opacity-70">{new Date(currentDay.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Timeline Slider */}
                <div className="relative pt-6 pb-2">
                    <input
                        type="range"
                        min="0"
                        max={forecast.length - 1}
                        value={dayIndex}
                        onChange={(e) => setDayIndex(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-agri-600 focus:outline-none focus:ring-4 focus:ring-agri-500/20"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                        <span>Today</span>
                        <span>+5 Days</span>
                        <span>+10 Days</span>
                        <span>+15 Days</span>
                    </div>
                    {/* Tick marks */}
                    <div className="absolute top-7 left-0 right-0 flex justify-between px-1 pointer-events-none">
                        {[...Array(forecast.length)].map((_, i) => (
                            <div key={i} className={`w-0.5 h-1 ${i % 5 === 0 ? 'bg-gray-400 h-2' : 'bg-gray-300'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Column 1: Crop Status */}
                    <motion.div
                        key={`stage-${dayIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 rounded-2xl p-5 border border-green-100 flex flex-col justify-center items-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Sun className="w-32 h-32 text-green-800" />
                        </div>
                        <div className="bg-white p-3 rounded-full shadow-sm mb-3 relative z-10">
                            <span className="text-2xl">🌱</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Growth Stage</h4>
                        <p className="text-xl font-black text-agri-800">{currentDay.crop_stage}</p>
                        <div className="mt-4 w-full">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Maturity Progress</span>
                                <span>{Math.round(gddProgress)}%</span>
                            </div>
                            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${gddProgress}%` }}
                                    className="h-full bg-green-600 rounded-full"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 text-right">Accumulated GDD: {Math.round(currentDay.accumulated_gdd)}</p>
                        </div>
                    </motion.div>

                    {/* Column 2: Water Balance */}
                    <motion.div
                        key={`water-${dayIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <CloudRain className="w-32 h-32 text-blue-800" />
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
                                <Droplets className="w-4 h-4" /> Water Balance
                            </h4>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm text-gray-600">Daily Demand (ET₀)</span>
                                <span className="text-lg font-black text-gray-800">{currentDay.et0} <span className="text-xs font-normal text-gray-500">mm</span></span>
                            </div>
                            <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${et0Level}%` }}
                                    className="h-full bg-blue-500 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="bg-white/60 rounded-xl p-3 backdrop-blur-sm">
                            {currentDay.et0 > 4 ? (
                                <div className="flex items-center gap-2 text-amber-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold">High Evaporation - Irrigate</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-green-600">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold">Moisture Stable</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Column 3: Risks & Weather */}
                    <div className="space-y-3">
                        <motion.div
                            key={`temp-${dayIndex}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between"
                        >
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Temperature</p>
                                <p className="font-mono font-bold text-gray-700">
                                    <span className="text-red-500">{Math.round(currentDay.t_max)}°</span>
                                    <span className="text-gray-300 mx-1">/</span>
                                    <span className="text-blue-500">{Math.round(currentDay.t_min)}°</span>
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                                <Thermometer className="w-5 h-5 text-orange-500" />
                            </div>
                        </motion.div>

                        <div className="h-full">
                            {currentDay.risks.length > 0 ? (
                                <div className="space-y-2">
                                    {currentDay.risks.map((risk: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className={`rounded-xl p-3 border-l-4 shadow-sm text-xs ${risk.severity === 'High' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-amber-50 border-amber-500 text-amber-700'
                                                }`}
                                        >
                                            <div className="font-bold flex items-center gap-1 mb-0.5">
                                                <AlertCircle className="w-3 h-3" /> {risk.type}
                                            </div>
                                            <div className="opacity-80">{risk.desc}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full bg-green-50 rounded-xl border border-green-100 p-4 flex flex-col items-center justify-center text-center text-green-700">
                                    <span className="text-2xl mb-1">🛡️</span>
                                    <p className="text-xs font-bold">No significant risks</p>
                                    <p className="text-[10px] opacity-70">Conditions optimal for growth</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForecastingWidget;