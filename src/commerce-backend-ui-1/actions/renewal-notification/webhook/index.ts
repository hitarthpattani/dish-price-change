/*
 * <license header>
 */

import {
  RuntimeAction,
  RuntimeActionResponse,
  HttpMethod,
  HttpStatus
} from '@adobe-commerce/aio-toolkit'
import { ConfigurationManager } from '@lib/utils/configuration-manager'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { StoreScopeTree } from '@lib/utils/store-scope-tree'
import { EventsPublisher } from '@lib/utils/events-publisher'
import { GenerateFailurePayload } from './generate-failure-payload'

/** businessConfig key gating the price-change feature (plan §6.4.a step 1). */
const PRICE_CHANGE_ENABLE_KEY = 'price_change_enable'

/** Stored value meaning the feature is enabled, matching the Configurations form's toggle. */
const ENABLED_VALUE = '1'

/** event_type values accepted for price-change processing (plan §6.4.a step 3); others are ignored. */
const ACCEPTED_EVENT_TYPES = ['renewal.scheduled', 'resumed']

/** Internal event published on success (plan §6.4.a step 4). */
const PRERENEWAL_RECEIVED_EVENT = 'com.dish.pricechange.prerenewal.received'

/** Internal event carrying failure report rows to the UMS reporting pipeline (Flow 4). */
const REPORTING_QUEUED_EVENT = 'com.dish.pricechange.reporting.queued'

/**
 * webhook (plan §6.4.a, formerly renewal-notification-receiver) — package `renewal-notification`.
 *
 * Public REST entry point: POST v1/renewalNotification (source: POST /V1/renewalNotification).
 *
 * AUTH (Reinterpretation §11 item 7 — RESOLVED): authenticated via Adobe IMS S2S with
 * `require-adobe-auth: true` (see actions.config.yaml). The upstream caller must present a valid
 * IMS/S2S bearer token; the in-handler HTTP Basic check from the source module is intentionally
 * dropped (no price_change_auth_username/password config).
 */
export const main = RuntimeAction.execute(
  'webhook',
  [HttpMethod.POST],
  ['uuid', 'event_type'],
  [],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal notification received')

      // Step 1 (plan §6.4.a): gate on the scoped `price_change_enable` flag (default scope
      // only — see the Configurations form) rather than a static businessConfig entry, matching
      // this module's move to the scoped ABDB `configuration` collection for this key.
      const [accessToken, scopeTree] = await Promise.all([
        GenerateAccessToken.execute(params),
        new StoreScopeTree(params).build()
      ])
      const configurationManager = new ConfigurationManager(accessToken, scopeTree)
      const priceChangeEnabled = await configurationManager.get(PRICE_CHANGE_ENABLE_KEY)

      if (priceChangeEnabled !== ENABLED_VALUE) {
        logger.info('Price change feature disabled; ignoring renewal notification')
        return RuntimeActionResponse.success({
          success: true,
          message: 'Price change feature disabled; notification ignored'
        })
      }

      // Step 3 (plan §6.4.a): only renewal.scheduled/resumed events feed the price-change queue.
      const eventType = params.event_type as string
      if (!ACCEPTED_EVENT_TYPES.includes(eventType)) {
        logger.info(`Ignoring unsupported event_type "${eventType}"`)
        return RuntimeActionResponse.success({
          success: true,
          message: `Unsupported event_type "${eventType}"; notification ignored`
        })
      }

      // Step 2 (plan §6.4.a): stamp notification_time on the payload forwarded downstream.
      // Only the fields `pre-renewal-persist-consumer` actually persists are forwarded — an
      // allowlist, rather than passing through whatever else the webhook happened to send.
      const notification: Record<string, unknown> = {
        uuid: params.uuid,
        event_type: eventType,
        notification_time: new Date().toISOString()
      }
      if (typeof params.renewal_date === 'string') {
        notification.renewal_date = params.renewal_date
      }

      // Step 4 (plan §6.4.a): publish to the internal provider; report + 422 on failure.
      const eventsPublisher = new EventsPublisher(params)
      try {
        await eventsPublisher.publish(PRERENEWAL_RECEIVED_EVENT, notification)
      } catch (publishError) {
        logger.error('Failed to publish prerenewal notification event:', publishError)

        // Best-effort: a failure reporting the failure must not mask the original 422.
        try {
          const failurePayload = GenerateFailurePayload.execute(notification, publishError)
          await eventsPublisher.publish(REPORTING_QUEUED_EVENT, failurePayload)
        } catch (reportError) {
          logger.error('Failed to publish message_consumption failure report:', reportError)
        }

        // 422 per the plan's output contract; not in the toolkit's HttpStatus enum.
        return RuntimeActionResponse.error(
          422 as HttpStatus,
          `Failed to publish renewal notification: ${
            publishError instanceof Error ? publishError.message : String(publishError)
          }`
        )
      }

      return RuntimeActionResponse.success({
        success: true,
        message: 'Renewal notification published'
      })
    } catch (error) {
      logger.error('Unexpected error in notification action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
