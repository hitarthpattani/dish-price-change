/*
 * <license header>
 */

import { AdobeCommerceWebsiteClient } from '@lib/adobe-commerce/website'
import type { Website } from '@lib/adobe-commerce/website/types'
import { AdobeCommerceStoreGroupClient } from '@lib/adobe-commerce/store-group'
import type { StoreGroup } from '@lib/adobe-commerce/store-group/types'
import { AdobeCommerceStoreViewClient } from '@lib/adobe-commerce/store-view'
import type { StoreView } from '@lib/adobe-commerce/store-view/types'
import { CacheManager } from '@lib/utils/cache-manager'
import type {
  CommerceResult,
  ScopeTreeNode,
  StoreGroupNode,
  StoreViewScopeNode,
  WebsiteScopeNode
} from '@lib/utils/store-scope-tree/types'

/** Cache key the assembled scope tree is stored under (best-effort, via `CacheManager`). */
const CACHE_KEY = 'STORE_SCOPE_TREE'

/** Cache TTL for the assembled scope tree: 360 days, in seconds. Commerce scopes rarely change. */
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 360

/**
 * Store Scope Tree Utility Class
 *
 * Fetches Adobe Commerce websites, store groups, and store views, and assembles them into the
 * Default Config -> Website -> Store Group -> Store View tree used to populate the
 * configuration scope picker. The assembled tree is cached via `CacheManager` so repeated calls
 * skip the three Commerce API calls until the cache entry expires.
 *
 * @example
 * ```typescript
 * const storeScopeTree = new StoreScopeTree(params);
 * const tree = await storeScopeTree.build();
 * ```
 */
export class StoreScopeTree {
  private websiteClient: AdobeCommerceWebsiteClient
  private storeGroupClient: AdobeCommerceStoreGroupClient
  private storeViewClient: AdobeCommerceStoreViewClient
  private cacheManager: CacheManager

  /**
   * Creates a new StoreScopeTree instance
   *
   * @param params - Adobe Commerce connection params (`COMMERCE_BASE_URL`, `COMMERCE_CONSUMER_KEY`,
   *   `COMMERCE_CONSUMER_SECRET`, `COMMERCE_ACCESS_TOKEN`, `COMMERCE_ACCESS_TOKEN_SECRET`), forwarded
   *   as-is to the underlying website/store-group/store-view clients
   * @throws {Error} If `COMMERCE_BASE_URL` is missing (thrown by `AdobeCommerceClient`)
   */
  constructor(params: Record<string, string>) {
    this.websiteClient = new AdobeCommerceWebsiteClient(params)
    this.storeGroupClient = new AdobeCommerceStoreGroupClient(params)
    this.storeViewClient = new AdobeCommerceStoreViewClient(params)
    this.cacheManager = new CacheManager(CACHE_TTL_SECONDS)
  }

  /**
   * Returns the cached scope tree when present, otherwise fetches websites, store groups, and
   * store views, assembles the scope tree, and caches it for subsequent calls
   *
   * @returns Promise resolving to the scope tree, with the "Default Config" scope as the
   *   first element, followed by one `WebsiteScopeNode` per website (each nesting its store
   *   groups, which in turn nest their store views)
   * @throws {Error} If the tree isn't cached and any of the three Commerce API calls fail
   *
   * @example
   * ```typescript
   * const tree = await storeScopeTree.build();
   * console.log(tree[0]); // { scope: 'default', scopeId: 0, label: 'Default Config' }
   * ```
   */
  public async build(): Promise<ScopeTreeNode[]> {
    const cachedTree = await this.loadCachedTree()
    if (cachedTree) {
      return cachedTree
    }

    const tree = await this.fetchTree()
    await this.saveCachedTree(tree)
    return tree
  }

  /**
   * Loads the scope tree from cache, treating any cache read failure as a cache miss so a
   * `CacheManager`/State outage never blocks falling through to a fresh Commerce fetch
   *
   * @returns The cached scope tree, or `undefined` on a cache miss or read failure
   */
  private async loadCachedTree(): Promise<ScopeTreeNode[] | undefined> {
    try {
      return (await this.cacheManager.loadCache(CACHE_KEY)) as ScopeTreeNode[] | undefined
    } catch {
      return undefined
    }
  }

