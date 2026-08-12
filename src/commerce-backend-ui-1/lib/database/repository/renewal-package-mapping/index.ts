/*
 * <license header>
 */

/* This file exposes the RenewalPackageMappingRepository class */

import { AbdbRepository } from '@adobe-commerce/aio-toolkit'
import { ObjectId } from 'bson'
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
   * Create a new mapping row, or update an existing one by `id`.
   *
   * Explicitly branches on `id` rather than upserting by `mapping_type` + `effective_date` —
   * that filter previously matched (and silently overwrote) an unrelated existing row sharing the
   * same `mapping_type` when creating a new mapping. Editing by `id` also means changing
   * `effective_date` on an existing row now updates that row in place instead of creating a
   * duplicate.
   *
   * @param rec - Mapping fields to save.
   * @param id - ABDB identifier of the mapping to update; omitted when creating a new mapping.
   * @returns The saved mapping record.
   * @throws Error When the mapping type or packages list is invalid.
   */
  public async saveMapping(
    rec: SlingRenewalPackageMappingRecord,
    id?: string
  ): Promise<SlingRenewalPackageMappingRecord> {
    this.assertMappingType(rec.mapping_type)
    this.assertPackages(rec.packages)

    if (id) {
      await this.updateOne(rec, { _id: new ObjectId(id) }, { upsert: true })
      return { ...rec, _id: id }
    }

    const result = await this.insertOne(rec)
    return { ...rec, _id: String(result.insertedId) }
  }

  /**
   * Delete mapping rows by id (row-level and mass delete actions).
   *
   * @param ids - ABDB identifiers of the mappings to delete.
   * @returns Number of records deleted; zero when `ids` is empty.
   */
  public async deleteMappings(ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0
    }

    const result = await this.delete({ _id: { $in: ids.map(id => new ObjectId(id)) } })
    return typeof result.deletedCount === 'number' ? result.deletedCount : 0
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
