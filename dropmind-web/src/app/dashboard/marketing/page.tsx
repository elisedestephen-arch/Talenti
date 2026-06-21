'use client';

import React, { useEffect, useState } from 'react';
import { fetchMarketingCampaigns, launchCampaign } from '@/lib/api';

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketingCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleLaunch = async () => {
    try {
      await launchCampaign('prod_123', 'tiktok');
      loadCampaigns();
    } catch (err: any) {
      alert('Error launching campaign: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Ad Campaigns</h1>
            <p className="text-gray-500 mt-2">Manage your automated marketing performance.</p>
          </div>
          <button 
            onClick={handleLaunch}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            + Create New Campaign
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
            Error: {error}
          </div>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${campaign.platform === 'tiktok' ? 'bg-black text-white' : 'bg-blue-600 text-white'}`}>
                    {campaign.platform === 'tiktok' ? '🎵' : 'f'}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900">{campaign.name || `Campaign #${campaign.id}`}</h3>
                    <p className="text-gray-500 font-medium">Status: 
                      <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-wider">
                        {campaign.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-6 md:mt-0">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Spend</p>
                    <p className="text-lg font-black text-gray-900">${campaign.spend || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ROAS</p>
                    <p className="text-lg font-black text-blue-600">{campaign.roas || 0}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Clicks</p>
                    <p className="text-lg font-black text-gray-900">{campaign.clicks || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Conv.</p>
                    <p className="text-lg font-black text-gray-900">{campaign.conversions || 0}</p>
                  </div>
                </div>

                <div className="mt-6 md:mt-0">
                  <button className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
