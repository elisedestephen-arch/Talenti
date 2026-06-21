const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fetchWinningProducts = async () => {
  const response = await fetch(`${API_URL}/api/research/winning`);
  if (!response.ok) throw new Error('Failed to fetch winning products');
  return response.json();
};

export const fetchShopifyOrders = async () => {
  const response = await fetch(`${API_URL}/api/shopify/orders`);
  if (!response.ok) throw new Error('Failed to fetch Shopify orders');
  return response.json();
};

export const fetchMarketingCampaigns = async () => {
  const response = await fetch(`${API_URL}/api/marketing/campaigns`);
  if (!response.ok) throw new Error('Failed to fetch campaigns');
  return response.json();
};

export const launchCampaign = async (productId: string, platform: 'meta' | 'tiktok') => {
  const response = await fetch(`${API_URL}/api/marketing/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, platform }),
  });
  if (!response.ok) throw new Error('Failed to launch campaign');
  return response.json();
};

export const processOrder = async (orderId: string) => {
  const response = await fetch(`${API_URL}/api/fulfillment/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  if (!response.ok) throw new Error('Failed to process order');
  return response.json();
};

export const chatWithSupport = async (message: string) => {
  const response = await fetch(`${API_URL}/api/support/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Failed to get support response');
  return response.json();
};
