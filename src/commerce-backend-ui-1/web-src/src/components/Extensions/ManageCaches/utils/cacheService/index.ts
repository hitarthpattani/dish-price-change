/*
 * <license header>
 */

import allActions from '@web/config.json'
import actionWebInvoke from '@web/utils'
import type { CacheListResponse } from '../../types'

const actions = allActions as Record<string, string>

/**
 * Cache Service
 *
 * Service layer for interacting with cache management backend actions.
 * Provides methods for listing and deleting cache entries.
 */

/**
 * Creates a cache service instance with authentication headers
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @returns {Object} Service object with cache management methods
 */
export const createCacheService = (actionCallHeaders: Record<string, string>) => {
  /**
   * Lists all cache entries
   *
   * @returns {Promise<CacheListResponse>} Response containing cache entries
   */
  const listCaches = async (): Promise<CacheListResponse> => {
    try {
      const response = await actionWebInvoke(actions['cache-manager/list'], actionCallHeaders, {})
      return response as CacheListResponse
    } catch (error) {
      console.error('Error listing caches:', error)
      throw error
    }
  }

  /**
   * Deletes one or more cache entries
   *
   * @param {string[]} keys - Array of cache keys to delete
   * @returns {Promise<CacheListResponse>} Response after deletion and updated list
   */
  const deleteCaches = async (keys: string[]): Promise<CacheListResponse> => {
    try {
      await actionWebInvoke(actions['cache-manager/delete'], actionCallHeaders, { keys })

      // Return updated list after deletion
      return await listCaches()
    } catch (error) {
      console.error('Error deleting caches:', error)
      throw error
    }
  }

  return {
    listCaches,
    deleteCaches
  }
}
