/*
 * <license header>
 */

/* This file defines types for the Sling Renewal Package Mapping Collection */

import type { AbdbRecord } from '@adobe-commerce/aio-toolkit'

/** Supported renewal package mapping groups. */
export enum RenewalPackageMappingType {
  ACTIVE = 'active',
  PAUSE = 'pause'
}

/**
 * A record in the `renewal_package_mapping` ABDB collection (plan §8.4.e, §11 item 8).
 *
 * One row per (mapping_type, effective_date) bucket, holding the set of package SKUs that become
 * active (or paused) on that date.
 */
export interface SlingRenewalPackageMappingRecord extends AbdbRecord {
  /** Mapping group represented by this record. */
  mapping_type: RenewalPackageMappingType

  /** ISO-8601 effective date (source `active_from_date` / `from_date`). */
  effective_date: string

  /** JSON-encoded array of package SKUs. */
  packages: string
}
