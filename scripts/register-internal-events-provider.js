/*
 * <license header>
 */

const { defineCustomInstallationStep } = require('@adobe/aio-commerce-lib-app/management')

module.exports = defineCustomInstallationStep(async (config, context) => {
  const { logger } = context
  logger.info('Running custom installation step: register-internal-events-provider')

  // TODO: Implement step logic per migration plan §5.1 and Reinterpretation §11 item 1 (Internal I/O Events Provider — BLOCKING).
  // Purpose: Create the custom Adobe I/O Events provider "Price Change Internal Events" and register
  //          its two event types that replace the RabbitMQ topics:
  //            - com.dish.pricechange.prerenewal.received  (consumed by Flow 1 pre-renewal-persist-consumer)
  //            - com.dish.pricechange.reporting.queued      (consumed by Flow 4 reporting-delivery-consumer)
  // Expected outcome: provider + event metadata registered; provider id/label persisted so
  //          lib/events/publisher (§5.5) and the EventConsumerActions can bind to it.
  // Toolkit primitives available: CreateEvents / OnboardEvents / ProviderManager / EventMetadataManager
  //          from '@adobe-commerce/aio-toolkit'.
  // BLOCKING decision to confirm (§11 item 1): one custom provider + PublishEvent/EventConsumerAction
  //          (recommended) vs. synchronous Openwhisk fan-out (this step is removed) vs. bridged external broker.

  return {
    status: 'success',
    message: 'TODO: implement register-internal-events-provider',
    timestamp: new Date().toISOString()
  }
})
