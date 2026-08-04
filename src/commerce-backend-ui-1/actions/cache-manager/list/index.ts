/**
 * GET /cache-keys - List all cache keys with metadata
 *
 * This action retrieves all cache entries from Adobe I/O Runtime State
 * that match the configured key prefix. Each entry includes metadata
 * such as key, value, and expiration information.
 *
 * @endpoint POST|GET /cache-keys
 *
 * @param {Object} params - Request parameters (none required)
 *
 * @returns {Object} Success response with cache keys array
 * @returns {Array<Object>} keys - Array of cache entries
 * @returns {string} keys[].id - Cache key identifier
 * @returns {string} keys[].key - Uppercase cache key
 * @returns {any} keys[].value - Cached value
 * @returns {string} keys[].expiration - Expiration timestamp or 'N/A'
 *
 * @throws {Error} 500 - If cache retrieval operation fails
 *
 * @example Success response
 * {
 *   "keys": [
 *     {
 *       "id": "product_mapping",
 *       "key": "PRODUCT_MAPPING",
 *       "value": { ... },
 *       "expiration": "2024-12-31T23:59:59Z"
 *     }
 *   ]
 * }
 */
import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { CacheManager } from '@lib/utils/cache-manager'

export const main = RuntimeAction.execute(
  'cache-keys-list',
  [HttpMethod.POST, HttpMethod.GET],
  [], // No required parameters
  ['authorization', 'x-gw-ims-org-id'], // Required headers
  async (_params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Starting cache keys list operation')

      // Initialize cache manager
      const cacheManager = new CacheManager()

      // Retrieve all cache keys
      const allCacheKeys = await cacheManager.listCache()

      logger.info(`Successfully retrieved ${allCacheKeys.length} cache key(s)`)

      // Return response with metadata
      return RuntimeActionResponse.success({
        keys: allCacheKeys,
        count: allCacheKeys.length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      const errorMessage = toErrorMessage(error)
      logger.error('Cache keys list operation failed:', errorMessage)

      // Log stack trace for debugging
      if (error instanceof Error && error.stack) {
        logger.debug('Stack trace:', error.stack)
      }

      return RuntimeActionResponse.error(500, `Failed to retrieve cache keys: ${errorMessage}`)
    }
  }
)

/** Mirrors the original `error?.message || error?.toString() || 'Unknown error'` fallback. */
function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}
