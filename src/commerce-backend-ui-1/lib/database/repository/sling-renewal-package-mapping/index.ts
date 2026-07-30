/*
 * <license header>
 */

/* This file exposes the SlingRenewalPackageMappingRepository class */

import { AbdbRepository } from '@adobe-commerce/aio-toolkit'
import { SlingRenewalPackageMappingCollection } from '@lib/database/collection/sling-renewal-package-mapping'
import { SlingRenewalPackageMappingRecord } from '@lib/database/collection/sling-renewal-package-mapping/types'

/**
 * Repository for the `sling_renewal_package_mapping` ABDB collection (plan §8.4.e, §11 item 8).
 *
 * Written by: the Active/Pause mapping screens via the `price-change/package-mapping` action.
 * Read by: the eligibility engine (lib/price-change/eligibility) + package-pricing.
 */
export class SlingRenewalPackageMappingRepository extends AbdbRepository<SlingRenewalPackageMappingRecord> {
  constructor(token: string) {
    super(new SlingRenewalPackageMappingCollection(), token)
  }

  /**
   * List all mappings of a given type (`active` | `pause`), ordered by effective_date.
   */
  public async listByType(_mappingType: string): Promise<SlingRenewalPackageMappingRecord[]> {
    // TODO: Implement per migration plan §8.4.e / §11 item 8
    // Purpose: return all mapping rows where mapping_type = mappingType.
    throw new Error('TODO: implement listByType')
  }

  /**
   * Upsert a mapping row (create or replace by mapping_type + effective_date).
   */
  public async saveMapping(
    _rec: SlingRenewalPackageMappingRecord
  ): Promise<SlingRenewalPackageMappingRecord> {
    // TODO: Implement per migration plan §8.4.e / §11 item 8
    throw new Error('TODO: implement saveMapping')
  }

  /**
   * Delete a mapping row by id.
   */
  public async deleteMapping(_id: string): Promise<void> {
    // TODO: Implement per migration plan §8.4.e / §11 item 8
    throw new Error('TODO: implement deleteMapping')
  }
}
