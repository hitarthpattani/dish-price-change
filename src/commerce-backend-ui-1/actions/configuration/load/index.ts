/*
 * <license header>
 */

/**
 * Load Action for Configuration
 *
 * This runtime action fetches configuration data from the `configuration`
 * ABDB collection for a given scope.
 *
 * @module actions/configuration/load
 *
 * Endpoints:
 * - GET|POST: Fetch the current configuration data, optionally scoped by
 *   `scope` (e.g. `default`, `website`, `store`) and `scope_id`.
 */
import { RuntimeAction, HttpMethod, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'
import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { ConfigurationScope } from '@lib/utils/configuration-scope'

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

      const accessToken = await GenerateAccessToken.execute(params)
      const configurationRepository = new ConfigurationRepository(accessToken)

      const configuration = await configurationRepository.all(scope, scopeId)

      return RuntimeActionResponse.success({ configuration })
    } catch (error) {
      logger.error('Unexpected error in configuration load action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
