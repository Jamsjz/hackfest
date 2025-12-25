"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/dashboard/components/Dashboard';
import { useDashboard } from '@/dashboard/DashboardContext';
import { WeatherData } from '@/dashboard/types';

export default function DashboardPage() {
    const { crops, activeCropId } = useDashboard();
    const router = useRouter();

    // Mock weather data
    const weather: WeatherData = {
        tempMax: 28,
        tempMin: 19,
        humidity: 65,
        rain: 0,
        windSpeed: 12,
        soilMoisture: 42,
        condition: 'Sunny'
    };

    const activeCrop = crops.find(c => c.id === activeCropId);

    return (
        <Dashboard
            weather={weather}
            activeCrop={activeCrop}
            onAddCrop={() => router.push('/dashboard/crop-wizard')}
        />
    );
}
