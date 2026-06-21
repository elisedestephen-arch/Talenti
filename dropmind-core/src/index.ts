import express from 'express';
import dotenv from 'dotenv';
import shopifyRoutes from './api/shopify.routes';
import productResearchRoutes from './api/product-research.routes';
import marketingRoutes from './api/marketing.routes';
import fulfillmentRoutes from './api/fulfillment.routes';
import csRoutes from './api/customer-service.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DropMind Core Agent is running' });
});

app.use('/api/shopify', shopifyRoutes);
app.use('/api/research', productResearchRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/fulfillment', fulfillmentRoutes);
app.use('/api/support', csRoutes); // Use /api/support as main path for CS

app.listen(PORT, () => {
  console.log(`Core Agent listening on port ${PORT}`);
});
