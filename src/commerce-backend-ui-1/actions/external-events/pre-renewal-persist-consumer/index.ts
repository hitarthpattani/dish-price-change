/*
 * <license header>
 */

import { EventConsumerAction, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'
import { PrerenewalNotificationSource } from '@lib/database/collection/prerenewal-notifications/types'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { EventsPublisher } from '@lib/utils/events-publisher'
import { ReportBuilder } from '@lib/utils/report-builder'

/** Processing step recorded on a report row built from a persist failure. */
const MESSAGE_CONSUMPTION_STEP = 'message_consumption'

/** Internal event carrying failure report rows to the UMS reporting pipeline (Flow 4). */
const REPORTING_QUEUED_EVENT = 'com.dish.pricechange.reporting.queued'

/**
 * pre-renewal-persist-consumer (plan §6.4.a) — package `external-events`.
 *
 * EventConsumerAction subscribed to `com.dish.pricechange.prerenewal.received` on the custom
 * internal provider (replaces the RabbitMQ consumer `sling.handle.prerenewal.notification`).
 *
 * Reinterpretation §11 item 1 (Internal I/O Events Provider): as with `renewal-notification/webhook`,
 * the failure-report publish target is the provider created automatically by
 * aio-commerce-lib-app's built-in externalEventsStep; its id is read from the
 * `PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID` param (see `.env.example`), assumed to exist.
 */
export const main = EventConsumerAction.execute(
  'pre-renewal-persist-consumer',
  ['data'],
  [],
  async (params, ctx) => {
    const { logger } = ctx
    const notification = params.data as Record<string, unknown>

    try {
      logger.info('Persisting pre-renewal notification')

      if (typeof notification.uuid !== 'string' || notification.uuid.trim() === '') {
        throw new Error('Notification is missing a valid uuid')
      }

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new PrerenewalNotificationsRepository(accessToken)

      // `renewal_date` is required by the collection but not guaranteed on the inbound payload;
      // it falls back to `notification_time` (stamped by the publishing `notification` action),
      // and then to "now", so a missing/malformed upstream field never blocks persisting the row.
      const eventType =
        typeof notification.event_type === 'string' ? notification.event_type : undefined
      const notificationTime =
        typeof notification.notification_time === 'string'
          ? notification.notification_time
          : undefined
      const renewalDate =
        typeof notification.renewal_date === 'string'
          ? notification.renewal_date
          : (notificationTime ?? new Date().toISOString())

      await repository.insertNotification({
        uuid: notification.uuid,
        event_type: eventType,
        notification_time: notificationTime,
        renewal_date: renewalDate,
        source: PrerenewalNotificationSource.WEBHOOK
      })

      return RuntimeActionResponse.success({
        success: true,
        message: 'Pre-renewal notification persisted'
      })
    } catch (error) {
      logger.error('Failed to persist pre-renewal notification:', error)

      // Best-effort: a failure reporting the failure must not mask the original error response.
      try {
        const eventsPublisher = new EventsPublisher(params)
        const reportRow = ReportBuilder.build(
          notification,
          false,
          error,
          'fail',
          MESSAGE_CONSUMPTION_STEP
        )
        await eventsPublisher.publish(REPORTING_QUEUED_EVENT, reportRow)
      } catch (reportError) {
        logger.error('Failed to publish message_consumption failure report:', reportError)
      }

      return RuntimeActionResponse.error(
        500,
        `Failed to persist pre-renewal notification: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
)
