/*
 * <license header>
 */

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

  it('should apply fallback defaults when params are missing', () => {
    expect(() => new AdobeCommerceCatalogClient({})).toThrow('Commerce URL must be provided')
  })

  describe('fetchEnabledPackageProducts', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().fetchEnabledPackageProducts()).rejects.toThrow(
        'TODO: implement fetchEnabledPackageProducts'
      )
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