  /**
   * Caches the assembled scope tree, swallowing failures — a cache write failure must not
   * prevent returning the freshly built tree to the caller
   *
   * @param tree - Scope tree to cache
   */
  private async saveCachedTree(tree: ScopeTreeNode[]): Promise<void> {
    try {
      await this.cacheManager.saveCache(CACHE_KEY, tree)
    } catch {
      // Best-effort cache write; the caller still gets the freshly built tree.
    }
  }

  /**
   * Fetches websites, store groups, and store views from Adobe Commerce and assembles the
   * scope tree
   *
   * @returns Promise resolving to the freshly built scope tree
   * @throws {Error} If any of the three Commerce API calls fail
   */
  private async fetchTree(): Promise<ScopeTreeNode[]> {
    const [websitesResult, storeGroupsResult, storeViewsResult] = await Promise.all([
      this.websiteClient.fetchWebsites(),
      this.storeGroupClient.fetchStoreGroups(),
      this.storeViewClient.fetchStoreViews()
    ])

    const websites = this.unwrap<Website>(websitesResult, 'websites')
    const storeGroups = this.unwrap<StoreGroup>(storeGroupsResult, 'store groups')
    const storeViews = this.unwrap<StoreView>(storeViewsResult, 'store views')

    return [
      { scope: 'default', scopeId: 0, label: 'Default Config' },
      ...websites.map(website => this.buildWebsiteNode(website, storeGroups, storeViews))
    ]
  }

  /**
   * Unwraps an `AdobeCommerceClient` result, throwing when the underlying call failed
   *
   * @param result - Raw result returned by an `AdobeCommerceClient.get()` call
   * @param label - Human-readable name of the entity being fetched, used in the error message
   * @returns The list carried in `result.message` when the call succeeded
   * @throws {Error} If `result.success` is `false`
   */
  private unwrap<T>(result: unknown, label: string): T[] {
    const typed = result as CommerceResult<T[]>
    if (!typed.success) {
      throw new Error(`Failed to load ${label} from Adobe Commerce: ${typed.message}`)
    }
    return typed.message
  }

  /**
   * Builds a website scope node, nesting the store groups that belong to it
   *
   * @param website - Website to convert into a scope node
   * @param storeGroups - All store groups fetched from Commerce, filtered down to this website
   * @param storeViews - All store views fetched from Commerce, passed through to child nodes
   * @returns The assembled `WebsiteScopeNode`, including its `StoreGroupNode` children
   */
  private buildWebsiteNode(
    website: Website,
    storeGroups: StoreGroup[],
    storeViews: StoreView[]
  ): WebsiteScopeNode {
    return {
      scope: 'website',
      scopeId: website.id,
      code: website.code,
      label: website.name,
      children: storeGroups
        .filter(storeGroup => storeGroup.website_id === website.id)
        .map(storeGroup => this.buildStoreGroupNode(storeGroup, storeViews))
    }
  }

  /**
   * Builds a store group grouping node, nesting the store views that belong to it
   *
   * @param storeGroup - Store group to convert into a grouping node
   * @param storeViews - All store views fetched from Commerce, filtered down to this store group
   * @returns The assembled `StoreGroupNode`, including its `StoreViewScopeNode` children
   */
  private buildStoreGroupNode(storeGroup: StoreGroup, storeViews: StoreView[]): StoreGroupNode {
    return {
      code: storeGroup.code ?? String(storeGroup.id),
      label: storeGroup.name,
      children: storeViews
        .filter(storeView => storeView.store_group_id === storeGroup.id)
        .map(storeView => this.buildStoreViewNode(storeView))
    }
  }

  /**
   * Builds a store view scope node
   *
   * @param storeView - Store view to convert into a scope node
   * @returns The assembled `StoreViewScopeNode`
   */
  private buildStoreViewNode(storeView: StoreView): StoreViewScopeNode {
    return {
      scope: 'store',
      scopeId: storeView.id,
      code: storeView.code,
      label: storeView.name
    }
  }
}
