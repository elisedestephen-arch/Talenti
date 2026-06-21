'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutMockPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'starter';
  const email = searchParams.get('email') || 'user@example.com';
  
  const prices: Record<string, string> = {
    starter: '$49.00',
    pro: '$99.00',
    unlimited: '$249.00'
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      window.location.href = '/dashboard?welcome=true';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Order Summary */}
        <div className="w-full md:w-1/3 bg-blue-600 p-8 text-white">
          <div className="text-xl font-bold mb-8 flex items-center">
            <span className="mr-2 text-2xl">🧠</span> DropMind AI
          </div>
          <h2 className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-2">Subscribe to</h2>
          <div className="text-3xl font-black mb-6 capitalize">{plan} Plan</div>
          
          <div className="border-t border-blue-500 pt-6 mt-6">
            <div className="flex justify-between mb-4">
              <span className="text-blue-100">{plan} plan (Monthly)</span>
              <span>{prices[plan]}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t border-blue-500 pt-4">
              <span>Total due</span>
              <span>{prices[plan]}</span>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-blue-200">
            <p>Your subscription will start immediately after payment.</p>
            <p className="mt-2 italic">Note: This is a simulation page until the owner connects the real Stripe account.</p>
          </div>
        </div>

        {/* Payment Form Simulation */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-8">Payment Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="text" 
                readOnly 
                value={email}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
                   <span className="text-xs text-gray-400">MM/YY CVC</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none">
                  <option>United States</option>
                  <option>France</option>
                  <option>United Kingdom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input 
                  type="text" 
                  placeholder="90210"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : `Pay ${prices[plan]}`}
            </button>
            
            <div className="text-center">
              <span className="text-xs text-gray-400 flex items-center justify-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payment powered by Stripe
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
