import axios from 'axios';
import type { GoogleTrendData } from './product-research.types';

export class GoogleTrendsService {
  async getKeywordInterest(keyword: string): Promise<GoogleTrendData> {
    // In a real implementation, this would use the 'google-trends-api' package or similar
    // Mocking interest score (0-100)
    return {
      keyword,
      interestOverTime: Math.floor(Math.random() * 100)
    };
  }

  async getRelatedKeywords(keyword: string): Promise<string[]> {
    return [keyword + ' reviews', 'buy ' + keyword, 'best ' + keyword];
  }
}
