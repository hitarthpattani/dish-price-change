/*
 * <license header>
 */

/* This file exposes the ConfigurationScopeChain class */

import type { ScopeTreeNode, WebsiteScopeNode } from '@lib/utils/store-scope-tree/types'
import type { ScopeChainEntry } from '@lib/utils/configuration-scope-chain/types'

/**
 * Resolves the `default` -> `website` -> `store` configuration scope inheritance chain from a
 * Commerce scope tree, matching Adobe Commerce's own configuration fallback model.
 */
export class ConfigurationScopeChain {
  private static readonly DEFAULT_ENTRY: ScopeChainEntry = { scope: 'default', scopeId: 0 }

  /**
   * Resolves the configuration scope inheritance chain for a given scope, ordered from
   * broadest to narrowest (`default` -> `website` -> `store`).
   *
   * - `default` resolves to just `[default]`.
   * - `website` resolves to `[default, website]`.
   * - `store` resolves to `[default, website, store]`, with the website looked up from the
   *   scope tree. If the store view can't be found in the tree (e.g. a stale cache), the
   *   website layer is skipped rather than failing the whole lookup.
   * - Any other scope value is returned as a single-entry chain (no known hierarchy to
   *   inherit from).
   *
   * @param scopeTree - Scope tree returned by `StoreScopeTree.build()`.
   * @param scope - Target configuration scope (e.g. `default`, `website`, `store`).
   * @param scopeId - Target scope's identifier.
   * @returns The resolved chain, broadest first.
   *
   * @example
   * ```typescript
   * const chain = ConfigurationScopeChain.resolve(scopeTree, 'store', 23);
   * // [{ scope: 'default', scopeId: 0 }, { scope: 'website', scopeId: 5 }, { scope: 'store', scopeId: 23 }]
   * ```
   */
  public static resolve(
    scopeTree: ScopeTreeNode[],
    scope: string,
    scopeId: number
  ): ScopeChainEntry[] {
    if (scope === 'default') {
      return [ConfigurationScopeChain.DEFAULT_ENTRY]
    }

    if (scope === 'website') {
      return [ConfigurationScopeChain.DEFAULT_ENTRY, { scope: 'website', scopeId }]
    }

    if (scope === 'store') {
      const website = ConfigurationScopeChain.findWebsiteForStore(scopeTree, scopeId)
      const chain: ScopeChainEntry[] = [ConfigurationScopeChain.DEFAULT_ENTRY]
      if (website) {
        chain.push({ scope: 'website', scopeId: website.scopeId })
      }
      chain.push({ scope: 'store', scopeId })
      return chain
    }

    return [{ scope, scopeId }]
  }

  /**
   * Finds the website in the scope tree that a store view belongs to, by searching each
   * website's store groups for a matching store view scopeId.
   *
   * @param scopeTree - Scope tree returned by `StoreScopeTree.build()`.
   * @param storeScopeId - `scopeId` of the store view to find the parent website for.
   * @returns The owning `WebsiteScopeNode`, or `undefined` if not found (e.g. a stale cached
   *   tree that no longer contains this store view).
   */
  private static findWebsiteForStore(
    scopeTree: ScopeTreeNode[],
    storeScopeId: number
  ): WebsiteScopeNode | undefined {
    return scopeTree.find(
      (node): node is WebsiteScopeNode =>
        node.scope === 'website' &&
        node.children.some(storeGroup =>
          storeGroup.children.some(storeView => storeView.scopeId === storeScopeId)
        )
    )
  }
}
