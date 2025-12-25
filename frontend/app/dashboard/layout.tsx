"use client";

import React from 'react';
import { DashboardProvider } from '@/dashboard/DashboardContext';
import DashboardLayoutContent from '@/dashboard/DashboardLayoutContent';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <DashboardLayoutContent>
                {children}
            </DashboardLayoutContent>
        </DashboardProvider>
    );
}
