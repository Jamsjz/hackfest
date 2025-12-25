import React, { useState } from 'react';
import { Menu, Leaf, Activity, FileText, Layers, LayoutGrid, Bug } from './components/ui/Icons';
import Dashboard from './components/Dashboard';
import CropWizard from './components/CropWizard';
import DiseaseDetector from './components/DiseaseDetector';
import SoilTester from './components/SoilTester';
import ReportGenerator from './components/ReportGenerator';
import VoiceAssistant from './components/VoiceAssistant';
import UserSetup from './components/UserSetup';
import UserProfilePanel from './components/UserProfilePanel';
import { AppView, CropData, WeatherData, UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [activeCropId, setActiveCropId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Mock initial data
  const weather: WeatherData = {
    tempMax: 28,
    tempMin: 19,
    humidity: 65,
    rain: 0,
    windSpeed: 12,
    soilMoisture: 42,
    condition: 'Sunny'
  };

  const handleAddCrop = (data: CropData) => {
    setCrops([...crops, data]);
    setActiveCropId(data.id);
    setView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setShowProfile(false);
    setView(AppView.DASHBOARD);
    setCrops([]);
    setActiveCropId(null);
  };

  const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-full mb-4 ${
        active ? 'bg-agri-100 text-agri-800' : 'text-gray-400 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${active ? 'text-agri-600' : 'text-gray-400'}`} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#f0fdf4] font-sans overflow-hidden relative">
      {!user ? (
        <div className="w-full h-full overflow-y-auto relative z-0">
           <UserSetup onComplete={setUser} />
        </div>
      ) : (
        <>
          {/* Sidebar (Mobile Bottom Nav style for desktop too for simplicity, or left bar) */}
          <aside className="hidden md:flex flex-col w-24 bg-white border-r border-gray-200 py-6 px-2 items-center z-20">
            <div className="mb-8 p-2 bg-agri-600 rounded-xl shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 w-full px-2">
              <SidebarItem 
                icon={LayoutGrid} 
                label="Dashboard" 
                active={view === AppView.DASHBOARD} 
                onClick={() => setView(AppView.DASHBOARD)} 
              />
              <SidebarItem 
                icon={Bug} 
                label="Detect" 
                active={view === AppView.DISEASE_DETECT} 
                onClick={() => setView(AppView.DISEASE_DETECT)} 
              />
              <SidebarItem 
                icon={Layers} 
                label="Test" 
                active={view === AppView.SOIL_TEST} 
                onClick={() => setView(AppView.SOIL_TEST)} 
              />
              <SidebarItem 
                icon={FileText} 
                label="Generate" 
                active={view === AppView.REPORTS} 
                onClick={() => setView(AppView.REPORTS)} 
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col h-full relative overflow-hidden">
            {/* Top Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-10 sticky top-0">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {view === AppView.DASHBOARD && `Namaste, ${user.username}`}
                  {view === AppView.CROP_WIZARD && "Add New Crop"}
                  {view === AppView.DISEASE_DETECT && "Disease Detection"}
                  {view === AppView.SOIL_TEST && "Soil Quality Analysis"}
                  {view === AppView.REPORTS && "Farming Reports"}
                </h1>
                {view === AppView.DASHBOARD && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {user.locationName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="w-8 h-8 rounded-full bg-agri-100 border border-agri-200 shadow-sm overflow-hidden flex items-center justify-center text-agri-700 font-bold hover:ring-2 hover:ring-agri-400 transition-all cursor-pointer"
                >
                  {user.username.charAt(0).toUpperCase()}
                </button>
              </div>
            </header>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
              <div className="max-w-5xl mx-auto">
                {view === AppView.DASHBOARD && (
                  <Dashboard 
                    weather={weather} 
                    activeCrop={crops.find(c => c.id === activeCropId)} 
                    onAddCrop={() => setView(AppView.CROP_WIZARD)}
                  />
                )}
                {view === AppView.CROP_WIZARD && (
                  <CropWizard 
                    onComplete={handleAddCrop} 
                    onCancel={() => setView(AppView.DASHBOARD)} 
                  />
                )}
                {view === AppView.DISEASE_DETECT && (
                  <div className="text-center py-20">
                    <p>Opening Camera Module...</p> 
                    {/* Normally modal handles this, but if navigated directly */}
                  </div>
                )}
                {view === AppView.SOIL_TEST && (
                  <div className="text-center py-20">
                     <p>Opening Soil Analysis Module...</p>
                  </div>
                )}
                {view === AppView.REPORTS && (
                  <ReportGenerator crops={crops} />
                )}
              </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-30">
              <SidebarItem icon={LayoutGrid} label="Dashboard" active={view === AppView.DASHBOARD} onClick={() => setView(AppView.DASHBOARD)} />
              <SidebarItem icon={Bug} label="Detect" active={view === AppView.DISEASE_DETECT} onClick={() => setView(AppView.DISEASE_DETECT)} />
              <SidebarItem icon={Layers} label="Test" active={view === AppView.SOIL_TEST} onClick={() => setView(AppView.SOIL_TEST)} />
              <SidebarItem icon={FileText} label="Generate" active={view === AppView.REPORTS} onClick={() => setView(AppView.REPORTS)} />
            </div>
          </main>

          {/* Overlays */}
          {view === AppView.DISEASE_DETECT && (
            <DiseaseDetector onClose={() => setView(AppView.DASHBOARD)} />
          )}
          {view === AppView.SOIL_TEST && (
            <SoilTester onClose={() => setView(AppView.DASHBOARD)} />
          )}
          
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
      
      {/* Voice Assistant - Always Visible, adjusts for mobile nav if user is logged in */}
      <VoiceAssistant hasBottomNav={!!user} />
    </div>
  );
};

export default App;