/*
 * <license header>
 */

/* This file exposes the ConfigurationScope class */

import type { ResolvedScope } from '@lib/utils/configuration-scope/types'

/**
 * Resolves the `scope` and `scope_id` action params used to address a row in the
 * `configuration` ABDB collection.
 */
export class ConfigurationScope {
  /**
   * Extracts and normalizes `scope`/`scope_id` from action params.
   *
   * Returns `undefined` for either field when absent or invalid so callers can pass the result
   * straight through to {@link ConfigurationRepository} methods, which default to `default`/`0`.
   *
   * @param params - Action parameters, optionally containing `scope` and `scope_id`.
   */
  public static resolve(params: Record<string, unknown>): ResolvedScope {
    const scope =
      typeof params.scope === 'string' && params.scope.trim() !== '' ? params.scope : undefined

    const rawScopeId = params.scope_id
    let scopeId: number | undefined
    if (typeof rawScopeId === 'number' && Number.isFinite(rawScopeId)) {
      scopeId = rawScopeId
    } else if (
      typeof rawScopeId === 'string' &&
      rawScopeId.trim() !== '' &&
      Number.isFinite(Number(rawScopeId))
    ) {
      scopeId = Number(rawScopeId)
    }

    return { scope, scopeId }
  }
}
