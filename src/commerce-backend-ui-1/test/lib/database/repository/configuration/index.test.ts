/*
 * <license header>
 */

import { ConfigurationRepository } from '@lib/database/repository/configuration'
import type { ConfigurationRecord } from '@lib/database/collection/configuration/types'

describe('ConfigurationRepository', () => {
  const createRepository = () => new ConfigurationRepository('a-valid-token')

  const defaultConfig = (
    ConfigurationRepository as unknown as { DEFAULT_CONFIG: Record<string, string> }
  ).DEFAULT_CONFIG

  const record = (overrides: Partial<ConfigurationRecord> = {}): ConfigurationRecord => ({
    key: 'api-key',
    value: 'stored-value',
    scope: 'default',
    scope_id: 0,
    ...overrides
  })

  afterEach(() => {
    jest.restoreAllMocks()
    for (const key of Object.keys(defaultConfig)) {
      delete defaultConfig[key]
    }
  })

  it('should build on top of the configuration collection', () => {
    expect(createRepository().getName()).toBe('configuration')
  })

  describe('get', () => {
    it('returns the stored value for the default scope', async () => {
      const repository = createRepository()
      const findOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record())
        .mockResolvedValueOnce(null)

      await expect(repository.get('api-key')).resolves.toBe('stored-value')

      expect(findOne).toHaveBeenNthCalledWith(1, { key: 'api-key', scope: 'default', scope_id: 0 })
      expect(findOne).toHaveBeenNthCalledWith(2, {
        key: 'api-key-env',
        scope: 'default',
        scope_id: 0
      })
    })

    it('reads from a custom scope and scope id', async () => {
      const repository = createRepository()
      const findOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record({ scope: 'website', scope_id: 2 }))
        .mockResolvedValueOnce(null)

      await expect(repository.get('api-key', {}, 'website', 2)).resolves.toBe('stored-value')

      expect(findOne).toHaveBeenNthCalledWith(1, { key: 'api-key', scope: 'website', scope_id: 2 })
    })

    it('falls back to the default config when the stored value is empty', async () => {
      defaultConfig['api-key'] = 'fallback-value'
      const repository = createRepository()
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record({ value: '' }))
        .mockResolvedValueOnce(null)

      await expect(repository.get('api-key')).resolves.toBe('fallback-value')
    })

    it('returns null when the stored value is empty and no default is configured', async () => {
      const repository = createRepository()
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record({ value: '' }))
        .mockResolvedValueOnce(null)

      await expect(repository.get('api-key')).resolves.toBeNull()
    })

    it('returns the default config when no record exists', async () => {
      defaultConfig['api-key'] = 'default-value'
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce(null)

      await expect(repository.get('api-key')).resolves.toBe('default-value')
    })

    it('returns null when no record exists and no default is configured', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce(null)

      await expect(repository.get('api-key')).resolves.toBeNull()
    })

    it('applies the environment override when the env var is present in params', async () => {
      const repository = createRepository()
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record())
        .mockResolvedValueOnce(record({ key: 'api-key-env', value: 'API_KEY' }))

      await expect(repository.get('api-key', { API_KEY: 'env-value' })).resolves.toBe('env-value')
    })

    it('ignores the environment override when the env var is not provided in params', async () => {
      const repository = createRepository()
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record())
        .mockResolvedValueOnce(record({ key: 'api-key-env', value: 'API_KEY' }))

      await expect(repository.get('api-key', {})).resolves.toBe('stored-value')
    })

    it('ignores an env record with an empty value', async () => {
      const repository = createRepository()
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record())
        .mockResolvedValueOnce(record({ key: 'api-key-env', value: '' }))

      await expect(repository.get('api-key', { API_KEY: 'env-value' })).resolves.toBe(
        'stored-value'
      )
    })

    it('resolves to null when the override param is explicitly null', async () => {
      const repository = createRepository()
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(record())
        .mockResolvedValueOnce(record({ key: 'api-key-env', value: 'API_KEY' }))

      await expect(
        repository.get('api-key', { API_KEY: null as unknown as string })
      ).resolves.toBeNull()
    })
  })

  describe('set', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['an array', ['not-an-object']],
      ['a string', 'not-an-object'],
      ['a number', 42]
    ])('rejects records that are %s', async (_description, records) => {
      await expect(
        createRepository().set(records as unknown as Record<string, string>)
      ).rejects.toThrow('Records must be a valid object')
    })

    it('updates an existing key for the default scope', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValue(record())
      const updateOne = jest.spyOn(repository, 'updateOne').mockResolvedValue({})

      await repository.set({ 'api-key': 'new-value' })

      expect(updateOne).toHaveBeenCalledWith(
        { value: 'new-value' },
        { key: 'api-key', scope: 'default', scope_id: 0 }
      )
    })

    it('inserts a new key for the default scope', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      const insertOne = jest.spyOn(repository, 'insertOne').mockResolvedValue({})

      await repository.set({ 'api-key': 'new-value' })

      expect(insertOne).toHaveBeenCalledWith({
        key: 'api-key',
        value: 'new-value',
        scope: 'default',
        scope_id: 0
      })
    })

    it('writes to a custom scope and scope id', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      const insertOne = jest.spyOn(repository, 'insertOne').mockResolvedValue({})

      await repository.set({ 'api-key': 'new-value' }, 'website', 2)

      expect(insertOne).toHaveBeenCalledWith({
        key: 'api-key',
        value: 'new-value',
        scope: 'website',
        scope_id: 2
      })
    })

    it('upserts multiple keys independently', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockImplementation(async filter => {
        const key = (filter as Record<string, unknown>).key
        return key === 'existing-key' ? record({ key: 'existing-key' }) : null
      })
      const updateOne = jest.spyOn(repository, 'updateOne').mockResolvedValue({})
      const insertOne = jest.spyOn(repository, 'insertOne').mockResolvedValue({})

      await repository.set({ 'existing-key': 'updated', 'new-key': 'inserted' })

      expect(updateOne).toHaveBeenCalledWith(
        { value: 'updated' },
        { key: 'existing-key', scope: 'default', scope_id: 0 }
      )
      expect(insertOne).toHaveBeenCalledWith({
        key: 'new-key',
        value: 'inserted',
        scope: 'default',
        scope_id: 0
      })
    })
  })

  describe('all', () => {
    it('returns only default config when no records are stored', async () => {
      defaultConfig['api-key'] = 'default-value'
      const repository = createRepository()
      jest.spyOn(repository, 'find').mockResolvedValue([])

      await expect(repository.all()).resolves.toEqual({ 'api-key': 'default-value' })
    })

    it('merges stored records over the default config', async () => {
      defaultConfig['api-key'] = 'default-value'
      const repository = createRepository()
      const find = jest
        .spyOn(repository, 'find')
        .mockResolvedValue([record({ key: 'api-key', value: 'stored-value' })])

      await expect(repository.all()).resolves.toEqual({ 'api-key': 'stored-value' })
      expect(find).toHaveBeenCalledWith({ scope: 'default', scope_id: 0 })
    })

    it('reads a custom scope and scope id', async () => {
      const repository = createRepository()
      const find = jest
        .spyOn(repository, 'find')
        .mockResolvedValue([record({ key: 'other-key', value: 'other-value', scope: 'store' })])

      await expect(repository.all('store', 5)).resolves.toEqual({ 'other-key': 'other-value' })
      expect(find).toHaveBeenCalledWith({ scope: 'store', scope_id: 5 })
    })
  })
})
