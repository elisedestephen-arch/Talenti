import { Router } from 'express';
import { CustomerService } from '../modules/customer-service/cs.service';

const router = Router();
const csService = new CustomerService();

router.post('/chat', async (req, res) => {
  const { customerId, message } = req.body;

  if (!customerId || !message) {
    return res.status(400).json({ error: 'Missing customerId or message' });
  }

  try {
    const response = await csService.handleUserMessage(customerId, message);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for /support/chat as requested
router.post('/support/chat', async (req, res) => {
  const { customerId, message } = req.body;

  if (!customerId || !message) {
    return res.status(400).json({ error: 'Missing customerId or message' });
  }

  try {
    const response = await csService.handleUserMessage(customerId, message);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
