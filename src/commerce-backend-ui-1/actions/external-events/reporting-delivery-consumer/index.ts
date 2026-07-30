/*
 * <license header>
 */

import { EventConsumerAction, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'

/**
 * reporting-delivery-consumer (plan §9.4.a) — package `external-events`.
 *
 * EventConsumerAction subscribed to `com.dish.pricechange.reporting.queued` (the subscription was
 * forward-declared in Flow 3 §8.4.c; this action completes it). Replaces the RabbitMQ consumer
 * `sling.ums.reporting.price.change`.
 */
export const main = EventConsumerAction.execute(
  'reporting-delivery-consumer',
  ['data'],
  [],
  async () => {
    // TODO: Implement per migration plan §9.4.a "reporting-delivery-consumer" (Business Logic §12.8)
    //
    // Event source: com.dish.pricechange.reporting.queued (published by price-change-worker).
    // Payload: the reportData batch.
    //
    // Business logic (from plan §9.4.a):
    //   - No-op when businessConfig `reporting_endpoint_url` is blank.
    //   - Acquire the UMS JWT (Reinterpretation §11 item 3 — token source unresolved; TODO).
    //   - Chunk reportData by businessConfig `ums_reporting_api_batch_size`.
    //   - POST each chunk to UMS with 429 retry (`ums_retry_count` / `ums_retry_after` µs).
    //
    // Foundation artifacts to call:
    //   - lib/integrations/ums-reporting → sendReport(...) (batch send + retry)
    //   - lib/utils/logger

    return RuntimeActionResponse.success({
      message: 'TODO: not implemented',
      action: 'reporting-delivery-consumer'
    })
  }
)
