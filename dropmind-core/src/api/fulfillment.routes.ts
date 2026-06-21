import { Router } from 'express';
import { FulfillmentService } from '../modules/fulfillment/fulfillment.service';

const router = Router();
const fulfillmentService = new FulfillmentService();

router.get('/orders', async (req, res) => {
  // In a real app, this would fetch all fulfillment orders from the DB
  res.json({ message: "List of all fulfillment orders" });
});

router.post('/process', async (req, res) => {
  const { shopifyOrderId, items } = req.body;

  if (!shopifyOrderId || !items) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const fulfillment = await fulfillmentService.processShopifyOrder(shopifyOrderId, items);
    res.json(fulfillment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tracking/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tracking = await fulfillmentService.syncTracking(id);
    res.json(tracking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
