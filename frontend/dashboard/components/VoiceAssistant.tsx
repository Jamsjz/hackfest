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
        className={`fixed right-6 w-16 h-16 rounded-full shadow-2xl shadow-amber-600/30 flex items-center justify-center z-[1000] border-2 border-amber-500/30 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 transition-all group ${positionClass}`}
      >
        <div className="text-white w-9 h-9">
          <AgriBot className="w-full h-full" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed right-4 md:right-6 w-[90vw] md:w-96 glass-card-dark rounded-2xl shadow-2xl z-[1000] overflow-hidden flex flex-col max-h-[600px] ${chatWindowPosition}`}
            style={{ height: '65vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-4 text-white flex justify-between items-center shadow-lg z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm border border-white/30 overflow-hidden w-10 h-10 flex items-center justify-center">
                  <AgriBot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">कृषिबिद</h3>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-green-300' : 'bg-yellow-300'} animate-pulse`}></span>
                    <p className="text-[10px] text-amber-100 uppercase tracking-wider font-medium">
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
              <div className="px-4 py-1.5 bg-[#141416] border-b border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Connection Secure</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-zinc-600">Use Server</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={useBackend}
                      onChange={(e) => setUseBackend(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-8 h-4 rounded-full transition-colors ${useBackend ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white shadow-lg transform transition-transform mt-0.5 ${useBackend ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d0d0f] custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-zinc-500 mt-10 space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-amber-500/30 shadow-lg shadow-amber-500/10 overflow-hidden">
                    <AgriBot className="w-10 h-10 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Namaste! I am कृषिबिद</h4>
                    <p className="text-xs mt-1 text-zinc-500 px-4">
                      Your expert farming assistant. Ask me about crops, diseases, or weather conditions.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-4 px-4">
                    <button onClick={() => setInputValue("Analyze my crop health")} className="text-xs glass-card-dark px-3 py-1.5 rounded-full hover:border-amber-500/30 text-zinc-400 transition-colors">Analyze crop health</button>
                    <button onClick={() => setInputValue("Will it rain tomorrow?")} className="text-xs glass-card-dark px-3 py-1.5 rounded-full hover:border-amber-500/30 text-zinc-400 transition-colors">Rain forecast?</button>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-br-none shadow-lg shadow-amber-500/20'
                    : 'bg-[#1a1a1e] text-zinc-300 border border-white/5 rounded-bl-none prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:text-white prose-headings:font-bold prose-a:text-amber-400 prose-strong:text-white'
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
            <div className="p-3 bg-[#141416] border-t border-white/5 z-10">
              {isListening && (
                <div className="flex justify-center items-center py-2 space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 24, 10] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                      className="w-1 bg-amber-500 rounded-full"
                    />
                  ))}
                  <p className="text-xs text-amber-400 font-bold ml-2">Listening...</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10'}`}
                  title="Speak in Nepali"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type or speak..."
                  className="flex-1 input-dark rounded-full px-4 py-2 text-sm"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="p-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:bg-zinc-700 shadow-sm transition-all flex-shrink-0"
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