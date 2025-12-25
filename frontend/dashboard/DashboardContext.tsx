"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CropData, UserProfile } from './types';

interface DashboardContextType {
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    crops: CropData[];
    setCrops: (crops: CropData[]) => void;
    activeCropId: string | null;
    setActiveCropId: (id: string | null) => void;
    addCrop: (crop: CropData) => void;
    logout: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [crops, setCrops] = useState<CropData[]>([]);
    const [activeCropId, setActiveCropId] = useState<string | null>(null);

    const addCrop = (crop: CropData) => {
        setCrops((prev) => [...prev, crop]);
        setActiveCropId(crop.id);
    };

    const logout = () => {
        setUser(null);
        setCrops([]);
        setActiveCropId(null);
    };

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
