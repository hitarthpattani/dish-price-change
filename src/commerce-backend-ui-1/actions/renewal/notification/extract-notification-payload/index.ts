/*
 * <license header>
 */

/**
 * Extract Notification Payload Utility
 *
 * Strips OpenWhisk invocation metadata and the credential/config inputs wired in
 * `actions.config.yaml` from the raw `notification` action params, leaving only the fields that
 * represent the inbound renewal notification (plan §6.4.a).
 *
 * @module actions/renewal/notification/extract-notification-payload
 */

/**
 * Action params that are runtime/credential plumbing rather than renewal-notification fields,
 * excluded when assembling the event payload published in step 4.
 */
const INTERNAL_PARAM_KEYS = new Set([
  'LOG_LEVEL',
  'IMS_OAUTH_S2S_CLIENT_ID',
  'IMS_OAUTH_S2S_CLIENT_SECRET',
  'IMS_OAUTH_S2S_ORG_ID',
  'IMS_OAUTH_S2S_SCOPES',
  'COMMERCE_BASE_URL',
  'COMMERCE_CONSUMER_KEY',
  'COMMERCE_CONSUMER_SECRET',
  'COMMERCE_ACCESS_TOKEN',
  'COMMERCE_ACCESS_TOKEN_SECRET',
  'PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID'
])

/**
 * ExtractNotificationPayload Class
 *
 * @example
 * ```typescript
 * const payload = ExtractNotificationPayload.execute(params);
 * ```
 */
export class ExtractNotificationPayload {
  /**
   * Extracts the renewal-notification fields from the action params, dropping OpenWhisk
   * invocation metadata (`__ow_*`) and the credential/config inputs wired in
   * `actions.config.yaml`.
   *
   * @param params - Raw action params.
   * @returns The subset of `params` that represents the inbound renewal notification.
   */
  public static execute(params: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(params).filter(
        ([key]) => !key.startsWith('__ow_') && !INTERNAL_PARAM_KEYS.has(key)
      )
    )
  }
}
