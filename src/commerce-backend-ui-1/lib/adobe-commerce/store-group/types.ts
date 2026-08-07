/*
 * <license header>
 */

/* This file defines types for the Adobe Commerce Store Group client */

/** Adobe Commerce store group (`Magento\Store\Api\Data\GroupInterface`). */
export interface StoreGroup {
  id: number
  website_id: number
  name: string
  root_category_id: number
  default_store_id: number
  code?: string
  extension_attributes?: Record<string, unknown>
}
