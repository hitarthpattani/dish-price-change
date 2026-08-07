/*
 * <license header>
 */

/* This file defines types for the Adobe Commerce Store View client */

/** Adobe Commerce store view (`Magento\Store\Api\Data\StoreInterface`). */
export interface StoreView {
  id: number
  code: string
  website_id: number
  store_group_id: number
  name: string
  sort_order: number
  is_active: number
  extension_attributes?: Record<string, unknown>
}
