/*
 * <license header>
 */

/* This file defines types for the Configuration Scope Chain utility */

/** One layer of a resolved configuration scope inheritance chain. */
export interface ScopeChainEntry {
  scope: string
  scopeId: number
}
