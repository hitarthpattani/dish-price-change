/*
 * <license header>
 */

/* UMS report-row builder — plan §5.5. Consumed by Flow 1, 2, 3, 4. */

import { ReportRow } from '@lib/utils/report-builder/types'
import { FLOW_CODE } from '@lib/utils/logger'

/**
 * Report Builder Utility
 *
 * Builds UMS report rows from a notification and processing outcome (plan §5.5).
 *
 * @example
 * ```typescript
 * const row = ReportBuilder.build(notification, false, error, 'fail', 'message_consumption');
 * ```
 */
export class ReportBuilder {
  /**
   * Builds a UMS report row from a notification and processing outcome.
   *
   * @param notification - Notification/event payload the row reports on. `uuid`, `user_guid`,
   *   `event_type`, and `source` are read from it when present.
   * @param eligible - Whether the record was eligible for processing at this step.
   * @param message - Outcome detail — an `Error`, a string, or any serializable value — recorded
   *   verbatim in `message` and summarized into `reason`.
   * @param status - Outcome of the processing step.
   * @param step - Processing step that produced this row (e.g. `message_consumption`).
   * @returns The assembled UMS report row.
   */
  public static build(
    notification: Record<string, unknown>,
    eligible: boolean,
    message: unknown,
    status: 'success' | 'fail' | 'NA',
    step: string
  ): ReportRow {
    const uuid = typeof notification.uuid === 'string' ? notification.uuid : ''
    const userGuid = typeof notification.user_guid === 'string' ? notification.user_guid : uuid
    const eventType = typeof notification.event_type === 'string' ? notification.event_type : ''
    const origin = typeof notification.source === 'string' ? notification.source : ''

    return {
      uuid,
      user_guid: userGuid,
      event_type: eventType,
      origin,
      processing_step: step,
      is_eligible: eligible,
      reason: ReportBuilder.buildReason(message),
      message,
      status,
      source: FLOW_CODE
    }
  }

  /**
   * Summarizes an outcome value into a human-readable reason string.
   *
   * @param message - Outcome detail to summarize.
   * @returns `message.message` for an `Error`, the value itself for a string, `''` for
   *   `null`/`undefined`, or the value's string coercion otherwise.
   */
  private static buildReason(message: unknown): string {
    if (message instanceof Error) {
      return message.message
    }

    if (message === null || message === undefined) {
      return ''
    }

    return typeof message === 'string' ? message : String(message)
  }
}
