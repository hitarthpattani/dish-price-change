/*
 * <license header>
 */

/* Price-change eligibility engine — plan §8.4.d. Flow 3. */

import { EligibilityResult } from '@lib/price-change/eligibility/types'

/**
 * Evaluate state/plan/offer/RTP/collection + package-level eligibility for a subscription
 * (plan §8.4.d).
 *
 * Dependencies: lib/adobe-commerce/catalog, lib/price-change/package-pricing, businessConfig
 * (`rtp_days`, `partners_enabled`).
 *
 * BLOCKING — Reinterpretation §11 item 2 (Custom Pricing & Bundle Data Sources): the plan/offer
 * pricing and bundle GUID associations this reads come from custom Dish modules, not stock Commerce
 * APIs. Resolve the data-access approach before implementing.
 */
export function checkEligibility(
  _subscription: Record<string, unknown>,
  _pricing: Record<string, unknown>,
  _opts: Record<string, unknown>
): EligibilityResult {
  // TODO: Implement per migration plan §8.4.d "eligibility"
  throw new Error('TODO: implement checkEligibility')
}
