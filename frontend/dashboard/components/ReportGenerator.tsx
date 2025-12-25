import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Leaf, CloudRain, Thermometer } from './ui/Icons';
import { CropData } from '../types';

interface ReportGeneratorProps {
  crops: CropData[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ crops }) => {


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-agri-600" /> Farm Report
          </h2>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Download PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-agri-50 p-5 rounded-xl border border-agri-100">
            <h3 className="font-semibold text-agri-800 mb-3 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Crop Status
            </h3>
            {crops.length > 0 ? (
              <ul className="space-y-2">
                {crops.map(crop => (
                  <li key={crop.id} className="text-sm text-agri-900 flex justify-between">
                    <span>{crop.name}</span>
                    <span className="font-mono text-agri-600">{crop.area} {crop.areaUnit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No active crops found.</p>
            )}
          </div>

          <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
            <h3 className="font-semibold text-sky-800 mb-3 flex items-center gap-2">
              <CloudRain className="w-4 h-4" /> Environmental Summary
            </h3>
            <div className="space-y-2 text-sm text-sky-900">
              <div className="flex justify-between">
                <span>Avg Temperature</span>
                <span className="font-bold">24°C</span>
              </div>
              <div className="flex justify-between">
                <span>Rainfall Forecast</span>
                <span className="font-bold">Low</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Health</span>
                <span className="font-bold text-green-600">Optimal</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportGenerator;