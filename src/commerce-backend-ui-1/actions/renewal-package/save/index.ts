/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'
import { RenewalPackageMappingType } from '@lib/database/collection/renewal-package-mapping/types'

/**
 * save (plan §8.4.e, §11 item 8) — package `renewal-package`.
 *
 * SPA-invoked create/update API for the Active/Pause SKU→date package mappings, backing the
 * mapping grids. POST `mapping_type`, `effective_date`, `packages` (comma-separated SKUs), and
 * optionally `id` — creates a new mapping when `id` is omitted, or updates the mapping with that
 * id, via RenewalPackageMappingRepository.saveMapping(...). Web action (require-adobe-auth: true),
 * called directly from the SPA with actionCallHeaders — no apis.config REST mapping needed (see
 * GENERATOR-DELTA §16).
 */
export const main = RuntimeAction.execute(
  'save',
  [HttpMethod.POST],
  ['mapping_type', 'effective_date', 'packages'],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal package mapping save action called')

      const mappingType = params.mapping_type as RenewalPackageMappingType
      const effectiveDate = params.effective_date as string
      const packages = params.packages as string
      const id = params.id as string | undefined

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new RenewalPackageMappingRepository(accessToken)

      const mapping = await repository.saveMapping(
        {
          mapping_type: mappingType,
          effective_date: effectiveDate,
          packages
        },
        id
      )

      return RuntimeActionResponse.success({ mapping })
    } catch (error) {
      logger.error('Unexpected error in save action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
