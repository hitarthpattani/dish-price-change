/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'

/**
 * list — package `renewal-notification`.
 *
 * Admin-invoked REST entry point: GET|POST renewal-notification/list. Lists queued
 * `prerenewal_notifications` rows (most recently created first) for the Manage Renewal
 * Notifications admin screen.
 *
 * AUTH: Adobe IMS S2S, `require-adobe-auth: true` (admin-invoked from the SPA).
 */
export const main = RuntimeAction.execute(
  'list',
  [HttpMethod.GET, HttpMethod.POST],
  [],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal notifications list action called')

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new PrerenewalNotificationsRepository(accessToken)

      const notifications = await repository.listNotifications()

      return RuntimeActionResponse.success({
        notifications,
        count: notifications.length
      })
    } catch (error) {
      logger.error('Unexpected error in list action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
