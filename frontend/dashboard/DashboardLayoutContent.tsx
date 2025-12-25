"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Activity, Layers, LayoutGrid, Bug, MessageSquare } from './components/ui/Icons';
import UserSetup from './components/UserSetup';
import UserProfilePanel from './components/UserProfilePanel';
import VoiceAssistant from './components/VoiceAssistant';
import { useDashboard } from './DashboardContext';

export default function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, setUser, logout, isBackendConnected } = useDashboard();
    const [showProfile, setShowProfile] = useState(false);
    const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        setShowProfile(false);
        router.push('/dashboard');
    };

    const SidebarItem = ({ icon: Icon, label, path, active }: any) => (
        <Link
            href={path}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-full mb-4 ${active ? 'bg-green-100 text-green-800' : 'text-gray-400 hover:bg-gray-50'
                }`}
        >
            <Icon className={`w-6 h-6 mb-1 ${active ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );

    const getHeaderTitle = () => {
        if (pathname === '/dashboard') return user ? `Namaste, ${user.username}` : 'Dashboard';
        if (pathname === '/dashboard/crop-wizard') return "Add New Crop";
        if (pathname === '/dashboard/detect') return "Disease Detection";
        if (pathname === '/dashboard/test') return "Soil Quality Analysis";
        if (pathname === '/dashboard/forum') return "Kisan Sangha";
        return "Dashboard";
    };

    return (
        <>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            <Script
                src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                crossOrigin=""
                onLoad={() => setIsLeafletLoaded(true)}
            />

            <div className="flex min-h-screen bg-[#f0fdf4] font-sans relative text-gray-900">
                {!user ? (
                    <div className="w-full relative z-0">
                        <UserSetup onComplete={setUser} />
                    </div>
                ) : (
                    <>
                        {/* Sidebar - Sticky */}
                        <aside className="hidden md:flex flex-col w-24 bg-white/40 backdrop-blur-xl border-r border-white/20 py-6 px-2 items-center z-20 sticky top-0 h-screen">
                            <div className="mb-8 w-22 h-22 relative rounded-full overflow-hidden shadow-lg border-2 border-green-100">
                                <Image src="/images/krishibot-main-logo.png" alt="KrishiBot" fill className="object-cover" />
                            </div>
                            <div className="flex-1 w-full px-2">
                                <SidebarItem
                                    icon={LayoutGrid}
                                    label="Dashboard"
                                    path="/dashboard"
                                    active={pathname === '/dashboard'}
                                />
                                <SidebarItem
                                    icon={Bug}
                                    label="Detect"
                                    path="/dashboard/detect"
                                    active={pathname === '/dashboard/detect' || pathname.startsWith('/dashboard/detect')}
                                />
                                <SidebarItem
                                    icon={Layers}
                                    label="Test"
                                    path="/dashboard/test"
                                    active={pathname === '/dashboard/test' || pathname.startsWith('/dashboard/test')}
                                />
                                <SidebarItem
                                    icon={MessageSquare}
                                    label="Forum"
                                    path="/dashboard/forum"
                                    active={pathname === '/dashboard/forum' || pathname.startsWith('/dashboard/forum')}
                                />
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 flex flex-col relative">
                            {/* Header - Sticky */}
                            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-10 sticky top-0">
                                <div className="text-left">
                                    <h1 className="text-xl font-bold text-gray-800">
                                        {getHeaderTitle()}
                                    </h1>
                                    {pathname === '/dashboard' && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Layers className="w-3 h-3" /> {user.locationName}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowProfile(true)}
                                        className="w-8 h-8 rounded-full bg-green-100 border border-green-200 shadow-sm overflow-hidden flex items-center justify-center text-green-700 font-bold hover:ring-2 hover:ring-green-400 transition-all cursor-pointer"
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </button>
                                </div>
                            </header>

                            {/* Content Body - Participates in root scroll */}
                            <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
                                <div className="max-w-5xl mx-auto">
                                    {children}
                                </div>
                            </div>

                            {/* Mobile Bottom Nav */}
                            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/40 backdrop-blur-xl border-t border-white/20 flex justify-around p-2 pb-safe z-30">
                                <SidebarItem icon={LayoutGrid} label="Dashboard" path="/dashboard" active={pathname === '/dashboard'} />
                                <SidebarItem icon={Bug} label="Detect" path="/dashboard/detect" active={pathname === '/dashboard/detect' || pathname.startsWith('/dashboard/detect')} />
                                <SidebarItem icon={Layers} label="Test" path="/dashboard/test" active={pathname === '/dashboard/test' || pathname.startsWith('/dashboard/test')} />
                                <SidebarItem icon={MessageSquare} label="Forum" path="/dashboard/forum" active={pathname === '/dashboard/forum' || pathname.startsWith('/dashboard/forum')} />
                            </div>
                        </main>

                        {/* Profile Panel Overlay */}
                        {showProfile && (
                            <UserProfilePanel
                                user={user}
                                onClose={() => setShowProfile(false)}
                                onLogout={handleLogout}
                            />
                        )}
                    </>
                )}

                {user && <VoiceAssistant hasBottomNav={true} />}
            </div>
        </>
    );
}
