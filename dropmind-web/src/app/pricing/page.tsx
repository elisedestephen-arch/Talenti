import React from 'react';

const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    description: 'Perfect for beginners starting their first store.',
    features: [
      '1 Shopify Store',
      '10 Winning Products/mo',
      'AI Product Descriptions',
      'Automated Inventory Sync',
      'Email Support',
    ],
    buttonText: 'Start 14-day Trial',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99',
    description: 'Best for growing businesses scaling multiple stores.',
    features: [
      '3 Shopify Stores',
      '50 Winning Products/mo',
      'Full Marketing Automation',
      'TikTok & Meta Ad Engine',
      'Priority Email Support',
      'Advanced Analytics',
    ],
    buttonText: 'Get Started with Pro',
    popular: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$249',
    description: 'For serious dropshippers building an empire.',
    features: [
      'Unlimited Shopify Stores',
      'Unlimited Product Research',
      'Custom AI Training',
      'Wholesale Supplier Access',
      'Dedicated Account Manager',
      'API Access',
    ],
    buttonText: 'Go Unlimited',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Simple, Scaleable Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your dropshipping journey. 
            All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white rounded-3xl p-8 border ${
                plan.popular ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'
              } flex flex-col shadow-sm relative transition-transform hover:scale-[1.02]`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 mt-2 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-lg">/mo</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm">
                    <span className="mr-3 text-blue-500 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a 
                href={`/signup?plan=${plan.id}`}
                className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-500">
            Questions? <a href="mailto:support@dropmind.ai" className="text-blue-600 font-medium hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
