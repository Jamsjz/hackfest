"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, AgriBot, AlertCircle, CheckCircle } from './ui/Icons';
import { generateChatResponse } from '../../lib/gemini-service';
import * as api from '../../lib/api-service';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { useDashboard } from '../DashboardContext';

interface VoiceAssistantProps {
  hasBottomNav?: boolean;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ hasBottomNav = false }) => {
  const { isBackendConnected } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [useBackend, setUseBackend] = useState(true);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate listening delay then stop
      setTimeout(() => {
        setIsListening(false);
        setInputValue("When should I irrigate my rice field?"); // Mock speech-to-text
      }, 3000);
    }
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

    try {
      let responseText = "";

      if (isBackendConnected && useBackend) {
        // Use Backend API
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        responseText = await api.sendChatMessage(history, userMsg.text);
      } else {
        // Use Client-side Gemini
        responseText = await generateChatResponse(
          messages.map(m => ({ role: m.role, text: m.text })),
          userMsg.text
        );
      }

      setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.filter(m => m.id !== loadingId).concat({
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to the knowledge base.",
        timestamp: Date.now()
      }));
    }
  };

  // Dynamic classes based on whether bottom nav exists (Dashboard) or not (User Setup/Desktop)
  const positionClass = hasBottomNav ? 'bottom-20 md:bottom-6' : 'bottom-6';
  const chatWindowPosition = hasBottomNav ? 'bottom-24 md:bottom-24' : 'bottom-24 md:bottom-24';

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-6 w-16 h-16 rounded-full shadow-2xl shadow-agri-600/40 flex items-center justify-center z-[1000] border-4 border-white overflow-hidden bg-gradient-to-br from-agri-500 to-emerald-600 transition-all group ${positionClass}`}
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
            className={`fixed right-4 md:right-6 w-[90vw] md:w-96 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 z-[1000] overflow-hidden flex flex-col max-h-[600px] ${chatWindowPosition}`}
            style={{ height: '65vh' }}
          >
            {/* Header */}
            <div className="bg-agri-600 p-4 text-white flex justify-between items-center bg-gradient-to-r from-agri-700 to-agri-600 shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm border border-white/30 overflow-hidden w-10 h-10 flex items-center justify-center">
                  <AgriBot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">कृषिबिद</h3>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-green-300' : 'bg-yellow-300'} animate-pulse`}></span>
                    <p className="text-[10px] text-agri-100 uppercase tracking-wider font-medium">
                      {isBackendConnected && useBackend ? 'Smart Server AI' : 'Local AI Mode'}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Info / Toggle */}
            {isBackendConnected && (
              <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Connection Secure</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-400">Use Server</span>
                  <input
                    type="checkbox"
                    checked={useBackend}
                    onChange={(e) => setUseBackend(e.target.checked)}
                    className="w-3 h-3 rounded border-gray-300 text-agri-600 focus:ring-agri-500"
                  />
                </label>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-tr from-agri-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow-sm overflow-hidden">
                    <AgriBot className="w-10 h-10 text-agri-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Namaste! I am कृषिबिद</h4>
                    <p className="text-xs mt-1 text-gray-500 px-4">
                      Your expert farming assistant. Ask me about crops, diseases, or weather conditions.
                    </p>
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
                    ? 'bg-agri-600 text-white rounded-br-none shadow-agri-600/10'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-agri-600 prose-strong:text-gray-900'
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
            <div className="p-3 bg-white/50 backdrop-blur-md border-t border-white/10 z-10">
              {isListening && (
                <div className="flex justify-center items-center py-2 space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 24, 10] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                      className="w-1 bg-agri-500 rounded-full"
                    />
                  ))}
                  <p className="text-xs text-agri-600 font-bold ml-2">Listening...</p>
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
                  className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-agri-500/20 focus:border-agri-500 outline-none transition-all shadow-inner"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="p-3 bg-agri-600 text-white rounded-full hover:bg-agri-700 disabled:opacity-50 disabled:bg-gray-300 shadow-sm transition-colors flex-shrink-0"
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