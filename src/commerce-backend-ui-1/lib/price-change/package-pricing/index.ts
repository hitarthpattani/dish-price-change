/*
 * <license header>
 */

/* Plan/offer package-pricing cache — plan §8.4.d. Flow 3. */

import { PricingMap } from '@lib/price-change/package-pricing/types'

/**
 * Resolve plan/offer package pricing for an event type + plan code (plan §8.4.d). Replaces the
 * custom `sling_changed_pricing_packages` cache type. Dependencies: lib/adobe-commerce/catalog.
 *
 * BLOCKING — Reinterpretation §11 item 2 (Custom Pricing & Bundle Data Sources): pricing comes from
 * custom Dish modules; the storage/cache model is inferred (§8.4.d). Resolve before implementing.
 */
export async function getPlanAndOfferPricing(
  _eventType: string,
  _planCode: string
): Promise<PricingMap> {
  // TODO: Implement per migration plan §8.4.d "package-pricing"
  throw new Error('TODO: implement getPlanAndOfferPricing')
}
