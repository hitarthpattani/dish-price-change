/*
 * <license header>
 */

import { SlingRenewalPackageMappingCollection } from '@lib/database/collection/sling-renewal-package-mapping'

describe('SlingRenewalPackageMappingCollection', () => {
  it('should be named sling_renewal_package_mapping', () => {
    const collection = new SlingRenewalPackageMappingCollection()

    expect(collection.getName()).toBe('sling_renewal_package_mapping')
  })

  it('should declare all expected columns', () => {
    const collection = new SlingRenewalPackageMappingCollection()

    const columnNames = collection.getColumns().map(column => column.getName())

    expect(columnNames).toEqual(['mapping_type', 'effective_date', 'packages'])
  })
})
