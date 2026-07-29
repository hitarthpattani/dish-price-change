/*
 * <license header>
 */

/* UMS Reporting API client — plan §5.4. Auth: Bearer JWT. */

import { RestClient } from '@adobe-commerce/aio-toolkit'

/**
 * UMS Reporting API client (plan §5.4).
 *
 * Base URL: businessConfig `ums_reporting/reporting_endpoint_url` (blank ⇒ no-op).
 * Headers: JWT bearer + `Content-Type: application/json` + an `Accept` header of `*` + `/` + `*`.
 * Retry: HTTP 429 up to `ums_retry_count`, sleeping `ums_retry_after` µs.
 *
 * Token source is Reinterpretation §11 item 3 (PBP + UMS JWT acquisition).
 * `RestClient` is stateless — pass the full endpoint URL and headers per call.
 * Consumed by: Flow 3 (indirectly, via reporting event), Flow 4 (reporting-delivery-consumer).
 */
export class UmsReportingClient {
  private client: RestClient
  private reportingEndpointUrl: string

  constructor(params: Record<string, string>) {
    // TODO: Implement per migration plan §5.4 "UMS Reporting API"
    // Auth mechanism: Bearer JWT. Endpoint from businessConfig (ums_reporting.reporting_endpoint_url).
    this.client = new RestClient()
    this.reportingEndpointUrl = params.reporting_endpoint_url ?? ''
  }

  /**
   * Send a batched report: `POST {reporting_endpoint_url}`. No-op when the endpoint is blank.
   * Applies 429 retry (`ums_retry_count` / `ums_retry_after` µs).
   */
  async sendReport(_reportRows: unknown[]): Promise<unknown> {
    // TODO: Implement per migration plan §5.4 "UMS Reporting API" operations
    // POST this.reportingEndpointUrl with JWT bearer via this.client.post(...); handle 429 retry.
    throw new Error('TODO: implement sendReport')
  }
}
