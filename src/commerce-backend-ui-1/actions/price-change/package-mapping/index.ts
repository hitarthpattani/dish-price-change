/*
 * <license header>
 */

import { RuntimeAction, RuntimeActionResponse, HttpMethod } from '@adobe-commerce/aio-toolkit'

/**
 * package-mapping (plan §8.4.e, §11 item 8) — package `price-change`.
 *
 * SPA-invoked read/write API for the Active/Pause SKU→date package mappings, backing the mapping
 * grids. Web action (require-adobe-auth: true), called directly from the SPA with actionCallHeaders
 * — no apis.config REST mapping needed (see GENERATOR-DELTA §16).
 *
 * Added to support the item-8 decision (ABDB collection + grid); not enumerated in plan §8.4.a.
 */
export const main = RuntimeAction.execute(
  'package-mapping',
  [HttpMethod.GET, HttpMethod.POST],
  [],
  [],
  async () => {
    // TODO: Implement per migration plan §8.4.e / §11 item 8
    //   - GET  → list mappings (optionally by ?type=active|pause) via
    //            SlingRenewalPackageMappingRepository.listByType(...).
    //   - POST → upsert a mapping (SlingRenewalPackageMappingRepository.saveMapping(...));
    //            support delete via a body flag or a DELETE method as needed.
    //
    // Foundation artifacts to call:
    //   - lib/database/repository/sling-renewal-package-mapping
    //   - lib/utils/logger

    return RuntimeActionResponse.success({
      message: 'TODO: not implemented',
      action: 'package-mapping'
    })
  }
)
