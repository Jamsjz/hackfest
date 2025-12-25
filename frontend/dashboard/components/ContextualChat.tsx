"use client";

import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../../lib/gemini-service';
import * as api from '../../lib/api-service';
import { ChatMessage } from '../types';
import { Mic } from './ui/Icons';
import { useDashboard } from '../DashboardContext';

interface ContextualChatProps {
  context: string;
  placeholder?: string;
}

const ContextualChat: React.FC<ContextualChatProps> = ({ context, placeholder = "Ask specific questions..." }) => {
  const { isBackendConnected } = useDashboard();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [useBackend, setUseBackend] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let response = "";

      if (isBackendConnected && useBackend) {
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        response = await api.sendChatMessage(history, userMsg.text, context);
      } else {
        response = await generateChatResponse(
          messages.map(m => ({ role: m.role, text: m.text })),
          userMsg.text,
          context
        );
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-4 flex flex-col h-[300px]">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
          <span className="text-xs font-bold text-gray-500 uppercase">AI Assistant (कृषिबिद)</span>
        </div>

        {isBackendConnected && (
          <label className="flex items-center gap-1 cursor-pointer">
            <span className="text-[10px] text-gray-400">Secure Mode</span>
            <input
              type="checkbox"
              checked={useBackend}
              onChange={(e) => setUseBackend(e.target.checked)}
              className="w-3 h-3 rounded border-gray-300 text-agri-600 focus:ring-agri-500"
            />
          </label>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-2 custom-scrollbar">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm italic mt-8">
            "Ask me anything about this result. I can help you plan your next steps."
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 px-3 rounded-lg text-sm ${msg.role === 'user'
              ? 'bg-agri-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-2 rounded-lg rounded-bl-none shadow-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:ring-2 focus:ring-agri-500 outline-none shadow-sm"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-agri-600 text-white p-2 rounded-full hover:bg-agri-700 disabled:opacity-50 shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ContextualChat;