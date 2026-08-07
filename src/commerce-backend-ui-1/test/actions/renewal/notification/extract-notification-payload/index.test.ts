/*
 * <license header>
 */

import { ExtractNotificationPayload } from '@actions/renewal/notification/extract-notification-payload'

describe('ExtractNotificationPayload', () => {
  describe('execute', () => {
    it('keeps renewal-notification fields', () => {
      const params = {
        uuid: 'uuid-123',
        event_type: 'renewal.scheduled',
        renewal_date: '2026-08-07T00:00:00.000Z'
      }

      expect(ExtractNotificationPayload.execute(params)).toEqual(params)
    })

    it('drops OpenWhisk invocation metadata', () => {
      const params = {
        uuid: 'uuid-123',
        __ow_headers: { authorization: 'Bearer token' },
        __ow_method: 'post',
        __ow_body: 'raw-body'
      }

      expect(ExtractNotificationPayload.execute(params)).toEqual({ uuid: 'uuid-123' })
    })

    it('drops the credential/config inputs wired in actions.config.yaml', () => {
      const params = {
        uuid: 'uuid-123',
        LOG_LEVEL: 'debug',
        IMS_OAUTH_S2S_CLIENT_ID: 'client-id',
        IMS_OAUTH_S2S_CLIENT_SECRET: 'client-secret',
        IMS_OAUTH_S2S_ORG_ID: 'org-id',
        IMS_OAUTH_S2S_SCOPES: 'scope',
        COMMERCE_BASE_URL: 'https://commerce.example.com',
        COMMERCE_CONSUMER_KEY: 'key',
        COMMERCE_CONSUMER_SECRET: 'secret',
        COMMERCE_ACCESS_TOKEN: 'token',
        COMMERCE_ACCESS_TOKEN_SECRET: 'token-secret',
        PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID: 'provider-123'
      }

      expect(ExtractNotificationPayload.execute(params)).toEqual({ uuid: 'uuid-123' })
    })

    it('returns an empty object for an empty input', () => {
      expect(ExtractNotificationPayload.execute({})).toEqual({})
    })
  })
})
