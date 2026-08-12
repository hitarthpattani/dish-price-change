/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'

/**
 * load (plan §8.4.e, §11 item 8) — package `renewal-package`.
 *
 * SPA-invoked read API for a single Active/Pause SKU→date package mapping: GET `?id=<record id>`,
 * via the base `findById`. Web action (require-adobe-auth: true), called directly from the SPA
 * with actionCallHeaders — no apis.config REST mapping needed (see GENERATOR-DELTA §16).
 */
export const main = RuntimeAction.execute(
  'load',
  [HttpMethod.GET],
  ['id'],
  ['authorization', 'x-gw-ims-org-id'],
  async (params, ctx) => {
    const { logger } = ctx

    try {
      logger.info('Renewal package mapping load action called')

      const id = params.id as string

      const accessToken = await GenerateAccessToken.execute(params)
      const repository = new RenewalPackageMappingRepository(accessToken)

      const mapping = await repository.findById(id)
      if (!mapping) {
        return RuntimeActionResponse.error(404, 'Mapping not found')
      }

      return RuntimeActionResponse.success({ mapping })
    } catch (error) {
      logger.error('Unexpected error in load action:', error)
      return RuntimeActionResponse.error(
        500,
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
)
