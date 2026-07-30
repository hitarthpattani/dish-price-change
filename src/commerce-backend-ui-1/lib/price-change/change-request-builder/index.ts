/*
 * <license header>
 */

/* Recurly change-request builder — plan §8.4.d. Flow 3. */

import { ChangeRequestResult } from '@lib/price-change/change-request-builder/types'

/**
 * Build the Recurly change payload (+ `partner_packages` for partner-billed subscriptions)
 * from a notification and its resolved package pricing (plan §8.4.d).
 */
export function buildChangeRequest(
  _notification: Record<string, unknown>,
  _packagePricing: Record<string, unknown>,
  _partnerBilled: boolean
): ChangeRequestResult {
  // TODO: Implement per migration plan §8.4.d "change-request-builder"
  throw new Error('TODO: implement buildChangeRequest')
}
