/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'
import { RenewalPackageMappingType } from '@lib/database/collection/renewal-package-mapping/types'

/**
 * list (plan §8.4.e, §11 item 8) — package `renewal-package`.
 *
 * SPA-invoked read API for the Active/Pause SKU→date package mappings, backing the mapping
 * grids: GET `?type=active|pause`, via RenewalPackageMappingRepository.listByType(...). Web
 * action (require-adobe-auth: true), called directly from the SPA with actionCallHeaders — no
 * apis.config REST mapping needed (see GENERATOR-DELTA §16).
 *
 * Upsert/delete/load are implemented as separate actions (save, delete, load).
 */
export const main = RuntimeAction.execute(
  'list',
  [HttpMethod.GET],
  ['type'],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal package mapping list action called')

      const mappingType = params.type as RenewalPackageMappingType

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new RenewalPackageMappingRepository(accessToken)

      const mappings = await repository.listByType(mappingType)

      return RuntimeActionResponse.success({ mappings, count: mappings.length })
    } catch (error) {
      logger.error('Unexpected error in list action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
