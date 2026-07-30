/*
 * <license header>
 */

/* Types for the price-change eligibility engine — plan §8.4.d. */

/** Outcome of an eligibility check for a subscription. */
export interface EligibilityResult {
  eligible: boolean
  reason: string
}
