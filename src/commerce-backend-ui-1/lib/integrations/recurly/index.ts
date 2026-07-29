/*
 * <license header>
 */

/* Recurly subscription-billing client — plan §5.4. Auth: HTTP Basic. */

import { RestClient } from '@adobe-commerce/aio-toolkit'

/**
 * Recurly billing client (plan §5.4).
 *
 * Base URL: businessConfig `change_sub_recurly_request/endpoint`.
 * Auth: `Authorization: Basic {decrypted token}` from businessConfig `.../authorization`.
 * Headers also include `Content-Type: application/json` and
 * `Accept: application/vnd.recurly.v2019-10-10+json`. Timeout from `.../timeout`.
 *
 * `RestClient` is stateless — pass the full endpoint URL and headers per call.
 * Consumed by: Flow 3 (price-change-worker).
 */
export class RecurlyClient {
  private client: RestClient
  private endpoint: string
  private authorization: string

  constructor(params: Record<string, string>) {
    // TODO: Implement per migration plan §5.4 "Recurly"
    // Source endpoint/auth/timeout from businessConfig (change_sub_recurly_request.*).
    this.client = new RestClient()
    this.endpoint = params.recurly_endpoint ?? ''
    this.authorization = params.recurly_authorization ?? ''
  }

  /**
   * Fetch a subscription: `GET {endpoint}/uuid-{id}`.
   */
  async fetchSubscription(_id: string): Promise<unknown> {
    // TODO: Implement per migration plan §5.4 "Recurly" operations
    // GET `${this.endpoint}/uuid-${id}` with Basic auth (this.authorization) via this.client.get(...).
    throw new Error('TODO: implement fetchSubscription')
  }

  /**
   * Change a subscription: `POST {endpoint}/{id}/change`.
   */
  async changeSubscription(_id: string, _payload: unknown): Promise<unknown> {
    // TODO: Implement per migration plan §5.4 "Recurly" operations
    // POST `${this.endpoint}/${id}/change` with Basic auth (this.authorization) via this.client.post(...).
    throw new Error('TODO: implement changeSubscription')
  }
}
