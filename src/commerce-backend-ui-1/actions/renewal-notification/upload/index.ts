/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'
import type { PrerenewalNotificationInput } from '@lib/database/collection/prerenewal-notifications/types'

/** event_type stamped on every row imported from a CSV upload (plan §7.4.a). */
const IMPORTED_EVENT_TYPE = 'renewal.scheduled'

/**
 * upload (plan §7.4.a, formerly renewal-csv-import) — package `renewal-notification`.
 *
 * Admin-invoked REST entry point: POST renewal-notification/upload — CSV content in the request
 * body (columns: `uuid`, `renewal_date`). Replaces the source file-drop + Firebear import
 * pipeline (§11 item 5 — remapped to admin upload).
 *
 * AUTH: Adobe IMS S2S, `require-adobe-auth: true` (admin-invoked from the SPA).
 */
export const main = RuntimeAction.execute(
  'upload',
  [HttpMethod.POST],
  ['content'],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal notifications CSV upload action called')

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new PrerenewalNotificationsRepository(accessToken)

      const rows = repository.parseCsvContent(params.content as string)

      const records: PrerenewalNotificationInput[] = []
      const errors: string[] = []
      let skipped = 0

      rows.forEach((row, index) => {
        const uuid = row.uuid?.trim()
        const renewalDate = row.renewal_date?.trim()

        if (!uuid || !renewalDate) {
          skipped += 1
          errors.push(`Row ${index + 2}: missing uuid or renewal_date`)
          return
        }

        records.push({ uuid, renewal_date: renewalDate, event_type: IMPORTED_EVENT_TYPE })
      })

      const imported = await repository.insertMany(records)

      return RuntimeActionResponse.success({ imported, skipped, errors })
    } catch (error) {
      logger.error('Unexpected error in upload action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
