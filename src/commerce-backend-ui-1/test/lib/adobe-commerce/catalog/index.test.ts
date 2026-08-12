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

import { AdobeCommerceCatalogClient } from '@lib/adobe-commerce/catalog'

describe('AdobeCommerceCatalogClient', () => {
  const createClient = () =>
    new AdobeCommerceCatalogClient({
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
    expect(() => new AdobeCommerceCatalogClient({})).toThrow('Commerce URL must be provided')
  })

  describe('fetchEnabledPackageProducts', () => {
    it('should call the products search endpoint filtered to enabled and return the result', async () => {
      const products = [{ sku: 'SKU-1', name: 'Product 1', status: 1 }]
      mockGet.mockResolvedValue({ success: true, message: { items: products, total_count: 1 } })

      const result = await createClient().fetchEnabledPackageProducts()

      expect(mockGet).toHaveBeenCalledWith(
        'V1/products?' +
          'searchCriteria[filterGroups][0][filters][0][field]=status&' +
          'searchCriteria[filterGroups][0][filters][0][value]=1&' +
          'searchCriteria[filterGroups][0][filters][0][conditionType]=eq&' +
          'searchCriteria[pageSize]=200',
        { 'Content-Type': 'application/json' }
      )
      expect(result).toEqual({ success: true, message: { items: products, total_count: 1 } })
    })
  })

  describe('fetchPlanOfferPricing', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().fetchPlanOfferPricing('plan-code')).rejects.toThrow(
        'TODO: implement fetchPlanOfferPricing'
      )
    })
  })

  describe('fetchBundleChildAssociations', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().fetchBundleChildAssociations('parent-sku')).rejects.toThrow(
        'TODO: implement fetchBundleChildAssociations'
      )
    })
  })
})
