/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'

/**
 * remove-renewal-notifications (plan §10.4.a) — package `application-crons`.
 *
 * Alarm-triggered cron (web: 'no'; empty HTTP-method list). Purges finalized notification rows.
 * See triggers.config.yaml / rules.config.yaml (static daily schedule, §11 item 4).
 */
export const main = RuntimeAction.execute('remove-renewal-notifications', [], [], [], async () => {
  // TODO: Implement per migration plan §10.4.a "remove-renewal-notifications" (Business Logic §12.14)
  //
  // Business logic:
  //   - Gate on businessConfig `remove_renewal_notification_cron_enabled`.
  //   - Delete status=1 rows older than `remove_renewal_day_interval` days, capped by `remove_record_batch`.
  //
  // Foundation artifacts to call:
  //   - lib/database/repository/sling-prerenewal-notifications → deleteFinalizedOlderThan(days, batchSize)
  //   - lib/utils/logger

  return RuntimeActionResponse.success({
    message: 'TODO: not implemented',
    action: 'remove-renewal-notifications'
  })
})
