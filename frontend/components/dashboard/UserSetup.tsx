import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MapWidget from '@/components/dashboard/MapWidget';
import { User, MapPin, Search, ArrowRight, Leaf, CloudRain, Activity } from '@/components/dashboard/ui/Icons';
import { UserProfile } from '../../lib/dashboard-types';

interface UserSetupProps {
    onComplete: (profile: UserProfile) => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onComplete }) => {
    const [username, setUsername] = useState('');
    const [locationName, setLocationName] = useState('');
    const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Default coordinates (Kathmandu) for map initialization if no search/selection
    const defaultLat = 27.7172;
    const defaultLng = 85.3240;

    const handleSearch = async () => {
        if (!locationName.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setLocationCoords({ lat, lng });
            } else {
                alert("Location not found. Please try again or pin on map.");
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            alert("Failed to search location. Please check internet.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleMapSelect = (lat: number, lng: number) => {
        setLocationCoords({ lat, lng });
    };

    const handleSubmit = () => {
        if (username && (locationName || locationCoords)) {
            onComplete({
                username,
                locationName: locationName || "Pinned Location",
                coordinates: locationCoords || { lat: defaultLat, lng: defaultLng }
            });
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gray-50">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Gradient Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-400/20 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/20 blur-[100px]"></div>
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50 bg-white/60 backdrop-blur-xl"
            >
                {/* Left Panel - Welcome */}
                <div className="md:w-5/12 relative flex flex-col justify-between p-10 bg-gradient-to-br from-[#059669] via-[#047857] to-[#065f46] text-white overflow-hidden">
                    {/* Decorative Glass Elements */}
                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-lg ring-1 ring-white/30">
                            <User className="w-7 h-7 text-white" />
                        </div>

                        <h1 className="text-4xl font-bold mb-4 tracking-tight">
                            Welcome to <br />
                            <span className="text-green-200">KrishiBot</span>
                        </h1>
                        <p className="text-green-50/90 text-lg leading-relaxed font-light mb-8">
                            Your AI-powered precision agriculture companion.
                        </p>

                        {/* Feature Icons Arrangement */}
                        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-8">
                            <div className="flex flex-col items-center gap-2 group">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                                    <Leaf className="w-5 h-5 text-green-100" />
                                </div>
                                <span className="text-[10px] font-medium text-green-100 uppercase tracking-widest">Crops</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                                    <CloudRain className="w-5 h-5 text-green-100" />
                                </div>
                                <span className="text-[10px] font-medium text-green-100 uppercase tracking-widest">Weather</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                                    <Activity className="w-5 h-5 text-green-100" />
                                </div>
                                <span className="text-[10px] font-medium text-green-100 uppercase tracking-widest">AI Insights</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto pt-8">
                        <p className="text-xs text-green-200/60 font-mono">v1.0.0 • Precision Agriculture</p>
                    </div>
                </div>

                {/* Right Panel - Inputs */}
                <div className="md:w-7/12 p-8 md:p-12 bg-white/40 backdrop-blur-md text-gray-800">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-800">Setup Profile</h3>
                            <p className="text-gray-500">Let's personalize your farming experience.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Your Name</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="e.g. Ram Bahadur"
                                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm group-hover:bg-white"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <User className="w-5 h-5 text-green-600 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-green-700" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Farm Location</label>
                            <div className="space-y-4">
                                <div className="relative flex gap-3">
                                    <div className="relative flex-1 group">
                                        <input
                                            type="text"
                                            placeholder="Search (e.g. Chitwan)"
                                            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm group-hover:bg-white"
                                            value={locationName}
                                            onChange={(e) => setLocationName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <MapPin className="w-5 h-5 text-green-600 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-green-700" />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="bg-[#059669] hover:bg-[#047857] text-white p-4 rounded-2xl transition-all shadow-lg shadow-green-600/30 disabled:opacity-70 disabled:shadow-none flex-shrink-0"
                                    >
                                        {isSearching ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Search className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative ring-4 ring-white">
                                    <MapWidget
                                        mode="pick"
                                        initialLat={locationCoords?.lat || defaultLat}
                                        initialLng={locationCoords?.lng || defaultLng}
                                        onLocationSelect={handleMapSelect}
                                    />
                                    {locationCoords && (
                                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-green-800 shadow-lg border border-green-100 z-[500] flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-green-600" />
                                            {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 ml-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                    Auto-search or pin manually on the satellite map.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={!username || (!locationName && !locationCoords)}
                                className="bg-gradient-to-r from-[#059669] to-[#10b981] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Get Started <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserSetup;
