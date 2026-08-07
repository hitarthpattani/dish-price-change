/*
 * <license header>
 */

const mockExecute = jest.fn()

jest.mock('@adobe-commerce/aio-toolkit', () => ({
  PublishEvent: jest.fn().mockImplementation(() => ({
    execute: mockExecute
  }))
}))
jest.mock('@lib/utils/generate-access-token')

import { PublishEvent } from '@adobe-commerce/aio-toolkit'
import { EventsPublisher } from '@lib/utils/events-publisher'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'

describe('EventsPublisher', () => {
  const validParams = {
    PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID: 'provider-123',
    IMS_OAUTH_S2S_ORG_ID: 'org-id@AdobeOrg',
    IMS_OAUTH_S2S_CLIENT_ID: 'client-id'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockExecute.mockResolvedValue(undefined)
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')
  })

  describe('publish', () => {
    it('publishes the event to the configured provider', async () => {
      const eventsPublisher = new EventsPublisher(validParams)

      await eventsPublisher.publish('com.dish.pricechange.prerenewal.received', {
        uuid: 'uuid-123'
      })

      expect(GenerateAccessToken.execute).toHaveBeenCalledWith(validParams)
      expect(PublishEvent).toHaveBeenCalledWith('org-id@AdobeOrg', 'client-id', 'a-valid-token')
      expect(mockExecute).toHaveBeenCalledWith(
        'provider-123',
        'com.dish.pricechange.prerenewal.received',
        { uuid: 'uuid-123' }
      )
    })

    it('throws when the provider id is missing', async () => {
      const { PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID: _omit, ...params } = validParams
      const eventsPublisher = new EventsPublisher(params)

      await expect(eventsPublisher.publish('event-type', {})).rejects.toThrow(
        'Missing required parameter PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID'
      )
      expect(GenerateAccessToken.execute).not.toHaveBeenCalled()
    })

    it('throws when the IMS org id or client id is missing', async () => {
      const { IMS_OAUTH_S2S_ORG_ID: _omit, ...params } = validParams
      const eventsPublisher = new EventsPublisher(params)

      await expect(eventsPublisher.publish('event-type', {})).rejects.toThrow(
        'Missing required parameters IMS_OAUTH_S2S_ORG_ID, IMS_OAUTH_S2S_CLIENT_ID'
      )
    })

    it('publishes multiple events from the same instance', async () => {
      const eventsPublisher = new EventsPublisher(validParams)

      await eventsPublisher.publish('event-a', { a: 1 })
      await eventsPublisher.publish('event-b', { b: 2 })

      expect(mockExecute).toHaveBeenNthCalledWith(1, 'provider-123', 'event-a', { a: 1 })
      expect(mockExecute).toHaveBeenNthCalledWith(2, 'provider-123', 'event-b', { b: 2 })
    })
  })
})
