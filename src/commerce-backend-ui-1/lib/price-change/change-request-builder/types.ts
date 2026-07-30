/*
 * <license header>
 */

/* Types for the Recurly change-request builder — plan §8.4.d. */

/** Result of building a Recurly change request. */
export interface ChangeRequestResult {
  /** The Recurly change payload (+ partner_packages when partner-billed). */
  request: Record<string, unknown>
  eligible: boolean
}
