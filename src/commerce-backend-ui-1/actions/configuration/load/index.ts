/*
 * <license header>
 */

/**
 * Load Action for Configuration
 *
 * This runtime action fetches configuration data from the `configuration`
 * ABDB collection for a given scope, inheriting down the `default` ->
 * `website` -> `store` chain (a store view falls back to its website, which
 * falls back to `default`, per key), alongside the Adobe Commerce scope tree
 * (Default Config -> Website -> Store Group -> Store View) used to populate
 * the scope picker.
 *
 * @module actions/configuration/load
 *
 * Endpoints:
 * - GET|POST: Fetch the current configuration data (merged across the scope
 *   inheritance chain), optionally scoped by `scope` (e.g. `default`,
 *   `website`, `store`) and `scope_id`, together with the effective
 *   `scope`/`scopeId` and the full Commerce scope tree.
 */
import { RuntimeAction, HttpMethod, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'
import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { ConfigurationScope } from '@lib/utils/configuration-scope'
import { StoreScopeTree } from '@lib/utils/store-scope-tree'

/** Scope applied when the caller does not specify one, mirroring `ConfigurationRepository`'s default. */
const DEFAULT_SCOPE = 'default'

/** Scope id applied when the caller does not specify one, mirroring `ConfigurationRepository`'s default. */
const DEFAULT_SCOPE_ID = 0

export const main = RuntimeAction.execute(
  'configuration-load-action',
  [HttpMethod.GET, HttpMethod.POST],
  [],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Configuration load action called')

      const { scope, scopeId } = ConfigurationScope.resolve(params)
      const effectiveScope = scope ?? DEFAULT_SCOPE
      const effectiveScopeId = scopeId ?? DEFAULT_SCOPE_ID

      const [accessToken, scopeTree] = await Promise.all([
        GenerateAccessToken.execute(params),
        new StoreScopeTree(params).build()
      ])

      const configurationRepository = new ConfigurationRepository(accessToken, scopeTree)
      const configuration = await configurationRepository.all(effectiveScope, effectiveScopeId)

      return RuntimeActionResponse.success({
        configuration,
        scope: effectiveScope,
        scopeId: effectiveScopeId,
        scopeTree
      })
    } catch (error) {
      logger.error('Unexpected error in configuration load action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
