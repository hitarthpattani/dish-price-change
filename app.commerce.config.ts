import { defineConfig } from '@adobe/aio-commerce-lib-app/config'

export default defineConfig({
  metadata: {
    id: 'dish-price-change',
    displayName: 'Price Change Manager',
    version: '1.0.0',
    description:
      'Automates subscription package price changes at renewal — webhook/CSV ingestion, ' +
      'eligibility evaluation, billing-platform and partner price updates, and outcome reporting.'
  },
  // NOTE: businessConfig / eventing / webhooks keys are intentionally OMITTED here.
  // Per-flow builds (commerce-app-builder-generator Phase 3) re-introduce each key the
  // first time a flow declares an entry:
  //   businessConfig.schema[]  — Flow 1 §6.4.g, Flow 3 §8.4.g, Flow 4 §9.4.g, Flow 5 §10.4.g
  //   eventing.external[]      — Flow 1 §6.4.c, Flow 2 §7.4.c, Flow 3 §8.4.c, Flow 4 §9.4.c
  //   eventing.commerce[]      — stays empty (module subscribes to no Commerce platform events)
  //   webhooks[]               — stays empty (module is fully asynchronous)
  installation: {
    messages: {
      preInstallation:
        'Before installing, obtain: the Recurly Basic auth token, the Partner Billing Platform ' +
        '(Ping) key/secret and token URL, and the UMS reporting API credentials.',
      postInstallation:
        'Configure the Recurly endpoint/auth, the Partner Billing endpoint/JWT, the UMS reporting ' +
        'endpoint, and the Active/Pause package SKU→date mappings before enabling the price-change cron.'
    },
    customInstallationSteps: [
      {
        script: './scripts/register-internal-events-provider.js',
        name: 'Register Internal Events Provider',
        description:
          'Creates the custom Adobe I/O Events provider and its two event types ' +
          '(prerenewal.received, reporting.queued) that replace the RabbitMQ topics.'
      }
    ]
  }
})
