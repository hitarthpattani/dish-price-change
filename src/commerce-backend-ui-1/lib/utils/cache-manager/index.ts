/*
 * <license header>
 */

import { State } from '@adobe/aio-sdk'
import type { AioState } from '@lib/utils/cache-manager/types'

/**
 * Cache Manager Utility Class
 *
 * Provides a centralized interface for managing cached data using State
 * as the underlying storage mechanism.
 *
 * @example
 * ```typescript
 * const cacheManager = new CacheManager(3600, 'myapp_');
 * await cacheManager.saveCache('user_123', userData, 7200);
 * const data = await cacheManager.loadCache('user_123');
 * console.log(data); // { id: ... }
 * ```
 */
export class CacheManager {
  private state: AioState | null
  private stateInitPromise: Promise<AioState> | null
  private ttl: number
  private keyPrefix: string

  /**
   * Creates a new CacheManager instance
   *
   * @param ttl - Default Time-To-Live in seconds for cached items (default: 3600)
   * @param keyPrefix - Prefix to be added to all cache keys (default: 'cache_')
   * @throws {Error} If ttl is negative or keyPrefix is empty
   */
  constructor(ttl: number = 3600, keyPrefix: string = 'CACHE_') {
    if (ttl < 0) {
      throw new Error('TTL must be a non-negative number')
    }
    if (!keyPrefix || keyPrefix.trim() === '') {
      throw new Error('Key prefix cannot be empty')
    }

    this.ttl = ttl
    this.keyPrefix = keyPrefix
    this.state = null
    this.stateInitPromise = null
  }

  /**
   * Adds the prefix to the cache key
   *
   * @param key - The cache key (without prefix)
   * @returns The cache key with prefix
   * @throws {Error} If key is invalid or empty
   *
   * @example
   * ```typescript
   * const key = cacheManager.addPrefix('user_123');
   * console.log(key); // 'CACHE_user_123'
   * ```
   */
  private addPrefix(key: string): string {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      throw new Error('Cache key must be a non-empty string')
    }
    return `${this.keyPrefix}${key}`
  }

  /**
   * Removes the prefix from the cache key
   *
   * @param key - The cache key (with prefix)
   * @returns The cache key without prefix
   * @throws {Error} If key is invalid
   *
   * @example
   * ```typescript
   * const key = cacheManager.removePrefix('CACHE_user_123');
   * console.log(key); // 'user_123'
   * ```
   */
  private removePrefix(key: string): string {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      throw new Error('Cache key must be a non-empty string')
    }
    return key.replace(this.keyPrefix, '')
  }

  /**
   * Cache values are stored as JSON strings; parse them back, falling back to the
   * raw string for values that were never JSON (defensive, pre-existing entries).
   */
  private parseValue(raw: string): unknown {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }

  /**
   * Initializes and returns the State client (singleton pattern)
   * Ensures only one State initialization occurs even with concurrent calls
   *
   * @returns Promise resolving to the initialized State client
   * @throws {Error} If State initialization fails
   * @private
   */
  private async getState(): Promise<AioState> {
    if (this.state) {
      return this.state
    }

    if (this.stateInitPromise) {
      return this.stateInitPromise
    }

    this.stateInitPromise = State.init()
    this.state = await this.stateInitPromise
    this.stateInitPromise = null

    return this.state
  }

  /**
   * Loads a cached value by its key
   *
   * @param key - The cache key (without prefix)
   * @returns Promise resolving to the cached value, or undefined if not found
   * @throws {Error} If key is invalid or retrieval fails
   *
   * @example
   * ```typescript
   * const userData = await cacheManager.loadCache('user_123');
   * ```
   */
  public async loadCache(key: string): Promise<unknown> {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      throw new Error('Cache key must be a non-empty string')
    }

    try {
      const state = await this.getState()
      const entry = await state.get(this.addPrefix(key))
      return entry ? this.parseValue(entry.value) : undefined
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to load cache for key "${key}": ${message}`)
    }
  }

  /**
   * Saves a value to cache with optional TTL override
   *
   * @param key - The cache key (without prefix)
   * @param item - The value to cache
   * @param ttl - Optional TTL in seconds (overrides default)
   * @returns Promise that resolves when save is complete
   * @throws {Error} If key is invalid, item is undefined, or save fails
   *
   * @example
   * ```typescript
   * await cacheManager.saveCache('user_123', userData, 7200);
   * ```
   */
  public async saveCache(
    key: string,
    item: unknown,
    ttl: number | undefined = undefined
  ): Promise<void> {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      throw new Error('Cache key must be a non-empty string')
    }
    if (item === undefined) {
      throw new Error('Cache item cannot be undefined')
    }
    if (ttl !== undefined && (typeof ttl !== 'number' || ttl < 0)) {
      throw new Error('TTL must be a non-negative number')
    }

    try {
      const state = await this.getState()
      await state.put(this.addPrefix(key), JSON.stringify(item), {
        ttl: ttl !== undefined ? ttl : this.ttl
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to save cache for key "${key}": ${message}`)
    }
  }

  /**
   * Deletes one or more cache entries
   *
   * @param keys - Array of cache keys to delete (without prefix)
   * @returns Promise resolving to true if deletion succeeds
   * @throws {Error} If keys array is invalid or deletion fails
   *
   * @example
   * ```typescript
   * await cacheManager.deleteCache(['user_123', 'user_456']);
   * ```
   */
  public async deleteCache(keys: string[]): Promise<boolean> {
    if (!Array.isArray(keys)) {
      throw new Error('Keys must be an array')
    }
    if (keys.length === 0) {
      throw new Error('Keys array cannot be empty')
    }
    if (keys.some(key => !key || typeof key !== 'string' || key.trim() === '')) {
      throw new Error('All keys must be non-empty strings')
    }

    try {
      const state = await this.getState()
      await Promise.all(
        keys.map(async (key: string) => {
          await state.delete(this.addPrefix(key))
        })
      )
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to delete cache keys: ${message}`)
    }
  }

  /**
   * Lists all cache entries with the configured prefix
   *
   * @returns Promise resolving to array of cache items with metadata
   * @throws {Error} If listing fails
   *
   * @example
   * ```typescript
   * const allCaches = await cacheManager.listCache();
   * console.log(allCaches); // [{ id: 'user_123', key: 'USER_123', value: {...}, expiration: '...' }]
   * ```
   */
  public async listCache(): Promise<
    Array<{ id: string; key: string; value: unknown; expiration: string }>
  > {
    try {
      const state = await this.getState()
      const allKeys: string[] = []

      // Collect all keys matching the prefix
      for await (const { keys } of state.list({ match: this.addPrefix('*') })) {
        allKeys.push(...keys)
      }

      // Load each entry directly (value + expiration) and strip the prefix
      const cacheItems = await Promise.all(
        allKeys.map(async (prefixedKey: string) => {
          const key = this.removePrefix(prefixedKey)
          const entry = await state.get(prefixedKey)

          return {
            id: key,
            key: key.toUpperCase(),
            value: entry ? this.parseValue(entry.value) : undefined,
            expiration: entry?.expiration ?? 'N/A'
          }
        })
      )

      return cacheItems
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to list cache: ${message}`)
    }
  }
}
