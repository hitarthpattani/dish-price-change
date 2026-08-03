/*
 * <license header>
 */

import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'
import {
  RenewalPackageMappingType,
  SlingRenewalPackageMappingRecord
} from '@lib/database/collection/renewal-package-mapping/types'

describe('RenewalPackageMappingRepository', () => {
  const validId = '507f1f77bcf86cd799439011'
  const record: SlingRenewalPackageMappingRecord = {
    mapping_type: RenewalPackageMappingType.ACTIVE,
    effective_date: '2026-01-01T00:00:00.000Z',
    packages: '["SKU-1","SKU-2"]'
  }

  const createRepository = () => new RenewalPackageMappingRepository('a-valid-token')

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should build on top of the renewal_package_mapping collection', () => {
    expect(createRepository().getName()).toBe('renewal_package_mapping')
  })

  it('exports the supported mapping types', () => {
    expect(RenewalPackageMappingType).toEqual({ ACTIVE: 'active', PAUSE: 'pause' })
  })

  describe('listByType', () => {
    it('lists one mapping type ordered by effective date', async () => {
      const repository = createRepository()
      const find = jest.spyOn(repository, 'find').mockResolvedValue([record])

      await expect(repository.listByType(RenewalPackageMappingType.ACTIVE)).resolves.toEqual([
        record
      ])
      expect(find).toHaveBeenCalledWith(
        { mapping_type: RenewalPackageMappingType.ACTIVE },
        { sort: { column: 'effective_date', direction: 'asc' } }
      )
    })

    it('rejects unsupported mapping types', async () => {
      await expect(
        createRepository().listByType('other' as RenewalPackageMappingType)
      ).rejects.toThrow('mapping_type must be active or pause')
    })

    it('accepts pause mappings', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'find').mockResolvedValue([])

      await expect(repository.listByType(RenewalPackageMappingType.PAUSE)).resolves.toEqual([])
    })
  })

  describe('saveMapping', () => {
    it('upserts by mapping type and effective date and returns the stored row', async () => {
      const repository = createRepository()
      const updateOne = jest.spyOn(repository, 'updateOne').mockResolvedValue({ upsertedCount: 1 })
      const findOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ ...record, _id: validId })

      await expect(repository.saveMapping(record)).resolves.toEqual({ ...record, _id: validId })
      expect(updateOne).toHaveBeenCalledWith(
        record,
        {
          mapping_type: RenewalPackageMappingType.ACTIVE,
          effective_date: record.effective_date
        },
        { upsert: true }
      )
      expect(findOne).toHaveBeenCalledWith({
        mapping_type: RenewalPackageMappingType.ACTIVE,
        effective_date: record.effective_date
      })
    })

    it('rejects invalid package JSON', async () => {
      await expect(createRepository().saveMapping({ ...record, packages: '{}' })).rejects.toThrow(
        'packages must be a non-empty JSON array of package SKUs'
      )
    })

    it('fails when an upsert cannot be read back', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'updateOne').mockResolvedValue({ upsertedCount: 1 })
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)

      await expect(repository.saveMapping(record)).rejects.toThrow(
        'Mapping was not found after upsert'
      )
    })

    it.each([
      ['malformed JSON', '['],
      ['an empty array', '[]'],
      ['a blank SKU', '[""]'],
      ['a non-string SKU', '[1]']
    ])('rejects packages containing %s', async (_description, packages) => {
      await expect(createRepository().saveMapping({ ...record, packages })).rejects.toThrow(
        /packages must be/
      )
    })
  })

  describe('deleteMapping', () => {
    it('deletes a mapping by id', async () => {
      const repository = createRepository()
      const deleteById = jest.spyOn(repository, 'deleteById').mockResolvedValue({ deletedCount: 1 })

      await repository.deleteMapping(validId)

      expect(deleteById).toHaveBeenCalledWith(validId)
    })
  })
})
