import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MapWidget from './MapWidget';
import { CropData } from '../types';
import { Leaf, MapPin, Activity, AlertCircle, CheckCircle, RefreshCw } from './ui/Icons';
import { useDashboard } from '../DashboardContext';

interface CropWizardProps {
  onComplete: (data: CropData) => void;
  onCancel: () => void;
}

const CropWizard: React.FC<CropWizardProps> = ({ onComplete, onCancel }) => {
  const {
    isBackendConnected,
    cropRecommendations,
    recommendationsLoading,
    recommendationsError,
    refreshRecommendations
  } = useDashboard();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CropData>>({
    areaUnit: 'ropani',
    irrigationType: 'rainfed'
  });

  // Default crop options
  const defaultCrops = [
    'Rice (Dhaan)',
    'Wheat (Gahu)',
    'Maize (Makai)',
    'Mustard (Tori)',
    'Potato (Aalu)',
    'Mango',
    'Banana',
    'Apple',
    'Orange',
    'Lentil',
    'Jute',
    'Cotton',
    'Papaya'
  ];

  // Combine recommended crops with default options
  const getCropOptions = () => {
    if (cropRecommendations.length > 0) {
      // Add recommendations at the top, then other defaults
      const recommended = new Set(cropRecommendations.map(c => c.toLowerCase()));
      const others = defaultCrops.filter(c => !recommended.has(c.toLowerCase().split(' ')[0]));
      return [...cropRecommendations, ...others];
    }
    return defaultCrops;
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (formData.name && formData.location) {
      onComplete({
        id: Date.now().toString(),
        ...formData
      } as CropData);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, location: { lat, lng } }));
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSelect(position.coords.latitude, position.coords.longitude);
      },
      async (error) => {
        console.error("Error getting location", error);

        // Try IP-based fallback
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          if (data.latitude && data.longitude) {
            handleLocationSelect(data.latitude, data.longitude);
            return;
          }
        } catch (ipError) {
          console.error("IP geolocation failed", ipError);
        }

        // Retry with low accuracy
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
              alert('Could not detect location. Please select on map.');
            },
            { enableHighAccuracy: false, timeout: 10000 }
          );
        } else {
          alert('Could not detect location. Please select on map.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-agri-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          New Crop Entry
        </h2>
        <p className="text-agri-100 text-sm">Step {step} of 3</p>
        <div className="w-full bg-agri-800 h-1.5 mt-4 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 min-h-[400px]">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              {isBackendConnected && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  AI Recommendations Available
                </div>
              )}
            </div>

            {/* AI Crop Recommendations */}
            {isBackendConnected && (
              <div className="bg-gradient-to-r from-agri-50 to-emerald-50 rounded-xl p-4 border border-agri-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-agri-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-agri-600" />
                    AI Recommended Crops
                  </p>
                  <button
                    onClick={refreshRecommendations}
                    disabled={recommendationsLoading}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh recommendations"
                  >
                    <RefreshCw className={`w-4 h-4 text-agri-600 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {recommendationsError && (
                  <div className="p-2 bg-red-50 rounded-lg text-xs text-red-600 flex items-center gap-1 mb-2">
                    <AlertCircle className="w-3 h-3" />
                    {recommendationsError}
                  </div>
                )}

                {recommendationsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-agri-500 border-t-transparent rounded-full animate-spin"></div>
                    Analyzing your location...
                  </div>
                ) : cropRecommendations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cropRecommendations.map((crop, index) => (
                      <button
                        key={crop}
                        onClick={() => setFormData({ ...formData, name: crop })}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.name === crop
                          ? 'bg-agri-600 text-white shadow-md'
                          : 'bg-white text-agri-700 border border-agri-200 hover:border-agri-400'
                          }`}
                      >
                        {index < 3 && <span className="mr-1">⭐</span>}
                        {crop}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Complete setup to get personalized recommendations</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              >
                <option value="">Select Crop</option>
                {cropRecommendations.length > 0 && (
                  <optgroup label="🌟 AI Recommended">
                    {cropRecommendations.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Crops">
                  {getCropOptions().filter(c => !cropRecommendations.includes(c)).map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variety (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sona Mansuli"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none"
                value={formData.variety || ''}
                onChange={e => setFormData({ ...formData, variety: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none"
                value={formData.plantingDate || ''}
                onChange={e => setFormData({ ...formData, plantingDate: e.target.value })}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Farm Location</h3>
              <button
                onClick={getUserLocation}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100"
              >
                <MapPin className="w-3 h-3" /> Auto-Detect
              </button>
            </div>
            <div className="flex-1 h-64 w-full rounded-xl overflow-hidden border border-gray-300">
              <MapWidget
                mode="pick"
                initialLat={formData.location?.lat}
                initialLng={formData.location?.lng}
                onLocationSelect={handleLocationSelect}
              />
            </div>
            {formData.location && (
              <p className="text-xs text-center text-green-600 font-mono bg-green-50 py-1 rounded">
                Selected: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </p>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Field Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Size</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none"
                  value={formData.area || ''}
                  onChange={e => setFormData({ ...formData, area: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none"
                  value={formData.areaUnit}
                  onChange={e => setFormData({ ...formData, areaUnit: e.target.value as any })}
                >
                  <option value="ropani">Ropani</option>
                  <option value="bigha">Bigha</option>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Method</label>
              <div className="grid grid-cols-2 gap-3">
                {['rainfed', 'flood', 'drip', 'sprinkler'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, irrigationType: type as any })}
                    className={`p-3 rounded-lg border text-sm capitalize ${formData.irrigationType === type
                      ? 'border-agri-500 bg-agri-50 text-agri-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary section */}
            {formData.name && (
              <div className="mt-4 p-4 bg-agri-50 rounded-xl border border-agri-100">
                <h4 className="text-sm font-bold text-agri-800 mb-2">Crop Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Crop:</span> {formData.name}</p>
                  {formData.variety && <p><span className="font-medium">Variety:</span> {formData.variety}</p>}
                  {formData.plantingDate && <p><span className="font-medium">Planting:</span> {new Date(formData.plantingDate).toLocaleDateString()}</p>}
                  {formData.area && <p><span className="font-medium">Area:</span> {formData.area} {formData.areaUnit}</p>}
                  <p><span className="font-medium">Irrigation:</span> {formData.irrigationType}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 flex justify-between">
        {step > 1 ? (
          <button onClick={handleBack} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Back</button>
        ) : (
          <button onClick={onCancel} className="px-6 py-2 rounded-lg text-red-500 hover:bg-red-50">Cancel</button>
        )}

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={step === 1 && !formData.name || step === 2 && !formData.location}
            className="px-6 py-2 rounded-lg bg-agri-600 text-white font-medium hover:bg-agri-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-agri-600 text-white font-medium hover:bg-agri-700"
          >
            Finish & Save
          </button>
        )}
      </div>
    </div>
  );
};

export default CropWizard;