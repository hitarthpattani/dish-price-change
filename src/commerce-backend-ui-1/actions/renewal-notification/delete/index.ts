/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'

/**
 * delete — package `renewal-notification`.
 *
 * Admin-invoked REST entry point: POST|DELETE renewal-notification/delete — `ids` (ABDB record
 * identifiers) in the request body. Used by the row-level and mass delete actions on the Manage
 * Renewal Notifications admin screen; returns the refreshed notification list.
 *
 * AUTH: Adobe IMS S2S, `require-adobe-auth: true` (admin-invoked from the SPA).
 */
export const main = RuntimeAction.execute(
  'delete',
  [HttpMethod.POST, HttpMethod.DELETE],
  ['ids'],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal notifications delete action called')

      const ids = params.ids as string[]

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new PrerenewalNotificationsRepository(accessToken)

      await repository.deleteNotifications(ids)

      const notifications = await repository.listNotifications()

      return RuntimeActionResponse.success({
        notifications,
        count: notifications.length
      })
    } catch (error) {
      logger.error('Unexpected error in delete action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
