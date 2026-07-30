/*
 * <license header>
 */

/* Types for the Partner Billing Platform batch-response processor — plan §8.4.d. */

/** Result of processing a PBP batch response against the pending subscriptions. */
export interface BatchProcessResult {
  toChange: Record<string, unknown>[]
  retries: Record<string, unknown>[]
  failures: Record<string, unknown>[]
}
