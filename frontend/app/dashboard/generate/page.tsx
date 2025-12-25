"use client";

import React from 'react';
import ReportGenerator from '@/dashboard/components/ReportGenerator';
import { useDashboard } from '@/dashboard/DashboardContext';

export default function ReportPage() {
    const { crops } = useDashboard();
    return (
        <ReportGenerator crops={crops} />
    );
}
