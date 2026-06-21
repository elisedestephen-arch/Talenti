import { TrendingProduct, ProductScoringFactors } from './product-research.types';
import { TikTokService } from './tiktok.service';
import { GoogleTrendsService } from './google-trends.service';

export class ProductResearchService {
  private tiktokService: TikTokService;
  private googleTrendsService: GoogleTrendsService;

  constructor() {
    this.tiktokService = new TikTokService();
    this.googleTrendsService = new GoogleTrendsService();
  }

  async findWinningProducts(): Promise<TrendingProduct[]> {
    // 1. Get trends from TikTok
    const tiktokTrends = await this.tiktokService.getTrendingHashtags();
    
    // 2. Analyze each trend
    const products: TrendingProduct[] = [];
    
    for (const trend of tiktokTrends) {
      // Analyze with Google Trends
      const googleData = await this.googleTrendsService.getKeywordInterest(trend.hashtag);
      
      // Calculate score
      const trendScore = this.calculateWinningScore({
        socialEngagement: trend.viewCount / 1000000, // Normalized
        searchVolume: googleData.interestOverTime,
        marketSaturaton: Math.random() * 50 // Mock factor
      });

      if (trendScore > 70) {
        products.push({
          id: Buffer.from(trend.hashtag).toString('hex'),
          name: this.formatName(trend.hashtag),
          description: `Winning product identified via #${trend.hashtag} on TikTok.`,
          niche: 'General',
          trendScore,
          source: 'tiktok'
        });
      }
    }

    return products.sort((a, b) => b.trendScore - a.trendScore);
  }

  private calculateWinningScore(factors: ProductScoringFactors): number {
    // Weighted score calculation
    const score = (factors.socialEngagement * 0.4) + (factors.searchVolume * 0.4) + ((100 - factors.marketSaturaton) * 0.2);
    return Math.min(Math.round(score), 100);
  }

  private formatName(hashtag: string): string {
    return hashtag
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
