'use client';

import React, { useState } from 'react';
import { chatWithSupport } from '@/lib/api';

export default function SupportPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your AI Support Assistant. How can I help you manage your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await chatWithSupport(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || data.response || "I've processed your request." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to the brain. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">AI Support Agent</h1>
          <p className="text-gray-500 mt-2">Get help with orders, marketing, or technical issues.</p>
        </header>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow p-8 overflow-y-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl font-medium ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none animate-pulse text-gray-400">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-6 border-t border-gray-50 flex space-x-4 bg-gray-50/50">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-grow px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
