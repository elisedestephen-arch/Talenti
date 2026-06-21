export const CREATE_PRODUCT_MUTATION = `
mutation productCreate($input: ProductInput!) {
  productCreate(input: $input) {
    product {
      id
      title
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const GET_ORDERS_QUERY = `
query {
  orders(first: 10, reverse: true) {
    edges {
      node {
        id
        name
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 5) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
              }
            }
          }
        }
        shippingAddress {
          address1
          city
          country
          zip
        }
      }
    }
  }
}
`;

export const UPDATE_INVENTORY_MUTATION = `
mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
  inventoryAdjustQuantity(input: $input) {
    inventoryLevel {
      id
      available
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const UPDATE_PRODUCT_MUTATION = `
mutation productUpdate($input: ProductInput!) {
  productUpdate(input: $input) {
    product {
      id
      title
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const DELETE_PRODUCT_MUTATION = `
mutation productDelete($input: EntityDeleteInput!) {
  productDelete(input: $input) {
    deletedProductId
    userErrors {
      field
      message
    }
  }
}
`;
