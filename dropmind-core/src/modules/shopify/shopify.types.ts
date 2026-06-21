export interface ShopifyCredentials {
  shopName: string;
  accessToken: string;
}

export interface ShopifyProduct {
  id?: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  variants: ShopifyProductVariant[];
  images: ShopifyProductImage[];
}

export interface ShopifyProductVariant {
  price: string;
  sku: string;
  inventoryQuantity: number;
}

export interface ShopifyProductImage {
  src: string;
}

export interface ShopifyOrder {
  id: string;
  name: string;
  totalPrice: string;
  currencyCode: string;
  lineItems: ShopifyLineItem[];
  shippingAddress: ShopifyAddress;
}

export interface ShopifyLineItem {
  id: string;
  title: string;
  quantity: number;
  variantId: string;
}

export interface ShopifyAddress {
  address1: string;
  city: string;
  country: string;
  zip: string;
}
