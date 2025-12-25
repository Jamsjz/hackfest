"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, AgriBot } from './ui/Icons';
import { generateChatResponse } from '../../lib/gemini-service';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { useDashboard } from '../DashboardContext';

interface VoiceAssistantProps {
  hasBottomNav?: boolean;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ hasBottomNav = false }) => {
  const { weather, crops, activeCropId, user } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Stop speech when assistant is closed
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Remove markdown symbols for cleaner speech
    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try to find a Nepali voice, fallback to Hindi or default
    const voices = window.speechSynthesis.getVoices();
    const nepaliVoice = voices.find(v => v.lang.includes('ne'));
    const hindiVoice = voices.find(v => v.lang.includes('hi'));

    if (nepaliVoice) utterance.voice = nepaliVoice;
    else if (hindiVoice) utterance.voice = hindiVoice;

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ne-NP';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      // Cancel speech if user starts talking
      window.speechSynthesis.cancel();
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Simulate thinking state
    const loadingId = "loading-" + Date.now();
    setMessages(prev => [...prev, { id: loadingId, role: 'model', text: 'Thinking...', timestamp: Date.now() }]);

    // Construct Context
    const activeCrop = crops.find(c => c.id === activeCropId);
    const forecastStr = weather?.dailyData?.slice(0, 3).map(day =>
      `${day.date}: Max ${day.temperature_2m_max}°C, Min ${day.temperature_2m_min}°C`
    ).join(' | ') || "No forecast available";

    const context = `
    User: ${user?.username || "Guest"} (${user?.locationName || "Unknown Location"})
    Key Metrics:
    - Weather: ${weather ? `${weather.condition}, Curr: ${weather.tempMax}°C (Min ${weather.tempMin})` : "N/A"}
    - Soil Moisture: ${weather?.soilMoisture ? `${Math.round(weather.soilMoisture * 100)}%` : "N/A"}
    - Rain: ${weather?.rain ? `${weather.rain}mm` : "0mm"}
    - Wind: ${weather?.windSpeed || "N/A"} km/h
    
    Weather Forecast (Next 3 Days):
    ${forecastStr}

    Active Crop: ${activeCrop ? `${activeCrop.name} (${activeCrop.variety}) - ${activeCrop.area} ${activeCrop.areaUnit}` : "None"}
    Soil Data:
    - pH: ${weather?.soilData?.ph || "6.5 (Typical)"}
    - NPK: ${weather?.soilData?.nitrogen?.toFixed(2) || "?"}-${weather?.soilData?.phosphorus?.toFixed(2) || "?"}-${weather?.soilData?.potassium?.toFixed(2) || "?"}
    - Soil Temp: ${weather?.soilTemperature || "N/A"}°C
    `;

    try {
      const responseText = await generateChatResponse(
        messages.map(m => ({ role: m.role, text: m.text })),
        userMsg.text,
        context
      );

      setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }));

      // Speak the response aloud
      speak(responseText);
    } catch (error) {
      const errorMsg = "Sorry, I am having trouble connecting. Please try again.";
      setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: errorMsg,
        timestamp: Date.now()
      }));
      speak(errorMsg);
    }
  };

  const positionClass = hasBottomNav ? 'bottom-20 md:bottom-6' : 'bottom-6';
  const chatWindowPosition = hasBottomNav ? 'bottom-24 md:bottom-24' : 'bottom-24 md:bottom-24';

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-6 w-16 h-16 rounded-full shadow-2xl shadow-green-600/40 flex items-center justify-center z-[1000] border-4 border-white overflow-hidden bg-gradient-to-br from-[#10b981] to-[#059669] transition-all group ${positionClass}`}
      >
        <div className="text-white w-9 h-9">
          <AgriBot className="w-full h-full" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed right-4 md:right-6 w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[1000] overflow-hidden flex flex-col max-h-[600px] ${chatWindowPosition}`}
            style={{ height: '65vh' }}
          >
            {/* Header */}
            <div className="bg-[#059669] p-4 text-white flex justify-between items-center bg-gradient-to-r from-[#047857] to-[#059669] shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm border border-white/30 overflow-hidden w-10 h-10 flex items-center justify-center">
                  <AgriBot className="w-7 h-7 text-white" />
                </div>
                <div className="leading-tight">
                  <h3 className="font-bold text-lg">कृषिबिद</h3>
                  <p className="text-[10px] text-green-100 uppercase tracking-wider font-medium">Smart Agri Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-tr from-green-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow-sm overflow-hidden">
                    <AgriBot className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">नमस्ते! I am कृषिबिद (Krishibid).</p>
                    <p className="text-xs mt-1 text-gray-400">Ask me about your crops, soil, or weather.</p>
                    {weather && (
                      <p className="text-[10px] text-green-600 mt-2 bg-green-50 inline-block px-2 py-1 rounded-lg border border-green-100">
                        Context Aware: {weather.condition}, {weather.tempMax}°C
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-4 px-4">
                    <button onClick={() => setInputValue("Analyze my crop health")} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">Analyze crop health</button>
                    <button onClick={() => setInputValue("Will it rain tomorrow?")} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">Rain forecast?</button>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-[#059669] text-white rounded-br-none shadow-green-600/10'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-green-600 prose-strong:text-gray-900'
                    }`}>
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 z-10">
              {isListening && (
                <div className="flex justify-center items-center py-2 space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 24, 10] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                      className="w-1 bg-[#10b981] rounded-full"
                    />
                  ))}
                  <p className="text-xs text-[#059669] font-bold ml-2">Listening (Nepali)...</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-100 text-gray-500 border border-gray-100 hover:bg-gray-200'}`}
                  title="Speak in Nepali"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type or speak..."
                  className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all shadow-inner"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="p-3 bg-[#059669] text-white rounded-full hover:bg-[#047857] disabled:opacity-50 disabled:bg-gray-300 shadow-sm transition-colors flex-shrink-0"
                  disabled={!inputValue}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;