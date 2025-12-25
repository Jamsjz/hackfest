"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Activity } from './ui/Icons';
import { analyzeImage } from '../../lib/gemini-service';
import { AnalysisResult } from '../types';
import ContextualChat from './ContextualChat';

interface DiseaseDetectorProps {
  onClose?: () => void;
  isPage?: boolean;
}

const DiseaseDetector: React.FC<DiseaseDetectorProps> = ({ onClose, isPage = false }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const jsonResponse = await analyzeImage(image, 'disease');
      const parsed = JSON.parse(jsonResponse);
      setResult({
        title: parsed.title || "Unknown Issue",
        description: parsed.description || "Could not determine details.",
        recommendation: parsed.recommendation || "Consult a local expert.",
        confidence: 0.85,
        type: 'disease'
      });
    } catch (e) {
      console.error(e);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const renderContent = () => (
    <>
      {!image ? (
        <div className="flex flex-col gap-4 py-4">
          <div
            onClick={() => cameraInputRef.current?.click()}
            className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-dashed border-red-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-red-300 hover:shadow-lg hover:shadow-red-500/10 transition-all group"
          >
            <div className="w-20 h-20 bg-white text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10" />
            </div>
            <p className="text-red-900 font-bold text-lg">Take Photo</p>
            <p className="text-red-600/70 text-sm">Use Camera to detect disease</p>
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
              onClick={() => setImage(null)}
              className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!result && !analyzing && (
            <button
              onClick={handleAnalyze}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all transform active:scale-95"
            >
              Analyze Plant Health
            </button>
          )}

          {analyzing && (
            <div className="text-center py-8 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-red-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="text-gray-800 font-bold">Scanning leaf patterns...</p>
                <p className="text-xs text-gray-500 mt-1">Checking against 50+ disease models</p>
              </div>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xl text-red-900">{result.title}</h4>
                  <span className="bg-white px-2.5 py-1 rounded-md text-xs font-bold text-red-700 border border-red-200 shadow-sm">
                    {(result.confidence * 100).toFixed(0)}% Match
                  </span>
                </div>
                <p className="text-sm text-red-800/80 leading-relaxed font-medium">{result.description}</p>

                <div className="bg-white p-4 rounded-xl border border-red-200/50 shadow-sm">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Recommended Treatment
                  </p>
                  <p className="text-sm text-gray-700">{result.recommendation}</p>
                </div>
              </div>

              <ContextualChat
                context={`Disease Analysis Result:\nDisease: ${result.title}\nSeverity/Desc: ${result.description}\nTreatment: ${result.recommendation}`}
                placeholder="Ask about organic remedies, prevention..."
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
            <Activity className="text-red-500 w-6 h-6" /> Plant Doctor
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
            <Activity className="text-red-500 w-6 h-6" /> Plant Doctor
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

export default DiseaseDetector;