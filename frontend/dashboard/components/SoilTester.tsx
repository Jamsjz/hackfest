"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Layers, AlertCircle, CheckCircle } from './ui/Icons';
import { analyzeImage } from '../../lib/gemini-service';
import * as api from '../../lib/api-service';
import { AnalysisResult } from '../types';
import ContextualChat from './ContextualChat';
import { useDashboard } from '../DashboardContext';

interface SoilTesterProps {
  onClose?: () => void;
  isPage?: boolean;
}

interface BackendSoilResult {
  id: number;
  predicted_soil_type: string;
  image_path: string;
}

const SoilTester: React.FC<SoilTesterProps> = ({ onClose, isPage = false }) => {
  const { isBackendConnected } = useDashboard();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [backendResult, setBackendResult] = useState<BackendSoilResult | null>(null);
  const [useBackend, setUseBackend] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Soil type descriptions and recommendations
  const soilInfo: Record<string, { description: string; recommendation: string }> = {
    'Alluvial Soil': {
      description: 'Rich in minerals, highly fertile. Found in river valleys and deltas. Good water retention.',
      recommendation: 'Ideal for rice, wheat, sugarcane, and vegetables. Add organic matter for best results.'
    },
    'Black Soil': {
      description: 'High clay content, excellent moisture retention. Also known as regur soil.',
      recommendation: 'Best for cotton, soybean, and groundnut. Requires good drainage during monsoon.'
    },
    'Red Soil': {
      description: 'Iron-rich, slightly acidite. Porous texture with moderate fertility.',
      recommendation: 'Suitable for millets, pulses, and groundnuts. Add lime to reduce acidity.'
    },
    'Laterite Soil': {
      description: 'Leached soil with low nutrients. High iron and aluminium content.',
      recommendation: 'Needs heavy fertilization. Suitable for cashew, rubber, and tea with amendments.'
    },
    'Sandy Soil': {
      description: 'Low water retention, drains quickly. Light and warm texture.',
      recommendation: 'Good for root vegetables and melons. Add compost to improve water retention.'
    },
    'Clay Soil': {
      description: 'Heavy, dense soil with high nutrient content. Poor drainage.',
      recommendation: 'Add sand and organic matter for better drainage. Suitable for crops that need moisture.'
    },
    'Loamy Soil': {
      description: 'Perfect balance of sand, silt, and clay. Excellent for agriculture.',
      recommendation: 'Ideal for most crops. Maintain organic matter levels for continued fertility.'
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setBackendResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);

    try {
      // Try backend first if connected and we have a file
      if (isBackendConnected && useBackend && imageFile) {
        try {
          const backendResponse = await api.predictSoilType(imageFile);
          setBackendResult(backendResponse);

          const info = soilInfo[backendResponse.predicted_soil_type] || {
            description: "Soil type identified. Analysis complete.",
            recommendation: "Consult agricultural expert for detailed analysis."
          };

          setResult({
            title: backendResponse.predicted_soil_type,
            description: info.description,
            recommendation: info.recommendation,
            confidence: 0.85,
            type: 'soil'
          });
          setAnalyzing(false);
          return;
        } catch (backendError) {
          console.warn('Backend analysis failed, falling back to Gemini:', backendError);
          // Fall back to Gemini
        }
      }

      // Use Gemini API for analysis
      const jsonResponse = await analyzeImage(image, 'soil');
      const parsed = JSON.parse(jsonResponse);
      setResult({
        title: parsed.title || "Unknown Soil Type",
        description: parsed.description || "Could not analyze texture.",
        recommendation: parsed.recommendation || "Consult an agronomist.",
        confidence: 0.85,
        type: 'soil'
      });
    } catch (e) {
      console.error(e);
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const renderContent = () => (
    <>
      {/* Analysis Mode Toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2">
          {isBackendConnected ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-xs font-medium text-gray-600">
            {isBackendConnected ? 'ML Model Available' : 'Using AI Analysis'}
          </span>
        </div>
        {isBackendConnected && (
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-500">Use ML Model</span>
            <input
              type="checkbox"
              checked={useBackend}
              onChange={(e) => setUseBackend(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
          </label>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!image ? (
        <div className="flex flex-col gap-4 py-4">
          <div
            onClick={() => cameraInputRef.current?.click()}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
          >
            <div className="w-20 h-20 bg-white text-amber-700 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10" />
            </div>
            <p className="text-amber-900 font-bold text-lg">Take Photo</p>
            <p className="text-amber-700/70 text-sm">Use Camera to analyze soil</p>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase">Or upload</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-600 font-medium text-sm">Select from Gallery</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="relative rounded-2xl overflow-hidden h-56 bg-gray-900 shadow-inner">
            <img src={image} alt="Upload" className="w-full h-full object-contain mx-auto" />
            <button
              onClick={() => {
                setImage(null);
                setImageFile(null);
                setResult(null);
                setBackendResult(null);
                setError(null);
              }}
              className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!result && !analyzing && (
            <button
              onClick={handleAnalyze}
              className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-700/30 transition-all transform active:scale-95"
            >
              {useBackend && isBackendConnected ? 'Analyze with ML Model' : 'Analyze with AI'}
            </button>
          )}

          {analyzing && (
            <div className="text-center py-8 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="text-gray-800 font-bold">
                  {useBackend && isBackendConnected ? 'Running ML Model...' : 'Analyzing composition...'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {useBackend && isBackendConnected
                    ? 'Using trained soil classification model'
                    : 'Estimating texture and moisture'
                  }
                </p>
              </div>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xl text-amber-900">{result.title}</h4>
                  {backendResult && (
                    <span className="bg-green-100 px-2 py-1 rounded-md text-xs font-bold text-green-700 border border-green-200">
                      ML Model
                    </span>
                  )}
                </div>
                <p className="text-sm text-amber-800/80 leading-relaxed font-medium">{result.description}</p>

                <div className="bg-white p-4 rounded-xl border border-amber-200/50 shadow-sm">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Recommendations
                  </p>
                  <p className="text-sm text-gray-700">{result.recommendation}</p>
                </div>
              </div>

              <ContextualChat
                context={`Soil Analysis Result:\nType: ${result.title}\nDetails: ${result.description}\nAdvice: ${result.recommendation}`}
                placeholder="Ask about fertilizer, crops, or irrigation..."
              />
            </motion.div>
          )}
        </div>
      )}
    </>
  );

  if (isPage) {
    return (
      <div className="w-full max-w-2xl mx-auto h-full flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-amber-700 w-6 h-6" /> Soil Analyst
          </h3>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-white flex-1">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-amber-700 w-6 h-6" /> Soil Analyst
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
          {renderContent()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SoilTester;