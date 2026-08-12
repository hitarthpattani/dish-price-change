/*
 * <license header>
 */

/* This file exposes the RenewalPackageMappingCollection class */

import { AbdbCollection, AbdbColumnType } from '@adobe-commerce/aio-toolkit'

/**
 * ABDB collection for the Active/Pause renewal package → date mappings (plan §8.4.e).
 *
 * Reinterpretation §11 item 8 — RESOLVED (ABDB collection + SPA grid): the source stored these as
 * dynamic date-keyed admin grids; here they live in a dedicated ABDB collection, written by the
 * Active/Pause mapping screens and read by the eligibility engine (lib/price-change/eligibility).
 */
export class RenewalPackageMappingCollection extends AbdbCollection {
  constructor() {
    super('renewal_package_mapping', collection => {
      collection
        .addColumn('mapping_type', AbdbColumnType.STRING, 'Mapping Type (active|pause)', true)
        .addColumn('effective_date', AbdbColumnType.STRING, 'Effective Date (ISO-8601)', true)
        .addColumn('packages', AbdbColumnType.STRING, 'Package SKUs (comma-separated)', true)
    })
  }
}
