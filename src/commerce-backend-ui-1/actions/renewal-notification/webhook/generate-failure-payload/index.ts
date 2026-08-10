/*
 * <license header>
 */

import { ReportBuilder } from '@lib/utils/report-builder'
import type { ReportRow } from '@lib/utils/report-builder/types'

/** Processing step recorded on a report row built from a `notification` action failure. */
const MESSAGE_CONSUMPTION_STEP = 'message_consumption'

/**
 * Generate Failure Payload Utility
 *
 * Builds the `message_consumption` failure report row for a `notification` action publish
 * failure (plan §6.4.a step 4), ready to be forwarded to the UMS reporting pipeline via
 * `reporting.queued`.
 *
 * @module actions/renewal-notification/webhook/generate-failure-payload
 *
 * @example
 * ```typescript
 * const payload = GenerateFailurePayload.execute(notification, publishError);
 * ```
 */
export class GenerateFailurePayload {
  /**
   * @param notification - Notification payload the failure occurred while publishing.
   * @param publishError - The error raised by the failed publish call.
   * @returns The `message_consumption` failure report row.
   */
  public static execute(notification: Record<string, unknown>, publishError: unknown): ReportRow {
    return ReportBuilder.build(notification, false, publishError, 'fail', MESSAGE_CONSUMPTION_STEP)
  }
}
