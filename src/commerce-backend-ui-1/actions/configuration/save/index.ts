/*
 * <license header>
 */

/**
 * Save Action for Configuration
 *
 * This runtime action saves or updates configuration data in the
 * `configuration` ABDB collection for a given scope.
 *
 * @module actions/configuration/save
 *
 * Endpoints:
 * - POST: Save/update the configuration data, optionally scoped by
 *   `scope` (e.g. `default`, `website`, `store`) and `scope_id`, returning
 *   the effective `scope`/`scopeId` alongside the saved configuration.
 */
import { RuntimeAction, HttpMethod, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'
import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { ConfigurationScope } from '@lib/utils/configuration-scope'

/** Scope applied when the caller does not specify one, mirroring `ConfigurationRepository`'s default. */
const DEFAULT_SCOPE = 'default'

/** Scope id applied when the caller does not specify one, mirroring `ConfigurationRepository`'s default. */
const DEFAULT_SCOPE_ID = 0

export const main = RuntimeAction.execute(
  'configuration-save-action',
  [HttpMethod.POST],
  ['configuration'],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Configuration save action called')

      const { scope, scopeId } = ConfigurationScope.resolve(params)
      const effectiveScope = scope ?? DEFAULT_SCOPE
      const effectiveScopeId = scopeId ?? DEFAULT_SCOPE_ID

      const rawConfiguration = params.configuration as Record<string, string>
      const filteredConfiguration = Object.fromEntries(
        Object.entries(rawConfiguration).filter(([, value]) => value !== null && value !== '')
      )

      const accessToken = await GenerateAccessToken.execute(params)
      const configurationRepository = new ConfigurationRepository(accessToken)

      await configurationRepository.set(filteredConfiguration, effectiveScope, effectiveScopeId)

      return RuntimeActionResponse.success({
        configuration: await configurationRepository.all(effectiveScope, effectiveScopeId),
        scope: effectiveScope,
        scopeId: effectiveScopeId
      })
    } catch (error) {
      logger.error('Unexpected error in configuration save action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
