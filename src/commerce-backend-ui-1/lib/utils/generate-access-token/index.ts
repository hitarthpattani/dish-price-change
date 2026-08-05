/*
 * <license header>
 */

/**
 * Generate Access Token Utility
 *
 * Provides a utility class for generating Adobe IMS OAuth S2S access tokens
 * used to authenticate Adobe services (e.g., ABDB operations and Commerce API requests) from Runtime actions.
 *
 * @module lib/utils/generate-access-token
 */

import { Core } from '@adobe/aio-sdk'

/**
 * GenerateAccessToken Class
 *
 * Utility class that validates IMS OAuth S2S credentials from action parameters
 * and requests an access token via the Adobe I/O SDK AuthClient.
 *
 * @example
 * ```typescript
 * const params = {
 *   IMS_OAUTH_S2S_CLIENT_ID: 'client-id',
 *   IMS_OAUTH_S2S_CLIENT_SECRET: 'client-secret',
 *   IMS_OAUTH_S2S_ORG_ID: 'org-id@AdobeOrg',
 *   IMS_OAUTH_S2S_SCOPES: 'scope1,scope2',
 * };
 *
 * const accessToken = await GenerateAccessToken.execute(params);
 * ```
 */
export class GenerateAccessToken {
  /**
   * Generates an access token for Adobe services.
   *
   * Reads IMS OAuth S2S credentials from the provided action parameters,
   * validates that required values are present, normalizes scopes, and calls
   * `Core.AuthClient.generateAccessToken`.
   *
   * @param params - Action parameters containing IMS OAuth S2S credentials
   * @param params.IMS_OAUTH_S2S_CLIENT_ID - Adobe IMS OAuth S2S client ID
   * @param params.IMS_OAUTH_S2S_CLIENT_SECRET - Adobe IMS OAuth S2S client secret
   * @param params.IMS_OAUTH_S2S_ORG_ID - Adobe IMS organization ID
   * @param params.IMS_OAUTH_S2S_SCOPES - OAuth scopes as a JSON array string, comma-separated string, or string array
   * @returns Promise resolving to the access token, or an empty string when the SDK response omits `access_token`
   * @throws {Error} When required credentials are missing, empty, or when scopes resolve to an empty list
   *
   * @example
   * ```typescript
   * const accessToken = await GenerateAccessToken.execute(params);
   * const repository = new ConfigurationRepository(accessToken);
   * ```
   */
  public static async execute(params: Record<string, unknown>): Promise<string> {
    const clientId = params.IMS_OAUTH_S2S_CLIENT_ID
    const clientSecret = params.IMS_OAUTH_S2S_CLIENT_SECRET
    const orgId = params.IMS_OAUTH_S2S_ORG_ID
    const rawScopes = params.IMS_OAUTH_S2S_SCOPES

    if (
      typeof clientId !== 'string' ||
      clientId.trim() === '' ||
      typeof clientSecret !== 'string' ||
      clientSecret.trim() === '' ||
      typeof orgId !== 'string' ||
      orgId.trim() === ''
    ) {
      throw new Error(
        'Missing required parameters IMS_OAUTH_S2S_CLIENT_ID, IMS_OAUTH_S2S_CLIENT_SECRET, IMS_OAUTH_S2S_ORG_ID'
      )
    }

    const scopes = GenerateAccessToken.parseScopes(rawScopes)
    if (scopes.length === 0) {
      throw new Error('Missing required parameter IMS_OAUTH_S2S_SCOPES')
    }

    const tokenResponse = await Core.AuthClient.generateAccessToken({
      clientId,
      clientSecret,
      orgId,
      scopes
    })

    return tokenResponse?.access_token ?? ''
  }

  /**
   * Parses and normalizes OAuth scopes from action parameters.
   *
   * Accepts scopes as a string array, a JSON array string (typical in `.env`),
   * or a comma-separated string. Non-string array entries are ignored. Each
   * scope is trimmed and empty values are removed.
   *
   * @private
   * @param rawScopes - Raw scopes value from action parameters
   * @returns Normalized list of scope strings, or an empty array when the input is invalid
   */
  private static parseScopes(rawScopes: unknown): string[] {
    if (Array.isArray(rawScopes)) {
      return GenerateAccessToken.normalizeScopes(rawScopes)
    }

    if (typeof rawScopes === 'string') {
      const trimmed = rawScopes.trim()
      if (!trimmed) {
        return []
      }

      if (trimmed.startsWith('[')) {
        try {
          const parsed: unknown = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            return GenerateAccessToken.normalizeScopes(parsed)
          }
        } catch {
          // Invalid JSON — fall back to comma-separated parsing below
        }
      }

      return trimmed
        .split(',')
        .map(scope => scope.trim())
        .filter(Boolean)
    }

    return []
  }

  /**
   * Trims scope strings and removes empty or non-string entries.
   *
   * @private
   */
  private static normalizeScopes(scopes: unknown[]): string[] {
    return scopes
      .filter((scope): scope is string => typeof scope === 'string')
      .map(scope => scope.trim())
      .filter(Boolean)
  }
}
