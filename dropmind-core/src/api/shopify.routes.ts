import { Router } from 'express';
import axios from 'axios';
import { ShopifyService } from '../modules/shopify/shopify.service';

const router = Router();
const shopifyService = new ShopifyService();

// OAuth initiation
router.get('/auth', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop parameter');

  const redirectUri = `${process.env.HOST}/api/shopify/auth/callback`;
  const installUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

// OAuth callback
router.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;

  if (shop && code) {
    try {
      const accessTokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      });

      const accessToken = accessTokenResponse.data.access_token;
      // Store accessToken in team-db associated with the user/shop
      res.send('Authenticated successfully! You can close this window.');
    } catch (e) {
      res.status(500).send('Authentication failed');
    }
  } else {
    res.status(400).send('Missing shop or code');
  }
});

router.get('/orders', async (req, res) => {
  const { shopName, accessToken } = req.query;

  if (!shopName || !accessToken) {
    return res.status(400).json({ error: 'Missing shopName or accessToken' });
  }

  try {
    const orders = await shopifyService.getOrders({
      shopName: shopName as string,
      accessToken: accessToken as string,
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/products', async (req, res) => {
  const { shopName, accessToken } = req.body.credentials;
  const { product } = req.body;

  if (!shopName || !accessToken || !product) {
    return res.status(400).json({ error: 'Missing credentials or product data' });
  }

  try {
    const result = await shopifyService.createProduct(
      { shopName, accessToken },
      product
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
