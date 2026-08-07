import { defineConfig } from '@adobe/aio-commerce-lib-app/config'

export default defineConfig({
  metadata: {
    id: 'subscription-price-manager',
    displayName: 'Subscription Price Manager',
    version: '1.0.0',
    description:
      'Automates subscription package price changes at renewal — webhook/CSV ingestion, ' +
      'eligibility evaluation, billing-platform and partner price updates, and outcome reporting.'
  },
  businessConfig: {
    schema: [
      // Flow 3 §8.4.g — price-change engine config. select→boolean and numeric→text per the
      // aio-commerce-lib-app schema (no 'select'/'number' businessConfig types; see GENERATOR-DELTA §10).
      // change_sub_recurly_request.*
      {
        type: 'text',
        name: 'recurly_endpoint',
        label: 'Recurly Endpoint URL',
        default: 'https://v3.recurly.com/subscriptions'
      },
      { type: 'password', name: 'recurly_authorization', label: 'Recurly Basic Auth' },
      { type: 'text', name: 'recurly_timeout', label: 'Recurly Timeout (sec)', default: '10' },
      {
        type: 'text',
        name: 'recurly_async_batch_size',
        label: 'Recurly Change Async Batch Size',
        default: '25'
      },
      {
        type: 'boolean',
        name: 'price_change_retry_enable',
        label: 'Enable Recurly Change Retry',
        default: true
      },
      {
        type: 'text',
        name: 'price_change_retry_count',
        label: 'Recurly Retry Count',
        default: '2'
      },
      {
        type: 'text',
        name: 'call_price_change_retry_interval',
        label: 'Retry Interval (min)',
        default: '30'
      },
      {
        type: 'text',
        name: 'price_change_retry_error_code',
        label: 'Retry Error Codes',
        default: '500,502,503,504,429,28'
      },
      { type: 'text', name: 'rtp_days', label: 'RTP Days', default: '27' },
      // price_change_cron_setting.*
      {
        type: 'boolean',
        name: 'price_change_cron_enabled',
        label: 'Enable Price Change Cron',
        default: false
      },
      { type: 'text', name: 'batch_of_record', label: 'DB Batch Size', default: '2' },
      {
        type: 'text',
        name: 'fetch_sub_batch',
        label: 'Fetch Subscription Batch Size',
        default: '25'
      },
      // disable_recurly_api.*
      { type: 'boolean', name: 'is_recurly_down', label: 'Is Recurly Down?', default: false },
      // partner_billing.*
      { type: 'password', name: 'partner_jwt_key', label: 'Partner JWT Key' },
      { type: 'password', name: 'partner_jwt_secret', label: 'Partner JWT Secret' },
      { type: 'boolean', name: 'partners_enabled', label: 'Enable for Partners', default: false },
      { type: 'text', name: 'pbp_batch_endpoint', label: 'PBP Batch Endpoint URL' },
      { type: 'boolean', name: 'pbp_batch_mocked', label: 'Mock PBP', default: false },
      // bundling_cache.*
      {
        type: 'boolean',
        name: 'bundling_cache_enabled',
        label: 'Enable Bundling Cache',
        default: false
      },
      {
        type: 'text',
        name: 'bundling_cache_lifetime',
        label: 'Bundling Cache Lifetime (s)',
        default: '86400'
      },
      // Flow 4 §9.4.g — UMS reporting config. select→boolean, numeric→text (GENERATOR-DELTA §10).
      {
        type: 'text',
        name: 'reporting_endpoint_url',
        label: 'UMS Endpoint URL',
        default: 'https://ums.q.sling.com/v6/user/event_logs'
      },
      {
        type: 'text',
        name: 'ums_api_request_timeout',
        label: 'UMS API Timeout (sec)',
        default: '30'
      },
      {
        type: 'text',
        name: 'ums_reporting_api_batch_size',
        label: 'UMS Reporting Batch Size',
        default: '20'
      },
      { type: 'boolean', name: 'ums_debug_mode', label: 'Enable UMS API Debug', default: true },
      { type: 'boolean', name: 'ums_retry_enable', label: 'Enable UMS Retry', default: true },
      { type: 'text', name: 'ums_retry_count', label: 'UMS Retry Count', default: '2' },
      { type: 'text', name: 'ums_retry_after', label: 'UMS Retry After (ms)', default: '500000' },
      // Flow 5 §10.4.g — maintenance sweeps. select→boolean, numeric→text (GENERATOR-DELTA §10).
      // (bundling_cache_enabled / bundling_cache_lifetime are declared once in Flow 3 §8.4.g and reused.)
      {
        type: 'boolean',
        name: 'remove_renewal_notification_cron_enabled',
        label: 'Enable Remove Renewal Notification Cron',
        default: true
      },
      {
        type: 'text',
        name: 'remove_renewal_day_interval',
        label: 'Interval In Days',
        default: '3'
      },
      { type: 'text', name: 'remove_record_batch', label: 'Batch Size', default: '10000' }
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
          },
          {
            // Flow 3 §8.4.c — published by price-change-worker; consumed by Flow 4's
            // reporting-delivery-consumer (forward reference — that action is created in Flow 4,
            // collapsing the pub/sub pair into this single events[] entry, per the §2b merge note).
            name: 'com.dish.pricechange.reporting.queued',
            label: 'Reporting Queued',
            description: 'Price-change outcome rows queued for delivery to the UMS reporting API.',
            runtimeActions: ['external-events/reporting-delivery-consumer']
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
