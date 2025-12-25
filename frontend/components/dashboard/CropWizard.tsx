import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MapWidget from './MapWidget';
import { CropData } from '../../lib/dashboard-types';
import { Leaf, MapPin } from './ui/Icons';

interface CropWizardProps {
    onComplete: (data: CropData) => void;
    onCancel: () => void;
}

const CropWizard: React.FC<CropWizardProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<CropData>>({
        areaUnit: 'ropani',
        irrigationType: 'rainfed'
    });

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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleLocationSelect(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    alert('Could not detect location. Please select on map.');
                }
            );
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-[#15803d] p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Leaf className="w-6 h-6" />
                    New Crop Entry
                </h2>
                <p className="text-green-100 text-sm">Step {step} of 3</p>
                <div className="w-full bg-[#166534] h-1.5 mt-4 rounded-full overflow-hidden">
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
                        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                            <select
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            >
                                <option value="">Select Crop</option>
                                <option value="Rice (Dhaan)">Rice (Dhaan)</option>
                                <option value="Wheat (Gahu)">Wheat (Gahu)</option>
                                <option value="Maize (Makai)">Maize (Makai)</option>
                                <option value="Mustard (Tori)">Mustard (Tori)</option>
                                <option value="Potato (Aalu)">Potato (Aalu)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variety (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Sona Mansuli"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                value={formData.variety || ''}
                                onChange={e => setFormData({ ...formData, variety: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                            <input
                                type="date"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={formData.area || ''}
                                    onChange={e => setFormData({ ...formData, area: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                                                ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
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
                        disabled={(step === 1 && !formData.name) || (step === 2 && !formData.location)}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
                    >
                        Finish & Save
                    </button>
                )}
            </div>
        </div>
    );
};

export default CropWizard;
