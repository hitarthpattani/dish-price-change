/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'

/**
 * delete (plan §8.4.e, §11 item 8) — package `renewal-package`.
 *
 * SPA-invoked delete API for one or more Active/Pause SKU→date package mappings: POST|DELETE
 * `ids` (record ids) — via RenewalPackageMappingRepository.deleteMappings(...). Used by both the
 * row-level and mass delete actions on the mapping grid. Web action (require-adobe-auth: true),
 * called directly from the SPA with actionCallHeaders — no apis.config REST mapping needed (see
 * GENERATOR-DELTA §16).
 */
export const main = RuntimeAction.execute(
  'delete',
  [HttpMethod.POST, HttpMethod.DELETE],
  ['ids'],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal package mapping delete action called')

      const ids = params.ids as string[]

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new RenewalPackageMappingRepository(accessToken)

      await repository.deleteMappings(ids)

      return RuntimeActionResponse.success({ success: true })
    } catch (error) {
      logger.error('Unexpected error in delete action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
