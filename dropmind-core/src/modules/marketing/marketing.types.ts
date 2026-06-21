export interface AdCampaign {
  id: string;
  name: string;
  platform: 'meta' | 'tiktok';
  status: 'active' | 'paused' | 'archived';
  budget: number;
  currency: string;
  startDate: string;
  endDate?: string;
  metrics?: CampaignMetrics;
}

export interface AdCreative {
  title: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  callToAction: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  roas: number;
}

export interface CreateCampaignInput {
  name: string;
  platform: 'meta' | 'tiktok';
  budget: number;
  productId: string;
  creative: AdCreative;
}
