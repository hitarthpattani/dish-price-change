/*
 * <license header>
 */

/* This file defines types for the Adobe Commerce Website client */

/** Adobe Commerce store website (`Magento\Store\Api\Data\WebsiteInterface`). */
export interface Website {
  id: number
  code: string
  name: string
  sort_order: number
  default_group_id: number
  extension_attributes?: Record<string, unknown>
}
