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

import { AdobeCommerceStoreGroupClient } from '@lib/adobe-commerce/store-group'

describe('AdobeCommerceStoreGroupClient', () => {
  const createClient = () =>
    new AdobeCommerceStoreGroupClient({
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
    expect(() => new AdobeCommerceStoreGroupClient({})).toThrow('Commerce URL must be provided')
  })

  describe('fetchStoreGroups', () => {
    it('should call the store groups endpoint and return the result', async () => {
      const storeGroups = [
        {
          id: 1,
          website_id: 1,
          name: 'Main Website Store',
          root_category_id: 2,
          default_store_id: 1
        }
      ]
      mockGet.mockResolvedValue({ success: true, message: storeGroups })

      const result = await createClient().fetchStoreGroups()

      expect(mockGet).toHaveBeenCalledWith('V1/store/storeGroups', {
        'Content-Type': 'application/json'
      })
      expect(result).toEqual({ success: true, message: storeGroups })
    })
  })
})
