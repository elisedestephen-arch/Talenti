'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchShopifyOrders, fetchMarketingCampaigns } from '@/lib/api';

const DashboardContent = () => {
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get('welcome') === 'true';
  const [isClient, setIsClient] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    const loadActivity = async () => {
      try {
        const [orders, campaigns] = await Promise.all([
          fetchShopifyOrders().catch(() => []),
          fetchMarketingCampaigns().catch(() => [])
        ]);
        
        const combined = [
          ...orders.slice(0, 2).map((o: any) => ({
            time: 'Recent',
            action: `New order #${o.name || o.id} received from ${o.customer?.firstName}.`,
            type: 'order'
          })),
          ...campaigns.slice(0, 2).map((c: any) => ({
            time: 'Active',
            action: `Campaign "${c.name || c.id}" is running with ROAS ${c.roas}x.`,
            type: 'marketing'
          }))
        ];
        
        if (combined.length > 0) setActivity(combined);
      } catch (e) {
        console.error(e);
      }
    };
    loadActivity();
  }, []);

  if (!isClient) return null;

  const displayActivity = activity.length > 0 ? activity : [
    { time: '2 mins ago', action: 'Found 3 new winning products in "Home Decor" category.', type: 'research' },
    { time: '45 mins ago', action: 'Automated fulfillment for order #4295.', type: 'order' },
    { time: '2 hours ago', action: 'Increased Meta Ads budget for "Summer Sale" campaign.', type: 'marketing' },
    { time: '3 hours ago', action: 'Resolved customer ticket #882 using LLM Support.', type: 'support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <Link href="/dashboard" className="p-6 text-2xl font-bold text-blue-600 flex items-center">
          <span className="mr-2">🧠</span> DropMind
        </Link>
        
        <nav className="flex-grow px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium">
            <span className="mr-3">🏠</span> Dashboard
          </Link>
          <Link href="/dashboard/research" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">
            <span className="mr-3">🔍</span> Product Research
          </Link>
          <Link href="/dashboard/orders" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">
            <span className="mr-3">📦</span> Orders
          </Link>
          <Link href="/dashboard/marketing" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">
            <span className="mr-3">📈</span> Ad Campaigns
          </Link>
          <Link href="/dashboard/support" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">
            <span className="mr-3">💬</span> AI Support
          </Link>
          <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">
            <span className="mr-3">⚙️</span> Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white">
            <p className="text-xs font-bold opacity-80 uppercase mb-1">Current Plan</p>
            <p className="text-lg font-bold mb-3">Pro Plan</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">Overview</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition">🔔</button>
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              JD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {showWelcome && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mr-4">🎉</div>
                <div>
                  <h3 className="text-green-800 font-bold text-lg">Welcome to DropMind AI!</h3>
                  <p className="text-green-600">Your subscription is now active. Let's start by connecting your first store.</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                Connect Shopify
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total Revenue', value: '$12,450.00', change: '+12.5%', icon: '💰', color: 'blue' },
              { label: 'Active Orders', value: '48', change: '+5', icon: '📦', color: 'purple' },
              { label: 'Ad Spend', value: '$1,200.40', change: '-2.1%', icon: '📈', color: 'orange' },
              { label: 'Avg. ROI', value: '4.2x', change: '+0.4', icon: '💎', color: 'green' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                  <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Agent Activity */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">Agent Activity</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  AI Running
                </span>
              </div>
              <div className="p-0">
                {displayActivity.map((item, i) => (
                  <div key={i} className="px-8 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <button className="text-blue-600 text-sm font-bold hover:underline">View full logs</button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition flex flex-col items-center group">
                    <span className="text-2xl mb-2 group-hover:scale-110 transition">🚀</span>
                    <span className="text-xs font-bold">Launch Ads</span>
                  </button>
                  <button className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition flex flex-col items-center group">
                    <span className="text-2xl mb-2 group-hover:scale-110 transition">🏷️</span>
                    <span className="text-xs font-bold">New Product</span>
                  </button>
                  <button className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition flex flex-col items-center group">
                    <span className="text-2xl mb-2 group-hover:scale-110 transition">💬</span>
                    <span className="text-xs font-bold">Support</span>
                  </button>
                  <button className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition flex flex-col items-center group">
                    <span className="text-2xl mb-2 group-hover:scale-110 transition">🔗</span>
                    <span className="text-xs font-bold">Store Sync</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-[80px] opacity-20"></div>
                <h3 className="font-bold text-lg mb-2 relative z-10">AI Insights</h3>
                <p className="text-gray-400 text-sm mb-6 relative z-10 leading-relaxed">
                  "Based on current trends, your 'Wireless Lamp' ads are 42% more efficient on TikTok than Instagram."
                </p>
                <button className="w-full py-3 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-700 transition relative z-10">
                  Apply Recommendations
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
