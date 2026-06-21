'use client';

import React, { useEffect, useState } from 'react';
import { fetchShopifyOrders, processOrder } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchShopifyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleProcess = async (orderId: string) => {
    try {
      await processOrder(orderId);
      alert('Order processing initiated!');
      loadOrders();
    } catch (err: any) {
      alert('Error processing order: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900">Shopify Orders</h1>
          <p className="text-gray-500 mt-2">Manage and automate your order fulfillment.</p>
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Order</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-6 font-bold text-gray-900">#{order.name || order.id}</td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900">{order.customer?.firstName} {order.customer?.lastName}</p>
                      <p className="text-xs text-gray-400">{order.customer?.email}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-blue-600">${order.totalPriceSet?.presentmentMoney?.amount}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        order.displayFulfillmentStatus === 'FULFILLED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.displayFulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {order.displayFulfillmentStatus !== 'FULFILLED' ? (
                        <button 
                          onClick={() => handleProcess(order.id)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-black transition"
                        >
                          Automate Fulfillment
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Track Item</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-20 text-center text-gray-400 font-medium">
                No orders found yet. Connect your store and start selling!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
