/*
 * <license header>
 */

/* This file defines types for the Configuration Scope helper */

/** Scope and scope id resolved from action params, or `undefined` to fall back to repository defaults. */
export interface ResolvedScope {
  scope: string | undefined
  scopeId: number | undefined
}
