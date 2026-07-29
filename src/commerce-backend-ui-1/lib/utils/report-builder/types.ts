/*
 * <license header>
 */

/* Types for the UMS report-row builder — plan §5.5. */

/** A single UMS report row (plan §5.5). */
export interface ReportRow {
  uuid: string
  user_guid: string
  event_type: string
  origin: string
  processing_step: string
  is_eligible: boolean
  reason: string
  message: unknown
  status: 'success' | 'fail' | 'NA'
  source: string
}
