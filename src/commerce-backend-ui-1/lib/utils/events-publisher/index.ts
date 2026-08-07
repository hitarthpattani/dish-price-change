/*
 * <license header>
 */

/* Internal I/O Events publisher wrapper — plan §5.5. Consumed by Flow 1, 2, 3. */

import { PublishEvent } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { ConfigurationError } from '@lib/utils/errors'

/**
 * Publishes events to the custom "Price Change Internal Events" provider (plan §5.5).
 *
 * Wraps the toolkit `PublishEvent` primitive. Known event types:
 *   - com.dish.pricechange.prerenewal.received  (Flow 1)
 *   - com.dish.pricechange.reporting.queued      (Flow 3 → Flow 4)
 *   - com.dish.pricechange.import.error          (Flow 2 → AJO, out of scope)
 *
 * Reinterpretation §11 item 1 (Internal I/O Events Provider): the provider id/label this binds
 * to is created automatically by aio-commerce-lib-app's built-in externalEventsStep during
 * installation (from the eventing.external config in app.commerce.config.ts). Until that
 * provider/registration model is confirmed, its id is read from the
 * `PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID` param (see `.env.example`), which is expected to be
 * populated once the provider exists.
 *
 * @example
 * ```typescript
 * const eventsPublisher = new EventsPublisher(params);
 * await eventsPublisher.publish('com.dish.pricechange.prerenewal.received', payload);
 * ```
 */
export class EventsPublisher {
  private readonly params: Record<string, unknown>

  /**
   * @param params - Action parameters carrying the IMS OAuth S2S credentials (forwarded to
   *   `GenerateAccessToken`) and `PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID`.
   */
  constructor(params: Record<string, unknown>) {
    this.params = params
  }

  /**
   * Publishes a single event to the internal provider.
   *
   * @param eventType - I/O Events event code to publish.
   * @param payload - Event payload (any serializable object, e.g. a plain notification payload
   *   or a `ReportRow`).
   * @throws {ConfigurationError} When `PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID`,
   *   `IMS_OAUTH_S2S_ORG_ID`, or `IMS_OAUTH_S2S_CLIENT_ID` is missing.
   */
  public async publish(eventType: string, payload: object): Promise<void> {
    const providerId = this.params.PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID
    if (typeof providerId !== 'string' || providerId.trim() === '') {
      throw new ConfigurationError(
        'Missing required parameter PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID'
      )
    }

    const imsOrgId = this.params.IMS_OAUTH_S2S_ORG_ID
    const apiKey = this.params.IMS_OAUTH_S2S_CLIENT_ID
    if (typeof imsOrgId !== 'string' || typeof apiKey !== 'string') {
      throw new ConfigurationError(
        'Missing required parameters IMS_OAUTH_S2S_ORG_ID, IMS_OAUTH_S2S_CLIENT_ID'
      )
    }

    const accessToken = await GenerateAccessToken.execute(this.params)
    const publishEvent = new PublishEvent(imsOrgId, apiKey, accessToken)

    await publishEvent.execute(providerId, eventType, payload)
  }
}
