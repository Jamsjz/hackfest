import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import MapWidget from './MapWidget';
import { User, MapPin, Search, ArrowRight, Leaf, CloudRain, Activity, Navigation, AlertCircle, CheckCircle } from './ui/Icons';
import { useDashboard } from '../DashboardContext';

interface UserSetupProps {
  onComplete: (profile: any) => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onComplete }) => {
  const { loginUser, isBackendConnected } = useDashboard();
  const [username, setUsername] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default coordinates (Kathmandu) for map initialization if no search/selection
  const defaultLat = 27.7172;
  const defaultLng = 85.3240;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        setIsSearching(false);
      },
      async (error) => {
        console.error("Error getting location", error);

        // Try IP-based fallback first as it's faster than a second timeout
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          if (data.latitude && data.longitude) {
            setLocationCoords({ lat: data.latitude, lng: data.longitude });
            setIsSearching(false);
            return;
          }
        } catch (ipError) {
          console.error("IP geolocation failed", ipError);
        }

        // If high accuracy and IP fallback both fail, try low accuracy browser geolocation
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setLocationCoords({ lat: latitude, lng: longitude });
              setIsSearching(false);
            },
            (err) => {
              console.error("Second attempt failed", err);
              alert("Unable to retrieve location. Please pin manually on the map.");
              setIsSearching(false);
            },
            { enableHighAccuracy: false, timeout: 10000 }
          );
        } else {
          alert("Location permission denied. Please allow location access or pin manually.");
          setIsSearching(false);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

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

  const handleSubmit = async () => {
    if (!username || (!locationName && !locationCoords)) return;

    setIsSubmitting(true);
    setError(null);

    const coords = locationCoords || { lat: defaultLat, lng: defaultLng };
    const locName = locationName || "Pinned Location";

    try {
      // Try to login/register with backend
      const success = await loginUser(username, coords.lat, coords.lng, locName);

      if (success) {
        console.log("Successfully registered with backend");
      } else {
        console.log("Running in offline mode");
      }

      // Complete the setup (context already updated by loginUser)
      onComplete({
        username,
        locationName: locName,
        coordinates: coords
      });
    } catch (err) {
      console.error("Setup error:", err);
      setError("Failed to complete setup. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gray-50">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-agri-400/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/20 blur-[100px]"></div>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/30 bg-white/40 backdrop-blur-xl"
      >
        {/* Left Panel - Welcome */}
        <div className="md:w-5/12 relative flex flex-col justify-between p-10 bg-agri-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-agri-600 via-agri-700 to-agri-800 opacity-100"></div>

          {/* Decorative Glass Elements */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-36 h-36 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-lg ring-1 ring-white/30 overflow-hidden relative">
              <Image src="/images/krishibot-main-logo.png" alt="KrishiBot" fill className="object-cover" />
            </div>

            <h1 className="text-4xl font-bold mb-4 tracking-tight text-shadow-sm">
              Welcome to <br />
              <span className="text-agri-200">KrishiBot</span>
            </h1>
            <p className="text-agri-50/90 text-lg leading-relaxed font-light mb-8">
              Your AI-powered precision agriculture companion.
            </p>

            {/* Backend Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isBackendConnected ? 'bg-green-500/20' : 'bg-yellow-500/20'} mb-6`}>
              {isBackendConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span className="text-xs text-green-100 font-medium">Connected to KrishiBot Server</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-yellow-100 font-medium">Offline Mode (Demo Data)</span>
                </>
              )}
            </div>

            {/* Feature Icons Arrangement */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                  <Leaf className="w-5 h-5 text-agri-100" />
                </div>
                <span className="text-[10px] font-medium text-agri-100 uppercase tracking-widest">Crops</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                  <CloudRain className="w-5 h-5 text-agri-100" />
                </div>
                <span className="text-[10px] font-medium text-agri-100 uppercase tracking-widest">Weather</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:bg-white/20 transition-all">
                  <Activity className="w-5 h-5 text-agri-100" />
                </div>
                <span className="text-[10px] font-medium text-agri-100 uppercase tracking-widest">AI Insights</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-8">
            <p className="text-xs text-agri-200/60 font-mono">v1.0.0 • Precision Agriculture</p>
          </div>
        </div>

        {/* Right Panel - Inputs */}
        <div className="md:w-7/12 p-8 md:p-12 bg-white/40 backdrop-blur-md">
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">Setup Profile</h3>
              <p className="text-gray-500">Let's personalize your farming experience.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Your Name</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. Ram Bahadur"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-agri-500/20 focus:border-agri-500 outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm"

                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <User className="w-5 h-5 text-agri-600 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-agri-700" />
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
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-agri-500/20 focus:border-agri-500 outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm"

                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <MapPin className="w-5 h-5 text-agri-600 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-agri-700" />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-agri-600 hover:bg-agri-700 text-white p-4 rounded-2xl transition-all shadow-lg shadow-agri-600/30 disabled:opacity-70 disabled:shadow-none flex-shrink-0"
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

                  <button
                    onClick={handleGetCurrentLocation}
                    type="button"
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-agri-700 p-2.5 rounded-xl shadow-lg z-[400] border border-white/50 flex items-center gap-2 text-xs font-bold transition-all transform hover:scale-105 active:scale-95"
                    title="Set my current location"
                  >
                    <Navigation className="w-4 h-4" />
                    Set My Location
                  </button>


                  {locationCoords && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-agri-800 shadow-lg border border-agri-100 z-[500] flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-agri-600" />
                      {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-agri-500 inline-block"></span>
                  Auto-search or pin manually on the satellite map.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!username || (!locationName && !locationCoords) || isSubmitting}
                className="bg-gradient-to-r from-agri-600 to-agri-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-agri-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    Get Started <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSetup;