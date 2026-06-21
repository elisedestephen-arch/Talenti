import React from 'react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100">
        <div className="text-2xl font-bold text-blue-600 flex items-center">
          <span className="mr-2">🧠</span> DropMind AI
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <a href="#about" className="hover:text-blue-600 transition">About</a>
        </div>
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="px-8 py-20 md:py-32 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Automate <span className="text-blue-600">100%</span> of your Dropshipping Business
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          From AI-powered product research to automated marketing and customer service. 
          DropMind AI is the only teammate you need to scale your e-commerce empire.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/pricing" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-200">
            Start Your Free Trial
          </Link>
          <button className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition">
            Watch Demo
          </button>
        </div>
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-blue-100 blur-3xl opacity-30 rounded-full scale-75"></div>
          <div className="relative bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-800">
            <div className="bg-gray-800 rounded-lg h-96 flex items-center justify-center text-gray-500">
              [Dashboard Preview Screenshot]
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="px-8 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600">Built by dropshippers, powered by state-of-the-art AI.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Smart Product Research",
                desc: "Identify winning products before they go viral with our multi-channel trend analysis engine.",
                icon: "🔍"
              },
              {
                title: "Automated Store Management",
                desc: "AI writes your descriptions, picks the best images, and pushes to Shopify in one click.",
                icon: "🛒"
              },
              {
                title: "AI Marketing Engine",
                desc: "Scale your ads on Meta and TikTok with AI-generated creatives and auto-optimized bidding.",
                icon: "📈"
              },
              {
                title: "Seamless Fulfillment",
                desc: "Automated ordering and tracking sync with global suppliers. Never miss an order.",
                icon: "📦"
              },
              {
                title: "24/7 AI Support",
                desc: "Our LLM-powered chatbot handles customer questions, refunds, and tracking updates.",
                icon: "💬"
              },
              {
                title: "Performance Analytics",
                desc: "Track your ROI, profit margins, and ad performance in one unified real-time dashboard.",
                icon: "📊"
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-8 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600">Choose the plan that fits your growth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$49",
                features: ["1 Shopify Store", "10 Products per month", "Basic AI Copywriting", "Email Support"],
                button: "Start Free Trial",
                popular: false
              },
              {
                name: "Pro",
                price: "$99",
                features: ["3 Shopify Stores", "50 Products per month", "Advanced Ad Management", "TikTok & Meta Integration", "Priority Support"],
                button: "Most Popular",
                popular: true
              },
              {
                name: "Unlimited",
                price: "$249",
                features: ["Unlimited Stores", "Unlimited Products", "Custom AI Training", "Wholesale Supplier Access", "Dedicated Account Manager"],
                button: "Contact Sales",
                popular: false
              }
            ].map((p, i) => (
              <div key={i} className={`p-10 rounded-3xl border ${p.popular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-gray-200'} flex flex-col relative`}>
                {p.popular && <span className="absolute top-0 right-10 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold">POPULAR</span>}
                <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                <div className="text-4xl font-black mb-6">{p.price}<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center text-gray-600">
                      <span className="mr-2 text-blue-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center ${p.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  {p.button}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 mb-4 md:mb-0">
            🧠 DropMind AI
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 DropMind AI. All rights reserved. Built for the future of e-commerce.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
