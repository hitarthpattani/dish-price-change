/*
 * <license header>
 */

/* Adobe Commerce (catalog/pricing) client — plan §5.4. Deployment target: PaaS → Oauth1aConnection. */

import { AdobeCommerceClient, Oauth1aConnection } from '@adobe-commerce/aio-toolkit'

/**
 * Fronts the product/package, plan-offer pricing, and bundle parent/child associations the
 * eligibility engine needs (plan §5.4).
 *
 * BLOCKING — Reinterpretation §11 item 2 (Custom Pricing & Bundle Data Sources): in the source
 * these come from custom Dish modules (PlanOffers, Sales, CustomerCart), not stock Commerce
 * endpoints. How App Builder reaches them (custom REST/GraphQL, DB replication, or API Mesh) must
 * be resolved before the operations below can be implemented.
 *
 * Consumed by: Flow 3 (eligibility/package-pricing), Flow 5 (bundle GUID cache rebuild).
 */
export class CatalogClient {
  private client: AdobeCommerceClient

  constructor(params: Record<string, string>) {
    // Connection class: Oauth1aConnection (deployment target: PaaS). Integration keys from env (§5.4).
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
   * Fetch enabled products flagged as "Package" (plan §5.4).
   */
  async fetchEnabledPackageProducts(): Promise<unknown> {
    // TODO: Implement per migration plan §5.4 "Adobe Commerce (catalog/pricing)" operations
    // Endpoint: custom Dish source (see §11 item 2). Use this.client.get(...).
    throw new Error('TODO: implement fetchEnabledPackageProducts')
  }

  /**
   * Fetch plan/offer package pricing (plan §5.4).
   */
  async fetchPlanOfferPricing(_planCode: string): Promise<unknown> {
    // TODO: Implement per migration plan §5.4 "Adobe Commerce (catalog/pricing)" operations
    // Endpoint: custom Dish PlanOffers source (see §11 item 2).
    throw new Error('TODO: implement fetchPlanOfferPricing')
  }

  /**
   * Fetch bundle parent/child GUID associations (plan §5.4).
   */
  async fetchBundleChildAssociations(_parentSku: string): Promise<unknown> {
    // TODO: Implement per migration plan §5.4 "Adobe Commerce (catalog/pricing)" operations
    // Endpoint: custom Dish Sales BundleSubscriptionChild source (see §11 item 2).
    throw new Error('TODO: implement fetchBundleChildAssociations')
  }
}
