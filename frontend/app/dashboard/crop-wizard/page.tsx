"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import CropWizard from '@/dashboard/components/CropWizard';
import { useDashboard } from '@/dashboard/DashboardContext';
import { CropData } from '@/dashboard/types';

export default function CropWizardPage() {
    const { addCrop } = useDashboard();
    const router = useRouter();

    const handleComplete = (data: CropData) => {
        addCrop(data);
        router.push('/dashboard');
    };

    const handleCancel = () => {
        router.push('/dashboard');
    };

    return (
        <CropWizard
            onComplete={handleComplete}
            onCancel={handleCancel}
        />
    );
}
