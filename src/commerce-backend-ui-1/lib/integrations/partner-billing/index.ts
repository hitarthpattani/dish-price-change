/*
 * <license header>
 */

/* Partner Billing Platform (PBP) client — plan §5.4. Auth: Bearer JWT (OAuth2 client-credentials). */

import { RestClient } from '@adobe-commerce/aio-toolkit'

/**
 * Partner Billing Platform client (plan §5.4).
 *
 * Base URL: businessConfig `partner_billing/pbp_batch_endpoint`.
 * Fixed batch options: price cap 5.99, behavior `RESTRICT`, units `ONES`.
 * Appends `?mock=true` when `pbp_batch_mocked`.
 *
 * Token source is Reinterpretation §11 item 3 (PBP + UMS JWT acquisition).
 * `RestClient` is stateless — pass the full endpoint URL and headers per call.
 * Consumed by: Flow 3 (partner-billing-processor).
 */
export class PartnerBillingClient {
  private client: RestClient
  private batchEndpoint: string

  constructor(params: Record<string, string>) {
    // TODO: Implement per migration plan §5.4 "Partner Billing Platform"
    // Auth mechanism: Bearer JWT (OAuth2 client-credentials). Endpoint from businessConfig.
    this.client = new RestClient()
    this.batchEndpoint = params.pbp_batch_endpoint ?? ''
  }

  /**
   * Acquire an access token (client-credentials): `Authorization: Basic base64(key:secret)`,
   * `Content-Type: application/x-www-form-urlencoded` POST to the token URL.
   *
   * BLOCKING context — §11 item 3: confirm the token URL / acquisition strategy.
   */
  async getToken(): Promise<string> {
    // TODO: Implement per migration plan §5.4 "Partner Billing Platform" operations
    throw new Error('TODO: implement getToken')
  }

  /**
   * Batch price change: `POST {pbp_batch_endpoint}` with `Authorization: Bearer {token}`.
   * Appends `?mock=true` when `pbp_batch_mocked`.
   */
  async batchPriceChange(_token: string, _payload: unknown): Promise<unknown> {
    // TODO: Implement per migration plan §5.4 "Partner Billing Platform" operations
    // POST this.batchEndpoint with Bearer token via this.client.post(...).
    throw new Error('TODO: implement batchPriceChange')
  }
}
