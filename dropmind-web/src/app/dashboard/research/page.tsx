'use client';

import React, { useEffect, useState } from 'react';
import { fetchWinningProducts } from '@/lib/api';

export default function WinningProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchWinningProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Winning Products</h1>
            <p className="text-gray-500 mt-2">AI-discovered trends with high conversion potential.</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
            Refresh Data
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
            Error: {error}. Make sure the backend is running on port 3001.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {/* In a real app, use product.imageUrl */}
                  <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition">
                    📦
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black">
                    Score: {product.score}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-xl text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-blue-600">${product.price}</span>
                    <span className="text-xs font-bold text-gray-400">Category: {product.category}</span>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">
                      Import to Shopify
                    </button>
                    <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition">
                      Analyze Competitors
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
