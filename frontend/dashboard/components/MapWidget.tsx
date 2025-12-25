import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from './ui/Icons';

interface MapWidgetProps {
  mode: 'view' | 'pick';
  initialLat?: number;
  initialLng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

const MapWidget: React.FC<MapWidgetProps> = ({ mode, initialLat, initialLng, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  // Default to Kathmandu coords if none provided
  const defaultLat = 27.7172;
  const defaultLng = 85.3240;

  useEffect(() => {
    // Simulate loading for satellite tiles
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Update map view when props change
  useEffect(() => {
    if (loading || !mapRef.current || !window.L) return;

    const lat = initialLat || defaultLat;
    const lng = initialLng || defaultLng;

    if (!mapInstance.current) {
      const map = window.L.map(mapRef.current).setView([lat, lng], 13);

      // Using Esri Satellite tiles for premium agriculture look
      window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(map);

      // Optional: Add labels on top
      window.L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
        attribution: '',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png',
        opacity: 0.7
      }).addTo(map);

      mapInstance.current = map;

      const icon = window.L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      if (mode === 'pick') {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;

          if (markerInstance.current) {
            markerInstance.current.setLatLng([lat, lng]);
          } else {
            markerInstance.current = window.L.marker([lat, lng], { icon }).addTo(map);
          }

          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });
      }

      // Initial marker if viewing or if coords provided
      if (initialLat && initialLng) {
        markerInstance.current = window.L.marker([lat, lng], { icon }).addTo(map);
      }
    } else {
      // Map already exists, just update view
      mapInstance.current.setView([lat, lng], 13);

      const icon = window.L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      if (markerInstance.current) {
        markerInstance.current.setLatLng([lat, lng]);
      } else if (initialLat && initialLng) {
        markerInstance.current = window.L.marker([lat, lng], { icon }).addTo(mapInstance.current);
      }
    }

    return () => {
      // Don't destroy map on every prop change, rely on React to unmount
    };
  }, [loading, mode, initialLat, initialLng]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-200 shadow-inner">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10 animate-pulse">
          <MapPin className="text-gray-400 w-12 h-12 mb-2" />
          <span className="text-gray-500 font-medium">Loading Satellite Data...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-0" />

      {mode === 'pick' && !loading && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg text-xs font-semibold text-gray-700 z-[400]">
          Tap map to pin
        </div>
      )}
    </div>
  );
};

export default MapWidget;