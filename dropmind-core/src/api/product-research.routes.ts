import { Router } from 'express';
import { ProductResearchService } from '../modules/product-research/product-research.service';

const router = Router();
const researchService = new ProductResearchService();

router.get('/winning', async (req, res) => {
  try {
    const products = await researchService.findWinningProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
