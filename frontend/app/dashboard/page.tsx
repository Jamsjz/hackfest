"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/dashboard/components/Dashboard';
import { useDashboard } from '@/dashboard/DashboardContext';

export default function DashboardPage() {
    const { crops, activeCropId, weather, weatherLoading, weatherError, refreshWeather, isBackendConnected } = useDashboard();
    const router = useRouter();

    // Convert backend weather to Dashboard format with fallback
    const dashboardWeather = weather ? {
        tempMax: weather.tempMax,
        tempMin: weather.tempMin,
        humidity: weather.humidity,
        rain: weather.rain,
        windSpeed: weather.windSpeed,
        soilMoisture: weather.soilMoisture,
        condition: weather.condition,
    } : {
        // Fallback mock data
        tempMax: 28,
        tempMin: 19,
        humidity: 65,
        rain: 0,
        windSpeed: 12,
        soilMoisture: 42,
        condition: 'Sunny' as const,
    };

    const activeCrop = crops.find(c => c.id === activeCropId);

    return (
        <Dashboard
            weather={dashboardWeather}
            activeCrop={activeCrop}
            onAddCrop={() => router.push('/dashboard/crop-wizard')}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            onRefreshWeather={refreshWeather}
            isBackendConnected={isBackendConnected}
            soilData={weather?.soilData}
            dailyForecast={weather?.dailyData}
        />
    );
}
