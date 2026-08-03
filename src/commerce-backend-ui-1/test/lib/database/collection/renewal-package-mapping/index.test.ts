/*
 * <license header>
 */

import { RenewalPackageMappingCollection } from '@lib/database/collection/renewal-package-mapping'

describe('RenewalPackageMappingCollection', () => {
  it('should be named renewal_package_mapping', () => {
    const collection = new RenewalPackageMappingCollection()

    expect(collection.getName()).toBe('renewal_package_mapping')
  })

  it('should declare all expected columns', () => {
    const collection = new RenewalPackageMappingCollection()

    const columnNames = collection.getColumns().map(column => column.getName())

    expect(columnNames).toEqual(['mapping_type', 'effective_date', 'packages'])
  })
})
