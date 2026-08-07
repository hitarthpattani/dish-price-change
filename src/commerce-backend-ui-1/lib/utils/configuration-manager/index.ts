/*
 * <license header>
 */

import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { CacheManager } from '@lib/utils/cache-manager'
import type { ScopeTreeNode } from '@lib/utils/store-scope-tree/types'

/** Prefix for the cache key the merged configuration map is stored under, per scope/scopeId. */
const CACHE_KEY_PREFIX = 'CONFIGURATION_'

/** Scope applied when the caller does not specify one. */
const DEFAULT_SCOPE = 'default'

/** Scope id applied when the caller does not specify one. */
const DEFAULT_SCOPE_ID = 0

/**
 * Configuration Manager Utility Class
 *
 * Cache-first reader for a single configuration value at a given scope. Rather than caching
 * one entry per configuration key, the entire merged configuration map for a scope/scopeId
 * (as returned by `ConfigurationRepository.all()`) is cached under one JSON-serialized key via
 * `CacheManager`, so repeated lookups for different keys at the same scope only cost one
 * cache read instead of one ABDB round trip per key.
 *
 * @example
 * ```typescript
 * const configurationManager = new ConfigurationManager(accessToken, scopeTree);
 * const value = await configurationManager.get('price_change_enable', 'store', 23);
 * ```
 */
export class ConfigurationManager {
  private configurationRepository: ConfigurationRepository
  private cacheManager: CacheManager

  /**
   * @param token - A valid IMS access token used to authenticate ABDB requests.
   * @param scopeTree - Commerce scope tree (see `StoreScopeTree.build()`), used to resolve the
   *   `default` -> `website` -> `store` inheritance chain.
   */
  constructor(token: string, scopeTree: ScopeTreeNode[]) {
    this.configurationRepository = new ConfigurationRepository(token, scopeTree)
    this.cacheManager = new CacheManager()
  }

  /**
   * Retrieves a single configuration value for a scope, reading the merged configuration map
   * from cache when present, or from `ConfigurationRepository` on a cache miss.
   *
   * @param key - Configuration key to retrieve.
   * @param scope - Configuration scope to read from (e.g. `default`, `website`, `store`).
   *   Defaults to `default`.
   * @param scopeId - Identifier of the scope entity to read from. Defaults to `0`.
   * @returns Configuration value, or `null` if not found.
   */
  public async get(
    key: string,
    scope: string = DEFAULT_SCOPE,
    scopeId: number = DEFAULT_SCOPE_ID
  ): Promise<string | null> {
    const configuration = await this.loadConfiguration(scope, scopeId)
    return configuration[key] ?? null
  }

  /**
   * Returns the cached configuration map for a scope when present, otherwise fetches the
   * merged map from `ConfigurationRepository` and caches it for subsequent calls.
   *
   * @param scope - Configuration scope to read from.
   * @param scopeId - Identifier of the scope entity to read from.
   * @returns The merged configuration map for the scope.
   */
  private async loadConfiguration(scope: string, scopeId: number): Promise<Record<string, string>> {
    const cacheKey = ConfigurationManager.buildCacheKey(scope, scopeId)

    const cached = await this.loadCachedConfiguration(cacheKey)
    if (cached) {
      return cached
    }

    const configuration = await this.configurationRepository.all(scope, scopeId)
    await this.saveCachedConfiguration(cacheKey, configuration)
    return configuration
  }

  /**
   * Loads the configuration map from cache, treating any cache read failure as a cache miss
   * so a `CacheManager`/State outage never blocks falling through to a fresh repository read.
   *
   * @param cacheKey - Cache key to read.
   * @returns The cached configuration map, or `undefined` on a cache miss or read failure.
   */
  private async loadCachedConfiguration(
    cacheKey: string
  ): Promise<Record<string, string> | undefined> {
    try {
      return (await this.cacheManager.loadCache(cacheKey)) as Record<string, string> | undefined
    } catch {
      return undefined
    }
  }

  /**
   * Caches the merged configuration map, swallowing failures — a cache write failure must not
   * prevent returning the freshly read configuration to the caller.
   *
   * @param cacheKey - Cache key to write.
   * @param configuration - Merged configuration map to cache.
   */
  private async saveCachedConfiguration(
    cacheKey: string,
    configuration: Record<string, string>
  ): Promise<void> {
    try {
      await this.cacheManager.saveCache(cacheKey, configuration)
    } catch {
      // Best-effort cache write; the caller still gets the freshly read configuration.
    }
  }

  /**
   * Builds the cache key the merged configuration map is stored under for a scope/scopeId.
   *
   * @param scope - Configuration scope.
   * @param scopeId - Identifier of the scope entity.
   * @returns The scope-specific cache key.
   */
  private static buildCacheKey(scope: string, scopeId: number): string {
    return `${CACHE_KEY_PREFIX}${scope.toUpperCase()}_${scopeId}`
  }
}
