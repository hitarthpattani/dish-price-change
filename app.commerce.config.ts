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
  businessConfig: {
    schema: [
      // Flow 1 §6.4.g — more fields added by Flow 3 §8.4.g, Flow 4 §9.4.g, Flow 5 §10.4.g.
      // (Basic-auth username/password fields dropped — auth resolved to Adobe IMS S2S, §11 item 7.)
      // NOTE: plan §6.4.g used type:'select' with Yes/No options, but the aio-commerce-lib-app
      // schema has no 'select' type — Yes/No toggles map to type:'boolean' (default true/false).
      {
        type: 'boolean',
        name: 'price_change_enable',
        label: 'Enable Price Change Feature',
        default: true,
        description: 'Master toggle for accepting renewal webhooks.'
      }
    ]
  },
  eventing: {
    // eventing.commerce stays empty — this module subscribes to no Commerce platform events.
    commerce: [],
    external: [
      // Flow 1 §6.4.c — subscription on the custom "Price Change Internal Events" provider.
      // The provider itself is created automatically by aio-commerce-lib-app's built-in
      // externalEventsStep during installation (no custom install step needed — see §11 item 1).
      // More entries added by Flow 3 §8.4.c and Flow 4 §9.4.c.
      // NOTE: plan §6.4.c showed a flat { name, label, runtimeActions }, but the schema requires
      // provider + events[] (mirroring eventing.commerce), with a required description per event.
      {
        provider: {
          label: 'Price Change Internal Events',
          description: 'Replaces RabbitMQ pre-renewal and reporting topics'
        },
        events: [
          {
            name: 'com.dish.pricechange.prerenewal.received',
            label: 'Pre-Renewal Notification Received',
            description: 'Inbound renewal/resume notification, consumed to persist the queue row.',
            runtimeActions: ['external-events/pre-renewal-persist-consumer']
          }
        ]
      }
    ]
  },
  // webhooks[] stays omitted — module is fully asynchronous (no sync integration points).
  installation: {
    messages: {
      preInstallation:
        'Before installing, obtain: the Recurly Basic auth token, the Partner Billing Platform ' +
        '(Ping) key/secret and token URL, and the UMS reporting API credentials.',
      postInstallation:
        'Configure the Recurly endpoint/auth, the Partner Billing endpoint/JWT, the UMS reporting ' +
        'endpoint, and the Active/Pause package SKU→date mappings before enabling the price-change cron.'
    }
  }
})
