import type { FulfillmentOrder, FulfillmentItem } from './fulfillment.types';
import { SupplierService } from './supplier.service';

export class FulfillmentService {
  private supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  async processShopifyOrder(shopifyOrderId: string, items: any[]): Promise<FulfillmentOrder> {
    console.log(`[FulfillmentService] Processing Shopify order: ${shopifyOrderId}`);

    // Map Shopify items to supplier items
    const fulfillmentItems: FulfillmentItem[] = items.map(item => ({
      sku: item.sku,
      quantity: item.quantity,
      supplierProductId: item.variantId // Mock mapping
    }));

    const supplierOrderId = await this.supplierService.placeOrder('AliExpress_Main', fulfillmentItems);

    return {
      id: supplierOrderId,
      shopifyOrderId,
      supplierId: 'AliExpress_Main',
      status: 'processing',
      items: fulfillmentItems
    };
  }

  async syncTracking(fulfillmentOrderId: string): Promise<Partial<FulfillmentOrder>> {
    const tracking = await this.supplierService.getTrackingInfo(fulfillmentOrderId);
    
    return {
      id: fulfillmentOrderId,
      trackingNumber: tracking.trackingNumber,
      shippingCarrier: tracking.carrier,
      status: tracking.status as any
    };
  }
}
