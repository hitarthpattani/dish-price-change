/*
 * <license header>
 */

const mockGet = jest.fn()

jest.mock('@adobe-commerce/aio-toolkit', () => ({
  AdobeCommerceClient: jest.fn().mockImplementation((baseUrl: string) => {
    if (!baseUrl) {
      throw new Error('Commerce URL must be provided')
    }
    return { get: mockGet }
  }),
  Oauth1aConnection: jest.fn()
}))

import { AdobeCommerceStoreViewClient } from '@lib/adobe-commerce/store-view'

describe('AdobeCommerceStoreViewClient', () => {
  const createClient = () =>
    new AdobeCommerceStoreViewClient({
      COMMERCE_BASE_URL: 'https://commerce.example.com',
      COMMERCE_CONSUMER_KEY: 'key',
      COMMERCE_CONSUMER_SECRET: 'secret',
      COMMERCE_ACCESS_TOKEN: 'token',
      COMMERCE_ACCESS_TOKEN_SECRET: 'token-secret'
    })

  beforeEach(() => {
    mockGet.mockReset()
  })

  it('should apply fallback defaults when params are missing', () => {
    expect(() => new AdobeCommerceStoreViewClient({})).toThrow('Commerce URL must be provided')
  })

  describe('fetchStoreViews', () => {
    it('should call the store views endpoint and return the result', async () => {
      const storeViews = [
        {
          id: 1,
          code: 'default',
          website_id: 1,
          store_group_id: 1,
          name: 'Default Store View',
          sort_order: 0,
          is_active: 1
        }
      ]
      mockGet.mockResolvedValue({ success: true, message: storeViews })

      const result = await createClient().fetchStoreViews()

      expect(mockGet).toHaveBeenCalledWith('V1/store/storeViews', {
        'Content-Type': 'application/json'
      })
      expect(result).toEqual({ success: true, message: storeViews })
    })
  })
})
