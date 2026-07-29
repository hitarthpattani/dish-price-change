/*
 * <license header>
 */

/* UMS report-row builder — plan §5.5. Consumed by Flow 1, 2, 3, 4. */

import { ReportRow } from '@lib/utils/report-builder/types'

/**
 * Build a UMS report row from a notification and processing outcome (plan §5.5).
 */
export function buildReportRow(
  _notification: Record<string, unknown>,
  _eligible: boolean,
  _message: unknown,
  _status: 'success' | 'fail' | 'NA',
  _step: string
): ReportRow {
  // TODO: Implement per migration plan §5.5 "lib/reporting/builder"
  // Purpose: assemble uuid, user_guid, event_type/origin, processing_step, is_eligible,
  //          reason, message, status, source into a ReportRow.
  throw new Error('TODO: implement buildReportRow')
}
