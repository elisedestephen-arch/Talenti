export interface FulfillmentOrder {
  id: string;
  shopifyOrderId: string;
  supplierId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippingCarrier?: string;
  items: FulfillmentItem[];
}

export interface FulfillmentItem {
  sku: string;
  quantity: number;
  supplierProductId: string;
}

export interface SupplierCredentials {
  id: string;
  name: string;
  apiKey: string;
}
