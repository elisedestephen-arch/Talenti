export interface TrendingProduct {
  id: string;
  name: string;
  description: string;
  niche: string;
  trendScore: number; // 0-100
  source: 'tiktok' | 'google-trends' | 'aliexpress';
  imageUrl?: string;
  externalUrl?: string;
}

export interface TikTokTrendData {
  hashtag: string;
  viewCount: number;
  region: string;
}

export interface GoogleTrendData {
  keyword: string;
  interestOverTime: number; // 0-100
}

export interface ProductScoringFactors {
  socialEngagement: number;
  searchVolume: number;
  marketSaturaton: number;
}
