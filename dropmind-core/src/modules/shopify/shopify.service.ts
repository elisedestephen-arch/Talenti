import axios from 'axios';
import type { ShopifyCredentials, ShopifyProduct, ShopifyOrder } from './shopify.types.js';
import { 
  CREATE_PRODUCT_MUTATION, 
  GET_ORDERS_QUERY, 
  UPDATE_PRODUCT_MUTATION, 
  DELETE_PRODUCT_MUTATION, 
  UPDATE_INVENTORY_MUTATION 
} from './shopify.queries';

export class ShopifyService {
  private getApiUrl(shopName: string) {
    return `https://${shopName}.myshopify.com/admin/api/2024-04/graphql.json`;
  }

  private async query(credentials: ShopifyCredentials, query: string, variables: any = {}) {
    const response = await axios.post(
      this.getApiUrl(credentials.shopName),
      { query, variables },
      {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      throw new Error(JSON.stringify(response.data.errors));
    }

    return response.data.data;
  }

  async createProduct(credentials: ShopifyCredentials, product: ShopifyProduct) {
    const input = {
      title: product.title,
      bodyHtml: product.bodyHtml,
      vendor: product.vendor,
      productType: product.productType,
      variants: product.variants.map(v => ({
        price: v.price,
        sku: v.sku,
        inventoryQuantities: [{
            availableQuantity: v.inventoryQuantity,
            locationId: "" // This would need to be fetched or provided
        }]
      })),
      images: product.images.map(img => ({ src: img.src }))
    };

    return this.query(credentials, CREATE_PRODUCT_MUTATION, { input });
  }

  async updateProduct(credentials: ShopifyCredentials, product: ShopifyProduct) {
    const input = {
      id: product.id,
      title: product.title,
      bodyHtml: product.bodyHtml,
      vendor: product.vendor,
      productType: product.productType,
    };

    return this.query(credentials, UPDATE_PRODUCT_MUTATION, { input });
  }

  async deleteProduct(credentials: ShopifyCredentials, productId: string) {
    return this.query(credentials, DELETE_PRODUCT_MUTATION, { input: { id: productId } });
  }

  async adjustInventory(credentials: ShopifyCredentials, inventoryItemId: string, availableDelta: number) {
    const input = {
      inventoryItemId,
      availableDelta,
    };

    return this.query(credentials, UPDATE_INVENTORY_MUTATION, { input });
  }

  async getOrders(credentials: ShopifyCredentials): Promise<ShopifyOrder[]> {
    const data = await this.query(credentials, GET_ORDERS_QUERY);
    return data.orders.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      totalPrice: edge.node.totalPriceSet.shopMoney.amount,
      currencyCode: edge.node.totalPriceSet.shopMoney.currencyCode,
      lineItems: edge.node.lineItems.edges.map((li: any) => ({
        id: li.node.id,
        title: li.node.title,
        quantity: li.node.quantity,
        variantId: li.node.variant?.id
      })),
      shippingAddress: edge.node.shippingAddress
    }));
  }
}
