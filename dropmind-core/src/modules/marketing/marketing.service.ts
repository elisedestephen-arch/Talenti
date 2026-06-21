import { AdCampaign, CreateCampaignInput, AdCreative } from './marketing.types';
import { MetaAdsService } from './meta-ads.service';
import { TikTokAdsService } from './tiktok-ads.service';

export class MarketingService {
  private metaAds: MetaAdsService;
  private tiktokAds: TikTokAdsService;

  constructor() {
    this.metaAds = new MetaAdsService();
    this.tiktokAds = new TikTokAdsService();
  }

  async launchProductCampaign(platform: 'meta' | 'tiktok', productId: string, productName: string, budget: number): Promise<AdCampaign> {
    const creative: AdCreative = {
      title: `Get your ${productName} now!`,
      body: `Discover the amazing ${productName}. Best quality at the best price. Limited time offer!`,
      callToAction: 'SHOP_NOW'
    };

    const input: CreateCampaignInput = {
      name: `Auto Campaign - ${productName}`,
      platform,
      budget,
      productId,
      creative
    };

    if (platform === 'meta') {
      return this.metaAds.createCampaign(input);
    } else {
      return this.tiktokAds.createCampaign(input);
    }
  }

  async getCampaignStats(campaignId: string, platform: 'meta' | 'tiktok') {
    if (platform === 'meta') {
      return this.metaAds.getMetrics(campaignId);
    } else {
      return this.tiktokAds.getMetrics(campaignId);
    }
  }
}
