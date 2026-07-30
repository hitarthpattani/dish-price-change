/*
 * <license header>
 */

/* Types for the plan/offer package-pricing cache — plan §8.4.d. */

/** Map of package SKU → resolved plan/offer pricing detail. */
export type PricingMap = Record<string, Record<string, unknown>>
