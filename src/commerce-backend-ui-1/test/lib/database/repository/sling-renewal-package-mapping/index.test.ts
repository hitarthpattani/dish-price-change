/*
 * <license header>
 */

import { SlingRenewalPackageMappingRepository } from '@lib/database/repository/sling-renewal-package-mapping'
import { SlingRenewalPackageMappingRecord } from '@lib/database/collection/sling-renewal-package-mapping/types'

describe('SlingRenewalPackageMappingRepository', () => {
  const record: SlingRenewalPackageMappingRecord = {
    mapping_type: 'active',
    effective_date: '2026-01-01T00:00:00.000Z',
    packages: '["SKU-1","SKU-2"]'
  }

  const createRepository = () => new SlingRenewalPackageMappingRepository('a-valid-token')

  it('should build on top of the sling_renewal_package_mapping collection', () => {
    expect(createRepository().getName()).toBe('sling_renewal_package_mapping')
  })

  describe('listByType', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().listByType('active')).rejects.toThrow(
        'TODO: implement listByType'
      )
    })
  })

  describe('saveMapping', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().saveMapping(record)).rejects.toThrow(
        'TODO: implement saveMapping'
      )
    })
  })

  describe('deleteMapping', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().deleteMapping('1')).rejects.toThrow(
        'TODO: implement deleteMapping'
      )
    })
  })
})
