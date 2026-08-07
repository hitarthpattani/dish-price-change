/*
 * <license header>
 */

import { AdobeCommerceClient, Oauth1aConnection } from '@adobe-commerce/aio-toolkit'

/**
 * Fronts the Adobe Commerce Store Views API.
 */
export class AdobeCommerceStoreViewClient {
  private client: AdobeCommerceClient

  constructor(params: Record<string, string>) {
    this.client = new AdobeCommerceClient(
      params.COMMERCE_BASE_URL ?? '',
      new Oauth1aConnection(
        params.COMMERCE_CONSUMER_KEY ?? '',
        params.COMMERCE_CONSUMER_SECRET ?? '',
        params.COMMERCE_ACCESS_TOKEN ?? '',
        params.COMMERCE_ACCESS_TOKEN_SECRET ?? ''
      )
    )
  }

  /**
   * Fetch all store views.
   *
   * Endpoint: `GET V1/store/storeViews`
   */
  async fetchStoreViews(): Promise<unknown> {
    return this.client.get('V1/store/storeViews', {
      'Content-Type': 'application/json'
    })
  }
}
