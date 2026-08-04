/**
 * DELETE /cache-keys - Delete single or multiple cache keys
 *
 * This action removes one or more cache entries from Adobe I/O Runtime State.
 * It supports both single key deletion and bulk deletion operations.
 *
 * @endpoint POST|DELETE /cache-keys
 *
 * @param {Object} params - Request parameters
 * @param {string|string[]} params.keys - Cache key(s) to delete
 *
 * @returns {Object} Success response with operation status
 * @returns {boolean} success - true if deletion succeeded
 *
 * @throws {Error} 400 - If keys parameter is invalid or empty
 * @throws {Error} 500 - If cache deletion operation fails
 *
 * @example Single key deletion
 * POST /cache-keys
 * { "keys": "product_mapping" }
 *
 * @example Multiple keys deletion
 * POST /cache-keys
 * { "keys": ["key1", "key2", "key3"] }
 */
import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { CacheManager } from '@lib/utils/cache-manager'

export const main = RuntimeAction.execute(
  'cache-keys-delete',
  [HttpMethod.POST, HttpMethod.DELETE],
  ['keys'], // Required parameter - can be string or array
  ['authorization', 'x-gw-ims-org-id'], // Required headers
  async (params, ctx) => {
    const { logger } = ctx
    const { keys } = params

    try {
      // Convert single key to array, keep array as is
      const keysArray = Array.isArray(keys) ? keys : [keys]

      // Validate keys array is not empty
      if (keysArray.length === 0) {
        logger.error('Keys array is empty')
        return RuntimeActionResponse.error(400, 'At least one key must be provided')
      }

      // Validate all keys are non-empty strings
      const invalidKeys = keysArray.filter(
        key => !key || typeof key !== 'string' || key.trim() === ''
      )
      if (invalidKeys.length > 0) {
        logger.error(`Invalid keys detected: ${invalidKeys.length} invalid entries`)
        return RuntimeActionResponse.error(400, 'All keys must be non-empty strings')
      }

      // Initialize cache manager
      const cacheManager = new CacheManager()

      // Log the operation
      logger.info(`Deleting ${keysArray.length} cache key(s): ${keysArray.join(', ')}`)

      // Perform deletion
      await cacheManager.deleteCache(keysArray)

      logger.info(`Successfully deleted ${keysArray.length} cache key(s)`)

      return RuntimeActionResponse.success({
        success: true,
        deletedCount: keysArray.length,
        keys: keysArray
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Cache key delete operation failed:`, errorMessage)
      return RuntimeActionResponse.error(500, `Failed to delete cache keys: ${errorMessage}`)
    }
  }
)
