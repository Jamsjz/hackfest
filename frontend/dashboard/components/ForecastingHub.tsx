import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudRain, Thermometer, Wind, AlertCircle, Droplets, Zap, Leaf, Activity, Bug, RefreshCw, Sparkles, Layers, Cloud, FileText } from './ui/Icons';
import { AgriForecast, CropData, AgriForecastDay } from '../types';

interface ForecastingHubProps {
    forecast: AgriForecast;
    cropName: string;
    activeCrop?: CropData;
    cropRecommendations?: string[];
    recommendationsLoading?: boolean;
    onRefreshRecommendations?: () => void;
    soilData?: { ph: number; nitrogen: number; phosphorus: number; potassium: number };
    isBackendConnected?: boolean;
    onAddCrop?: () => void;
}

const ForecastingHub: React.FC<ForecastingHubProps> = ({
    forecast,
    cropName,
    activeCrop,
    cropRecommendations,
    recommendationsLoading,
    onRefreshRecommendations,
    soilData,
    isBackendConnected = true,
    onAddCrop
}) => {
    const [dayIndex, setDayIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'simulation' | 'summary' | 'recommendations'>('simulation');

    const currentDay = forecast.daily?.[dayIndex];
    const fullSummary = forecast.summary;

    // Calculate DYNAMIC summary based on selected day (cumulative up to dayIndex)
    const dynamicSummary = useMemo(() => {
        if (!forecast.daily || dayIndex < 0) return null;

        const daysToAnalyze = forecast.daily.slice(0, dayIndex + 1);
        const totalDays = daysToAnalyze.length;

        // Calculate cumulative stats
        let totalGdd = 0;
        let totalPrecipitation = 0;
        let heatStressDays = 0;
        let coldStressDays = 0;
        let droughtStressDays = 0;
        let waterlogDays = 0;
        let irrigationDaysNeeded = 0;

        daysToAnalyze.forEach((day: AgriForecastDay) => {
            totalGdd += day.gdd || 0;
            totalPrecipitation += day.precipitation || 0;

            // Count stress days
            if (day.risks) {
                day.risks.forEach(risk => {
                    if (risk.type === 'Heat Stress') heatStressDays++;
                    if (risk.type === 'Cold Stress') coldStressDays++;
                    if (risk.type === 'Drought Stress') droughtStressDays++;
                    if (risk.type === 'Waterlogging') waterlogDays++;
                });
            }

            if (day.irrigation_needed) irrigationDaysNeeded++;
        });

        // Calculate yield estimate based on stress
        const totalStressDays = heatStressDays + coldStressDays + droughtStressDays + waterlogDays;
        const stressRatio = totalStressDays / Math.max(totalDays, 1);
        let yieldClassification: string;
        let yieldPercentage: string;

        if (stressRatio < 0.1) {
            yieldClassification = 'Excellent';
            yieldPercentage = '95%';
        } else if (stressRatio < 0.2) {
            yieldClassification = 'Good';
            yieldPercentage = '85%';
        } else if (stressRatio < 0.35) {
            yieldClassification = 'Moderate';
            yieldPercentage = '70%';
        } else {
            yieldClassification = 'At Risk';
            yieldPercentage = '55%';
        }

        // Estimate harvest based on GDD progress
        const targetGdd = 1400; // Default for rice
        const gddProgress = Math.min(100, (totalGdd / targetGdd) * 100);
        const remainingGdd = targetGdd - totalGdd;
        const avgDailyGdd = totalGdd / Math.max(totalDays, 1);
        const estimatedDaysRemaining = avgDailyGdd > 0 ? Math.ceil(remainingGdd / avgDailyGdd) : 999;

        // Generate dynamic recommendations based on current conditions
        const recommendations: string[] = [];

        if (irrigationDaysNeeded > 0) {
            recommendations.push(`💧 Irrigation needed for ${irrigationDaysNeeded} of the next ${totalDays} days - prepare water supply`);
        } else {
            recommendations.push(`✅ Sufficient rainfall expected for the next ${totalDays} days`);
        }

        if (heatStressDays > 0) {
            recommendations.push(`🌡️ ${heatStressDays} heat stress day${heatStressDays > 1 ? 's' : ''} detected - consider shade protection`);
        }

        if (droughtStressDays > 0) {
            recommendations.push(`🏜️ ${droughtStressDays} drought stress day${droughtStressDays > 1 ? 's' : ''} ahead - increase irrigation frequency`);
        }

        if (totalStressDays > 3) {
            recommendations.push(`⚠️ Yield may be impacted - review mitigation options`);
        } else if (totalStressDays === 0) {
            recommendations.push(`🌱 Excellent growing conditions - optimal yield expected`);
        }

        return {
            total_gdd: totalGdd,
            avg_daily_gdd: avgDailyGdd,
            total_precipitation: totalPrecipitation,
            heat_stress_days: heatStressDays,
            cold_stress_days: coldStressDays,
            drought_stress_days: droughtStressDays,
            waterlog_days: waterlogDays,
            irrigation_days_needed: irrigationDaysNeeded,
            total_risk_days: totalStressDays,
            analysis_period: `${totalDays} days`,
            current_stage: currentDay?.crop_stage || 'Unknown',
            stage_progress: currentDay?.stage_progress || 0,
            yield_estimate: {
                classification: yieldClassification,
                percentage: yieldPercentage,
            },
            harvest: {
                days_remaining: estimatedDaysRemaining,
                readiness_percent: gddProgress,
                harvest_window: gddProgress > 80 ? 'Near' : gddProgress > 50 ? 'Mid-Season' : 'Early Season',
                rain_risk: irrigationDaysNeeded < totalDays / 2 ? 'Low' : 'Moderate'
            },
            recommendations
        };
    }, [forecast.daily, dayIndex, currentDay]);

    if (!currentDay || !dynamicSummary) return null;

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-5 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <h2 className="text-xl font-black uppercase tracking-wide">AI Forecasting Hub</h2>
                        </div>
                        <p className="text-indigo-200 text-sm">Precision Agriculture • {dayIndex + 1}-Day Forecast • {cropName}</p>
                    </div>
                    <div className="text-right">
                        <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm mb-2">
                            {isBackendConnected ? '🟢 LIVE' : '🟡 DEMO'}
                        </div>
                        <p className="text-2xl font-bold font-mono">Day {currentDay.day_index}</p>
                        <p className="text-xs text-indigo-200">{new Date(currentDay.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mt-4">
                    {(['simulation', 'summary', 'recommendations'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-indigo-700' : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            {tab === 'simulation' && '🌱 Simulation'}
                            {tab === 'summary' && '📊 Summary'}
                            {tab === 'recommendations' && '💡 Insights'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Time Travel Slider - Shared across all tabs */}
            <div className="px-6 pt-6 pb-2 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">📅 Forecast Range</span>
                    <span className="text-sm text-gray-500 font-medium">Showing data up to Day {dayIndex + 1}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={forecast.daily.length - 1}
                    value={dayIndex}
                    onChange={(e) => setDayIndex(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-gray-400 mt-1 uppercase">
                    <span>Today</span>
                    <span>+5 Days</span>
                    <span>+10 Days</span>
                    <span>+15 Days</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* SIMULATION TAB */}
                {activeTab === 'simulation' && (
                    <motion.div key={`simulation-${dayIndex}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6">
                        {/* Main Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Growth Stage Card */}
                            <motion.div key={`stage-${dayIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border border-green-200">
                                <div className="text-center">
                                    <span className="text-4xl mb-2 block">🌱</span>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Growth Stage</h4>
                                    <p className="text-lg font-black text-green-800">{currentDay.crop_stage}</p>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{currentDay.stage_progress}%</span>
                                        </div>
                                        <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${currentDay.stage_progress}%` }} className="h-full bg-green-600 rounded-full" />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Next: {currentDay.days_to_next_stage} days</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Temperature Card */}
                            <motion.div key={`temp-${dayIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-5 border border-orange-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Thermometer className="w-5 h-5 text-orange-600" />
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Temperature</h4>
                                </div>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-3xl font-black text-red-600">{currentDay.t_max.toFixed(0)}°</span>
                                    <span className="text-lg font-bold text-blue-500 mb-1">/ {currentDay.t_min.toFixed(0)}°</span>
                                </div>
                                <p className="text-xs text-gray-500">GDD Today: <span className="font-bold text-green-600">+{currentDay.gdd.toFixed(1)}</span></p>
                                <p className="text-xs text-gray-400 mt-1">Accumulated: {currentDay.accumulated_gdd.toFixed(0)} GDD</p>
                            </motion.div>

                            {/* Water Balance Card */}
                            <motion.div key={`water-${dayIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-5 border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Droplets className="w-5 h-5 text-blue-600" />
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Water Balance</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">ET₀ Demand</span>
                                        <span className="font-bold text-blue-700">{currentDay.et0.toFixed(1)} mm</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Rain</span>
                                        <span className="font-bold text-cyan-600">{currentDay.precipitation.toFixed(1)} mm</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Balance</span>
                                        <span className={`font-bold ${currentDay.water_balance.balance_mm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {currentDay.water_balance.balance_mm > 0 ? '+' : ''}{currentDay.water_balance.balance_mm} mm
                                        </span>
                                    </div>
                                </div>
                                {currentDay.irrigation_needed && (
                                    <div className="mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded text-center">
                                        💧 IRRIGATION NEEDED
                                    </div>
                                )}
                            </motion.div>

                            {/* Stress & Risks Card */}
                            <motion.div key={`risk-${dayIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="w-5 h-5 text-gray-600" />
                                    <h4 className="text-xs font-bold text-gray-500 uppercase">Risks</h4>
                                </div>
                                {currentDay.risks.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentDay.risks.slice(0, 2).map((risk, i) => (
                                            <div key={i} className={`p-2 rounded-lg border-l-4 text-xs ${risk.severity === 'Critical' || risk.severity === 'High' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-amber-50 border-amber-500 text-amber-700'}`}>
                                                <span className="font-bold">{risk.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <span className="text-2xl">🛡️</span>
                                        <p className="text-xs font-bold text-green-600 mt-1">No Risks</p>
                                    </div>
                                )}
                                <div className="mt-3 p-2 bg-white rounded-lg">
                                    <p className="text-xs text-gray-500">Disease Risk</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                                            <div className={`h-full rounded-full ${currentDay.disease_risk.level === 'High' ? 'bg-red-500' : currentDay.disease_risk.level === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${currentDay.disease_risk.risk_score}%` }} />
                                        </div>
                                        <span className="text-xs font-bold">{currentDay.disease_risk.level}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Detailed Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
                            <MetricPill label="VPD" value={`${(currentDay.vpd ?? 0).toFixed(2)} kPa`} status={currentDay.vpd_status?.status || 'N/A'} />
                            <MetricPill label="Humidity" value={`${(currentDay.humidity ?? 0).toFixed(0)}%`} status={(currentDay.humidity ?? 0) > 80 ? 'High' : 'Normal'} />
                            <MetricPill label="Wind" value={`${(currentDay.wind_speed ?? 0).toFixed(1)} m/s`} status={(currentDay.wind_speed ?? 0) > 10 ? 'Strong' : 'Calm'} />
                            <MetricPill label="Soil Moisture" value={`${(currentDay.soil_moisture ?? 0).toFixed(0)}%`} status={currentDay.soil_status?.status || 'N/A'} />
                            <MetricPill label="Soil Temp" value={`${(currentDay.soil_temperature ?? 0).toFixed(1)}°C`} status="Root Zone" />
                            <MetricPill label="Radiation" value={`${(currentDay.radiation ?? 0).toFixed(0)} W/m²`} status={(currentDay.radiation ?? 0) > 600 ? 'High' : 'Normal'} />
                        </div>
                    </motion.div>
                )}

                {/* SUMMARY TAB - Now dynamic based on dayIndex */}
                {activeTab === 'summary' && (
                    <motion.div key={`summary-${dayIndex}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Yield Prediction */}
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-purple-200 text-xs font-bold uppercase mb-2">Estimated Yield (Day 1-{dayIndex + 1})</h4>
                                    <p className="text-4xl font-black mb-1">{dynamicSummary.yield_estimate.classification}</p>
                                    <p className="text-lg font-bold text-purple-200">{dynamicSummary.yield_estimate.percentage} of Potential</p>
                                </div>
                                <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
                            </div>

                            {/* Harvest Prediction */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200">
                                <h4 className="text-amber-800 text-xs font-bold uppercase mb-3">🌾 Harvest Forecast</h4>
                                <p className="text-3xl font-black text-amber-900 mb-1">{dynamicSummary.harvest.days_remaining} Days</p>
                                <p className="text-sm text-amber-700">Phase: {dynamicSummary.harvest.harvest_window}</p>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>GDD Progress</span>
                                        <span>{dynamicSummary.harvest.readiness_percent.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dynamicSummary.harvest.readiness_percent}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Stress Summary - Dynamic */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <h4 className="text-gray-600 text-xs font-bold uppercase mb-4">{dayIndex + 1}-Day Stress Summary</h4>
                                <div className="space-y-3">
                                    <StressMeter label="Heat Stress" days={dynamicSummary.heat_stress_days} max={dayIndex + 1} />
                                    <StressMeter label="Cold Stress" days={dynamicSummary.cold_stress_days} max={dayIndex + 1} />
                                    <StressMeter label="Drought" days={dynamicSummary.drought_stress_days} max={dayIndex + 1} />
                                    <StressMeter label="Waterlog" days={dynamicSummary.waterlog_days} max={dayIndex + 1} />
                                </div>
                            </div>
                        </div>

                        {/* Growth & Water Summary - Dynamic */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <SummaryCard icon="🌱" label="Current Stage" value={dynamicSummary.current_stage} sub={`${dynamicSummary.stage_progress}% complete`} />
                            <SummaryCard icon="🌡️" label="Total GDD" value={dynamicSummary.total_gdd.toFixed(0)} sub={`Avg: ${dynamicSummary.avg_daily_gdd.toFixed(1)}/day`} />
                            <SummaryCard icon="🌧️" label="Total Rain" value={`${dynamicSummary.total_precipitation.toFixed(0)} mm`} sub={`${dayIndex + 1}-day total`} />
                            <SummaryCard icon="💧" label="Irrigation Days" value={dynamicSummary.irrigation_days_needed.toString()} sub={`of ${dayIndex + 1} days`} />
                        </div>
                    </motion.div>
                )}

                {/* RECOMMENDATIONS TAB - Now dynamic based on dayIndex */}
                {activeTab === 'recommendations' && (
                    <motion.div key={`recommendations-${dayIndex}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6">
                        {/* Row 1: Farm Summary + Crop Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Farm Summary Card - Dynamic */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                        <h4 className="font-bold text-gray-800">Farm Summary</h4>
                                    </div>
                                    <div className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                                        Day {dayIndex + 1} Outlook
                                    </div>
                                </div>

                                {/* Active Crop & Stage */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Active Crop</p>
                                        {activeCrop ? (
                                            <div>
                                                <p className="text-lg font-bold text-gray-800">{activeCrop.name}</p>
                                                <p className="text-xs text-gray-500">{activeCrop.area} {activeCrop.areaUnit}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No active crops</p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Stage on Day {dayIndex + 1}</p>
                                        <p className="text-lg font-bold text-gray-800">{dynamicSummary.current_stage}</p>
                                        <p className="text-xs text-green-600 font-medium">{dynamicSummary.stage_progress}% complete</p>
                                    </div>
                                </div>

                                {/* Dynamic Alerts & Tasks */}
                                <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Alerts for Next {dayIndex + 1} Days</h5>
                                <div className="space-y-2">
                                    <div className={`flex items-start gap-2 p-2 rounded-lg ${dynamicSummary.irrigation_days_needed > 0 ? 'bg-amber-50 border border-amber-100' : 'bg-green-50 border border-green-100'}`}>
                                        <CloudRain className={`w-4 h-4 mt-0.5 ${dynamicSummary.irrigation_days_needed > 0 ? 'text-amber-500' : 'text-green-500'}`} />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700">Irrigation</p>
                                            <p className="text-xs text-gray-500">
                                                {dynamicSummary.irrigation_days_needed > 0
                                                    ? `${dynamicSummary.irrigation_days_needed} day${dynamicSummary.irrigation_days_needed > 1 ? 's' : ''} need irrigation`
                                                    : 'Sufficient rainfall expected'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-start gap-2 p-2 rounded-lg ${dynamicSummary.total_risk_days > 2 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                                        <Bug className={`w-4 h-4 mt-0.5 ${dynamicSummary.total_risk_days > 2 ? 'text-red-500' : 'text-green-500'}`} />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700">Stress Risk</p>
                                            <p className="text-xs text-gray-500">
                                                {dynamicSummary.total_risk_days > 2
                                                    ? `${dynamicSummary.total_risk_days} stress days detected`
                                                    : 'Conditions favorable'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {onAddCrop && !activeCrop && (
                                    <button
                                        onClick={onAddCrop}
                                        className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <Leaf className="w-4 h-4" /> Add New Crop
                                    </button>
                                )}
                            </div>

                            {/* Crop Recommendations */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 relative overflow-hidden">
                                <Sparkles className="absolute top-2 right-2 w-16 h-16 text-gray-100" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-green-600" />
                                        <h4 className="font-bold text-gray-800">AI Precision Planting</h4>
                                    </div>
                                    {onRefreshRecommendations && (
                                        <button onClick={onRefreshRecommendations} disabled={recommendationsLoading} className="p-1 hover:bg-gray-100 rounded">
                                            <RefreshCw className={`w-4 h-4 text-gray-400 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {recommendationsLoading ? (
                                        [1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)
                                    ) : cropRecommendations && cropRecommendations.length > 0 ? (
                                        cropRecommendations.map((crop, idx) => (
                                            <div key={crop} className={`flex items-center justify-between p-3 rounded-xl border ${idx === 0 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</div>
                                                    <span className={`font-bold ${idx === 0 ? 'text-green-900' : 'text-gray-700'}`}>{crop}</span>
                                                </div>
                                                {idx === 0 && <span className="text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">BEST</span>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic text-center py-4">No recommendations available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Dynamic AI Recommendations */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 border border-green-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-green-600" />
                                <h4 className="font-bold text-green-800">AI Action Items (Day 1-{dayIndex + 1})</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {dynamicSummary.recommendations.map((rec, i) => (
                                    <div key={i} className="bg-white/70 rounded-xl p-3 text-sm text-gray-700 border border-green-100">{rec}</div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Components
const MetricPill = ({ label, value, status }: { label: string; value: string; status: string }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{status}</p>
    </div>
);

const StressMeter = ({ label, days, max }: { label: string; days: number; max: number }) => (
    <div>
        <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{label}</span>
            <span className="font-bold">{days} day{days !== 1 ? 's' : ''}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{ width: `${max > 0 ? (days / max) * 100 : 0}%` }} />
        </div>
    </div>
);

const SummaryCard = ({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
        <span className="text-2xl">{icon}</span>
        <p className="text-xs text-gray-500 uppercase font-bold mt-2">{label}</p>
        <p className="text-xl font-black text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{sub}</p>
    </div>
);

export default ForecastingHub;
