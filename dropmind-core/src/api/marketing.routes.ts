import { Router } from 'express';
import { MarketingService } from '../modules/marketing/marketing.service';

const router = Router();
const marketingService = new MarketingService();

router.get('/campaigns', async (req, res) => {
  // In a real app, this would fetch all campaigns from the DB or platform
  res.json({ message: "List of all active marketing campaigns" });
});

router.post('/launch', async (req, res) => {
  const { platform, productId, productName, budget } = req.body;

  if (!platform || !productId || !productName || !budget) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const campaign = await marketingService.launchProductCampaign(platform, productId, productName, budget);
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  const { platform } = req.query;

  if (!platform) {
    return res.status(400).json({ error: 'Missing platform parameter' });
  }

  try {
    const stats = await marketingService.getCampaignStats(campaignId, platform as 'meta' | 'tiktok');
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
