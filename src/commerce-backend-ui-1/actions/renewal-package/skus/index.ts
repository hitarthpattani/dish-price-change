/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { AdobeCommerceCatalogClient } from '@lib/adobe-commerce/catalog'
import type { ProductSearchResponse } from '@lib/adobe-commerce/catalog/types'

/** Shape returned by `AdobeCommerceClient.get()`. */
interface CommerceResult {
  success: boolean
  message: ProductSearchResponse | string
}

/**
 * skus (plan §8.4.e) — package `renewal-package`.
 *
 * SPA-invoked read API returning the SKUs available for the `packages` field's
 * `MULTISELECT_SEARCH` options, sourced from Adobe Commerce's enabled product catalog
 * (`AdobeCommerceCatalogClient.fetchEnabledPackageProducts`). Web action (require-adobe-auth:
 * true), called directly from the SPA with actionCallHeaders — no apis.config REST mapping needed
 * (see GENERATOR-DELTA §16). Only Commerce OAuth1 credentials are needed here (no ABDB access, so
 * no IMS S2S token generation).
 */
export const main = RuntimeAction.execute(
  'skus',
  [HttpMethod.GET],
  [],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal package skus action called')

      const catalogClient = new AdobeCommerceCatalogClient(params)
      const result = (await catalogClient.fetchEnabledPackageProducts()) as CommerceResult

      if (!result.success) {
        throw new Error(result.message as string)
      }

      const skus = (result.message as ProductSearchResponse).items.map(product => product.sku)

      return RuntimeActionResponse.success({ skus })
    } catch (error) {
      logger.error('Unexpected error in skus action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
