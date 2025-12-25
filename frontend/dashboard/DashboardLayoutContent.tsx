"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Activity, Layers, LayoutGrid, Bug, MessageSquare, Settings, TrendingUp, Home } from './components/ui/Icons';
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
            className={`nav-item-dark w-full mb-2 ${active ? 'active' : ''}`}
        >
            <Icon className={`w-5 h-5 mb-1 transition-all ${active ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
        </Link>
    );

    const getHeaderTitle = () => {
        if (pathname === '/dashboard') return user ? `Welcome back, ${user.username}` : 'Dashboard';
        if (pathname === '/dashboard/crop-wizard') return "Add New Crop";
        if (pathname === '/dashboard/detect') return "Disease Detection";
        if (pathname === '/dashboard/test') return "Soil Analysis";
        if (pathname === '/dashboard/forum') return "Kisan Sangha";
        return "Dashboard";
    };

    const getHeaderSubtitle = () => {
        if (pathname === '/dashboard') return "Your farm analytics at a glance";
        if (pathname === '/dashboard/crop-wizard') return "Add and manage your crops";
        if (pathname === '/dashboard/detect') return "AI-powered plant diagnostics";
        if (pathname === '/dashboard/test') return "Soil quality insights";
        if (pathname === '/dashboard/forum') return "Connect with farmers";
        return "KrishiBot Dashboard";
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

            <div className="dashboard-dark flex min-h-screen font-sans relative">
                {!user ? (
                    <div className="w-full relative z-0">
                        <UserSetup onComplete={setUser} />
                    </div>
                ) : (
                    <>
                        {/* Sidebar - Dark Glassmorphism */}
                        <aside className="hidden md:flex flex-col w-20 sidebar-dark py-6 px-2 items-center z-20 sticky top-0 h-screen">
                            {/* Logo */}
                            <div className="mb-8 w-12 h-12 relative rounded-2xl overflow-hidden shadow-lg border border-white/10 glow-accent">
                                <Image src="/images/krishibot-main-logo.png" alt="KrishiBot" fill className="object-cover" />
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 w-full px-1 space-y-1">
                                <SidebarItem
                                    icon={LayoutGrid}
                                    label="Overview"
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
                                    label="Soil"
                                    path="/dashboard/test"
                                    active={pathname === '/dashboard/test' || pathname.startsWith('/dashboard/test')}
                                />
                                <SidebarItem
                                    icon={MessageSquare}
                                    label="Forum"
                                    path="/dashboard/forum"
                                    active={pathname === '/dashboard/forum' || pathname.startsWith('/dashboard/forum')}
                                />
                            </nav>

                            {/* Bottom Actions */}
                            <div className="mt-auto space-y-2 w-full px-1">
                                <div className="divider-dark w-full mb-4"></div>
                                <button
                                    onClick={() => setShowProfile(true)}
                                    className="nav-item-dark w-full group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:shadow-amber-500/30 transition-all">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 flex flex-col relative">
                            {/* Header - Dark Theme */}
                            <header className="h-20 header-dark flex items-center justify-between px-6 z-10 sticky top-0">
                                <div className="text-left">
                                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                        {getHeaderTitle()}
                                        {pathname === '/dashboard' && (
                                            <span className="badge-success-dark text-[10px]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                Online
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-sm text-zinc-500 mt-0.5 font-medium">
                                        {getHeaderSubtitle()}
                                        {pathname === '/dashboard' && user.locationName && (
                                            <span className="ml-2 text-zinc-600">• {user.locationName}</span>
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Connection Status */}
                                    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isBackendConnected
                                            ? 'badge-success-dark'
                                            : 'badge-warning-dark'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`}></span>
                                        {isBackendConnected ? 'Live Data' : 'Demo Mode'}
                                    </div>

                                    {/* User Avatar */}
                                    <button
                                        onClick={() => setShowProfile(true)}
                                        className="relative group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20 ring-2 ring-white/10 group-hover:ring-amber-500/50 transition-all cursor-pointer">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141416]"></div>
                                    </button>
                                </div>
                            </header>

                            {/* Content Body */}
                            <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto custom-scrollbar">
                                <div className="max-w-6xl mx-auto">
                                    {children}
                                </div>
                            </div>

                            {/* Mobile Bottom Nav */}
                            <div className="md:hidden fixed bottom-0 left-0 right-0 sidebar-dark border-t border-white/5 flex justify-around p-2 pb-safe z-30">
                                <Link href="/dashboard" className={`flex flex-col items-center p-2 rounded-xl transition-all ${pathname === '/dashboard' ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    <LayoutGrid className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-medium">Overview</span>
                                </Link>
                                <Link href="/dashboard/detect" className={`flex flex-col items-center p-2 rounded-xl transition-all ${pathname.includes('/detect') ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    <Bug className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-medium">Detect</span>
                                </Link>
                                <Link href="/dashboard/test" className={`flex flex-col items-center p-2 rounded-xl transition-all ${pathname.includes('/test') ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    <Layers className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-medium">Soil</span>
                                </Link>
                                <Link href="/dashboard/forum" className={`flex flex-col items-center p-2 rounded-xl transition-all ${pathname.includes('/forum') ? 'text-amber-400' : 'text-zinc-500'}`}>
                                    <MessageSquare className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-medium">Forum</span>
                                </Link>
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
