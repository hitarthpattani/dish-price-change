/*
 * <license header>
 */

/* This file defines types for the Adobe Commerce Catalog client */

/** Adobe Commerce product (`Magento\Catalog\Api\Data\ProductInterface`), fields used here. */
export interface Product {
  sku: string
  name: string
  status: number
}

/** Response shape of the `GET V1/products` search endpoint. */
export interface ProductSearchResponse {
  items: Product[]
  total_count: number
}
