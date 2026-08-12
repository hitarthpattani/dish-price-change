/*
 * <license header>
 */

/* This file exposes the RenewalPackageMappingRepository class */

import { AbdbRepository } from '@adobe-commerce/aio-toolkit'
import { RenewalPackageMappingCollection } from '@lib/database/collection/renewal-package-mapping'
import {
  RenewalPackageMappingType,
  SlingRenewalPackageMappingRecord
} from '@lib/database/collection/renewal-package-mapping/types'

/**
 * Repository for the `renewal_package_mapping` ABDB collection (plan §8.4.e, §11 item 8).
 *
 * Written by: the Active/Pause mapping screens via the `price-change/package-mapping` action.
 * Read by: the eligibility engine (lib/price-change/eligibility) + package-pricing.
 */
export class RenewalPackageMappingRepository extends AbdbRepository<SlingRenewalPackageMappingRecord> {
  /**
   * @param token - A valid IMS access token used to authenticate ABDB requests.
   */
  constructor(token: string) {
    super(new RenewalPackageMappingCollection(), token)
  }

  /**
   * List all mappings of a given type (`active` | `pause`), ordered by effective_date.
   *
   * @param mappingType - Mapping group to retrieve.
   * @returns Matching mappings ordered by their effective date.
   * @throws Error When the mapping type is unsupported.
   */
  public async listByType(
    mappingType: RenewalPackageMappingType
  ): Promise<SlingRenewalPackageMappingRecord[]> {
    this.assertMappingType(mappingType)
    return this.find(
      { mapping_type: mappingType },
      { sort: { column: 'effective_date', direction: 'asc' } }
    )
  }

  /**
   * Upsert a mapping row (create or replace by mapping_type + effective_date).
   *
   * @param rec - Complete mapping record to create or replace.
   * @returns The mapping read back after the upsert.
   * @throws Error When the mapping type or packages list is invalid, or the upsert cannot be read back.
   */
  public async saveMapping(
    rec: SlingRenewalPackageMappingRecord
  ): Promise<SlingRenewalPackageMappingRecord> {
    this.assertMappingType(rec.mapping_type)
    this.assertPackages(rec.packages)

    const filter = {
      mapping_type: rec.mapping_type,
      effective_date: rec.effective_date
    }
    await this.updateOne(rec, filter, { upsert: true })

    const saved = await this.findOne(filter)
    if (!saved) {
      throw new Error('Mapping was not found after upsert')
    }

    return saved
  }

  /**
   * Delete a mapping row by id.
   *
   * @param id - ABDB identifier of the mapping to delete.
   */
  public async deleteMapping(id: string): Promise<void> {
    await this.deleteById(id)
  }

  /**
   * Ensure callers cannot create arbitrary mapping groups.
   *
   * @param mappingType - Candidate mapping type.
   * @throws Error Unless the value is `active` or `pause`.
   */
  private assertMappingType(mappingType: RenewalPackageMappingType): void {
    if (
      mappingType !== RenewalPackageMappingType.ACTIVE &&
      mappingType !== RenewalPackageMappingType.PAUSE
    ) {
      throw new Error('mapping_type must be active or pause')
    }
  }

  /**
   * Validate the comma-separated package-SKU list stored in ABDB.
   *
   * @param packages - Comma-separated string expected to contain at least one non-empty SKU.
   * @throws Error When the value has no SKUs, or any SKU is blank.
   */
  private assertPackages(packages: string): void {
    const skus = packages.split(',').map(sku => sku.trim())

    if (skus.length === 0 || skus.some(sku => sku === '')) {
      throw new Error('packages must be a non-empty comma-separated list of package SKUs')
    }
  }
}
