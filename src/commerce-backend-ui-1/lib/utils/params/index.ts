/*
 * <license header>
 */

/* Commerce params / businessConfig / request-context helpers — plan §5.5. Consumed by all flows. */

/**
 * Read a businessConfig value by key from the action params (plan §5.5).
 *
 * businessConfig fields are surfaced to actions as inputs; this resolves a single field
 * (e.g. `price_change_enable`, `recurly_endpoint`) with an optional fallback.
 */
export function getBusinessConfig(
  _params: Record<string, unknown>,
  _key: string,
  _fallback?: unknown
): unknown {
  // TODO: Implement per migration plan §5.5 "lib/utils/params"
  throw new Error('TODO: implement getBusinessConfig')
}

/**
 * Extract the normalized request context (headers, method, invocation metadata) from
 * OpenWhisk action params (plan §5.5).
 */
export function extractRequestContext(_params: Record<string, unknown>): Record<string, unknown> {
  // TODO: Implement per migration plan §5.5 "lib/utils/params"
  throw new Error('TODO: implement extractRequestContext')
}
