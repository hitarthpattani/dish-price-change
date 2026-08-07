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

import { AdobeCommerceWebsiteClient } from '@lib/adobe-commerce/website'

describe('AdobeCommerceWebsiteClient', () => {
  const createClient = () =>
    new AdobeCommerceWebsiteClient({
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
    expect(() => new AdobeCommerceWebsiteClient({})).toThrow('Commerce URL must be provided')
  })

  describe('fetchWebsites', () => {
    it('should call the store websites endpoint and return the result', async () => {
      const websites = [
        { id: 1, code: 'base', name: 'Main Website', sort_order: 0, default_group_id: 1 }
      ]
      mockGet.mockResolvedValue({ success: true, message: websites })

      const result = await createClient().fetchWebsites()

      expect(mockGet).toHaveBeenCalledWith('V1/store/websites', {
        'Content-Type': 'application/json'
      })
      expect(result).toEqual({ success: true, message: websites })
    })
  })
})
