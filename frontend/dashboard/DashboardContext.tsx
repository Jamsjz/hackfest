"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CropData } from './types';
import * as api from '../lib/api-service';

// Extended user profile with backend data
export interface ExtendedUserProfile {
    id?: number;
    username: string;
    locationName: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    diseaseScans?: api.DiseaseRecord[];
    soilTypePredictions?: api.SoilTypePrediction[];
    riskReports?: api.RiskReport[];
}

// Weather data from backend
export interface BackendWeatherData {
    tempMax: number;
    tempMin: number;
    humidity: number;
    rain: number;
    windSpeed: number;
    soilMoisture: number;
    soilTemperature: number;
    solarRadiation: number;
    condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy';
    soilData?: {
        ph: number;
        nitrogen: number;
        phosphorus: number;
        potassium: number;
    };
    hourlyData?: api.WeatherHourly[];
    dailyData?: api.WeatherDaily[];
    agriForecast?: any[]; // Using any[] for simplicity or import AgriForecastDay
}

interface DashboardContextType {
    // User state
    user: ExtendedUserProfile | null;
    setUser: (user: ExtendedUserProfile | null) => void;

    // Crops state
    crops: CropData[];
    setCrops: (crops: CropData[]) => void;
    activeCropId: string | null;
    setActiveCropId: (id: string | null) => void;
    addCrop: (crop: CropData) => void;

    // Weather data from backend
    weather: BackendWeatherData | null;
    weatherLoading: boolean;
    weatherError: string | null;
    refreshWeather: () => Promise<void>;

    // Crop recommendations from backend
    cropRecommendations: string[];
    recommendationsLoading: boolean;
    recommendationsError: string | null;
    refreshRecommendations: () => Promise<void>;

    // Backend connection status
    isBackendConnected: boolean;

    // Auth actions
    loginUser: (username: string, lat: number, lng: number, locationName: string) => Promise<boolean>;
    logout: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<ExtendedUserProfile | null>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('krishibot_user');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    });
    const [crops, setCrops] = useState<CropData[]>([]);
    const [activeCropId, setActiveCropId] = useState<string | null>(null);

    // Weather state
    const [weather, setWeather] = useState<BackendWeatherData | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    // Crop recommendations state
    const [cropRecommendations, setCropRecommendations] = useState<string[]>([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

    // Backend connection status
    const [isBackendConnected, setIsBackendConnected] = useState(false);

    // Check backend health on mount
    useEffect(() => {
        api.checkBackendHealth().then(setIsBackendConnected);
    }, []);

    // Determine weather condition from data
    const determineCondition = (rain: number, humidity: number): 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' => {
        if (rain > 10) return 'Stormy';
        if (rain > 2) return 'Rainy';
        if (humidity > 80) return 'Cloudy';
        return 'Sunny';
    };

    // Fetch weather data from backend
    const refreshWeather = useCallback(async () => {
        if (!user) return;

        setWeatherLoading(true);
        setWeatherError(null);

        try {
            const activeCrop = crops.find(c => c.id === activeCropId);
            const cropName = activeCrop ? activeCrop.name : "Rice";

            const data = await api.getWeatherData(user.username, cropName);

            // Process the weather data
            const todayData = data.daily?.[0];
            const currentHour = data.hourly?.[0];
            const processedWeather = data.processed_weather_for_recommendation;

            setWeather({
                tempMax: todayData?.temperature_2m_max ?? processedWeather.temperature_2m_mean ?? 25,
                tempMin: todayData?.temperature_2m_min ?? (processedWeather.temperature_2m_mean ? processedWeather.temperature_2m_mean - 8 : 17),
                humidity: processedWeather.relative_humidity_2m_mean ?? 65,
                rain: processedWeather.total_rainfall ?? 0,
                windSpeed: currentHour?.wind_speed_120m ?? 10,
                soilMoisture: currentHour?.soil_moisture_27_to_81cm ?? 40,
                soilTemperature: currentHour?.soil_temperature_54cm ?? 22,
                solarRadiation: currentHour?.terrestrial_radiation ?? 500,
                condition: determineCondition(processedWeather.total_rainfall ?? 0, processedWeather.relative_humidity_2m_mean ?? 65),
                soilData: data.soil_data,
                hourlyData: data.hourly,
                dailyData: data.daily,
                agriForecast: data.agri_forecast, // Add forecast data
            });
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            setWeatherError(error instanceof Error ? error.message : 'Failed to fetch weather data');

            // Set fallback mock data
            setWeather({
                tempMax: 28,
                tempMin: 19,
                humidity: 65,
                rain: 0,
                windSpeed: 12,
                soilMoisture: 42,
                soilTemperature: 24,
                solarRadiation: 600,
                condition: 'Sunny',
            });
        } finally {
            setWeatherLoading(false);
        }
    }, [user]);

    // Fetch crop recommendations from backend
    const refreshRecommendations = useCallback(async () => {
        if (!user) return;

        setRecommendationsLoading(true);
        setRecommendationsError(null);

        try {
            const data = await api.getCropRecommendation(user.username);
            setCropRecommendations(data.recommended_crops);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
            setRecommendationsError(error instanceof Error ? error.message : 'Failed to fetch recommendations');
        } finally {
            setRecommendationsLoading(false);
        }
    }, [user]);

    // Login/Register user with backend
    const loginUser = async (username: string, lat: number, lng: number, locationName: string): Promise<boolean> => {
        try {
            const backendUser = await api.loginOrRegisterUser({
                username,
                latitude: lat,
                longitude: lng,
            });

            setUser({
                id: backendUser.id,
                username: backendUser.username,
                locationName,
                coordinates: {
                    lat: Number(backendUser.latitude),
                    lng: Number(backendUser.longitude),
                },
                diseaseScans: backendUser.disease_scans,
                soilTypePredictions: backendUser.soil_type_predictions,
                riskReports: backendUser.risk_reports,
            });

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            // Fallback to local-only mode
            setUser({
                username,
                locationName,
                coordinates: { lat, lng },
            });
            return false;
        }
    };

    const addCrop = (crop: CropData) => {
        setCrops((prev) => [...prev, crop]);
        setActiveCropId(crop.id);
    };

    const logout = () => {
        setUser(null);
        setCrops([]);
        setActiveCropId(null);
        setWeather(null);
        setCropRecommendations([]);
        localStorage.removeItem('krishibot_user');
        document.cookie = `username=; path=/; max-age=0`;
    };

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('krishibot_user', JSON.stringify(user));
            // Set cookie for backend auth (1 year expiry)
            document.cookie = `username=${user.username}; path=/; max-age=31536000`;
        }
    }, [user]);

    // Fetch weather when user logs in
    useEffect(() => {
        if (user && isBackendConnected) {
            refreshWeather();
            refreshRecommendations();
        }
    }, [user, isBackendConnected, refreshWeather, refreshRecommendations]);

    return (
        <DashboardContext.Provider
            value={{
                user,
                setUser,
                crops,
                setCrops,
                activeCropId,
                setActiveCropId,
                addCrop,
                weather,
                weatherLoading,
                weatherError,
                refreshWeather,
                cropRecommendations,
                recommendationsLoading,
                recommendationsError,
                refreshRecommendations,
                isBackendConnected,
                loginUser,
                logout,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
