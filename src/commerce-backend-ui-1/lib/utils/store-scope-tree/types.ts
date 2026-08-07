/*
 * <license header>
 */

/* This file defines types for the Store Scope Tree utility */

/** Root "Default Config" entry — always the first element of the tree. */
export interface DefaultScopeNode {
  scope: 'default'
  scopeId: 0
  label: string
}

/** Selectable store view scope, nested under a store group. */
export interface StoreViewScopeNode {
  scope: 'store'
  scopeId: number
  code: string
  label: string
}

/**
 * Store group grouping node. Store groups are not a persisted configuration
 * scope (only `default`/`website`/`store` are), so this node has no `scope`/
 * `scopeId` of its own — it exists purely to group store views under a website.
 */
export interface StoreGroupNode {
  code: string
  label: string
  children: StoreViewScopeNode[]
}

/** Selectable website scope, nested under the default entry. */
export interface WebsiteScopeNode {
  scope: 'website'
  scopeId: number
  code: string
  label: string
  children: StoreGroupNode[]
}

/** Full scope tree: the "Default Config" entry followed by one entry per website. */
export type ScopeTreeNode = DefaultScopeNode | WebsiteScopeNode

/** Successful `AdobeCommerceClient` result shape. */
export interface CommerceSuccess<T> {
  success: true
  message: T
}

/** Failed `AdobeCommerceClient` result shape. */
export interface CommerceFailure {
  success: false
  statusCode?: number
  message: string
}

/** Result shape returned by `AdobeCommerceClient.get()`. */
export type CommerceResult<T> = CommerceSuccess<T> | CommerceFailure
