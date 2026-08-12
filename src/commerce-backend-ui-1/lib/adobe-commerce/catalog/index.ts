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
 * be resolved before `fetchPlanOfferPricing`/`fetchBundleChildAssociations` can be implemented.
 * `fetchEnabledPackageProducts` sidesteps this for now by returning every enabled product from the
 * stock Commerce catalog (see its own doc comment).
 *
 * Consumed by: Flow 3 (eligibility/package-pricing), Flow 5 (bundle GUID cache rebuild), and the
 * `renewal-package/skus` action (SKU options for the Active/Pause mapping form).
 */
export class AdobeCommerceCatalogClient {
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
   * Fetch enabled products (plan §5.4).
   *
   * Endpoint: `GET V1/products`, filtered to `status=1` (enabled). Reinterpretation §11 item 2
   * flags that filtering specifically on Dish's custom "Package" product attribute is blocked
   * pending a decision on how App Builder reaches that custom data source — until then, this
   * returns every enabled product as a pragmatic default (e.g. for populating SKU pickers).
   */
  async fetchEnabledPackageProducts(): Promise<unknown> {
    return this.client.get(
      'V1/products?' +
        'searchCriteria[filterGroups][0][filters][0][field]=status&' +
        'searchCriteria[filterGroups][0][filters][0][value]=1&' +
        'searchCriteria[filterGroups][0][filters][0][conditionType]=eq&' +
        'searchCriteria[pageSize]=200',
      { 'Content-Type': 'application/json' }
    )
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
