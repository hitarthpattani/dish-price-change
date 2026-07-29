/*
 * <license header>
 */

/* Internal I/O Events publisher wrapper — plan §5.5. Consumed by Flow 1, 2, 3. */

/**
 * Publish an event to the custom "Price Change Internal Events" provider (plan §5.5).
 *
 * Wraps the toolkit `PublishEvent` primitive. Known event types:
 *   - com.dish.pricechange.prerenewal.received  (Flow 1)
 *   - com.dish.pricechange.reporting.queued      (Flow 3 → Flow 4)
 *   - com.dish.pricechange.import.error          (Flow 2 → AJO, out of scope)
 *
 * BLOCKING — Reinterpretation §11 item 1 (Internal I/O Events Provider): the provider id/label
 * this binds to is created automatically by aio-commerce-lib-app's built-in externalEventsStep
 * during installation (from the eventing.external config in app.commerce.config.ts).
 * Resolve the provider/registration model before implementing.
 */
export async function publishInternalEvent(
  _eventType: string,
  _payload: Record<string, unknown>
): Promise<void> {
  // TODO: Implement per migration plan §5.5 "lib/events/publisher"
  // Use PublishEvent from '@adobe-commerce/aio-toolkit' to emit `eventType` with `payload`
  // to the internal provider registered automatically by the built-in externalEventsStep.
  throw new Error('TODO: implement publishInternalEvent')
}
