/*
 * <license header>
 */

import { ConfigurationRepository } from '@lib/database/repository/configuration'
import type { ConfigurationRecord } from '@lib/database/collection/configuration/types'
import type { ScopeTreeNode } from '@lib/utils/store-scope-tree/types'

describe('ConfigurationRepository', () => {
  /** Scope tree in which store view 23 belongs to website 5, used by the hierarchy tests below. */
  const scopeTree: ScopeTreeNode[] = [
    { scope: 'default', scopeId: 0, label: 'Default Config' },
    {
      scope: 'website',
      scopeId: 5,
      code: 'main',
      label: 'Main Website',
      children: [
        {
          code: 'main',
          label: 'Main Store',
          children: [{ scope: 'store', scopeId: 23, code: 'main_store', label: 'Main Store View' }]
        }
      ]
    }
  ]

  const createRepository = (tree: ScopeTreeNode[] = scopeTree) =>
    new ConfigurationRepository('a-valid-token', tree)

  const defaultConfig = (
    ConfigurationRepository as unknown as { DEFAULT_CONFIG: Record<string, string> }
  ).DEFAULT_CONFIG

  // Snapshot of the real, permanently baked-in defaults (e.g. price_change_enable), so afterEach
  // can restore exactly this rather than wiping every key — defaultConfig is the live static
  // field, not a fresh object per test.
  const originalDefaultConfig: Record<string, string> = { ...defaultConfig }

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
    Object.assign(defaultConfig, originalDefaultConfig)
  })

  it('should build on top of the configuration collection', () => {
    expect(createRepository().getName()).toBe('configuration')
  })

  describe('get', () => {
    it('returns the stored value for the default scope', async () => {
      const repository = createRepository()
      const findOne = jest.spyOn(repository, 'findOne').mockResolvedValueOnce(record())

      await expect(repository.get('api-key')).resolves.toBe('stored-value')

      expect(findOne).toHaveBeenNthCalledWith(1, { key: 'api-key', scope: 'default', scope_id: 0 })
    })

    it('reads from a custom scope, falling through the resolved chain', async () => {
      const repository = createRepository()
      const findOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(record({ scope: 'website', scope_id: 2 }))

      await expect(repository.get('api-key', 'website', 2)).resolves.toBe('stored-value')

      expect(findOne).toHaveBeenNthCalledWith(1, { key: 'api-key', scope: 'default', scope_id: 0 })
      expect(findOne).toHaveBeenNthCalledWith(2, { key: 'api-key', scope: 'website', scope_id: 2 })
    })

    it('falls back to the default config when the stored value is empty', async () => {
      defaultConfig['api-key'] = 'fallback-value'
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(record({ value: '' }))

      await expect(repository.get('api-key')).resolves.toBe('fallback-value')
    })

    it('returns null when the stored value is empty and no default is configured', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(record({ value: '' }))

      await expect(repository.get('api-key')).resolves.toBeNull()
    })

    it('returns the default config when no record exists', async () => {
      defaultConfig['api-key'] = 'default-value'
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null)

      await expect(repository.get('api-key')).resolves.toBe('default-value')
    })

    it('defaults price_change_enable to "0" when no record exists', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null)

      await expect(repository.get('price_change_enable')).resolves.toBe('0')
    })

    it('returns null when no record exists and no default is configured', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null)

      await expect(repository.get('api-key')).resolves.toBeNull()
    })

    describe('scope chain inheritance', () => {
      /** Mocks findOne to resolve per (key, scope, scope_id), independent of call order. */
      const mockFindOneByFilter = (
        repository: ConfigurationRepository,
        records: Record<string, ConfigurationRecord | null>
      ) =>
        jest.spyOn(repository, 'findOne').mockImplementation(async filter => {
          const {
            key,
            scope,
            scope_id: scopeId
          } = filter as {
            key: string
            scope: string
            scope_id: number
          }
          return records[`${key}:${scope}:${scopeId}`] ?? null
        })

      it('lets the narrowest scope in the chain override broader ones', async () => {
        const repository = createRepository()
        mockFindOneByFilter(repository, {
          'api-key:default:0': record({ scope: 'default', scope_id: 0, value: 'default-value' }),
          'api-key:website:5': record({ scope: 'website', scope_id: 5, value: 'website-value' }),
          'api-key:store:23': record({ scope: 'store', scope_id: 23, value: 'store-value' })
        })

        await expect(repository.get('api-key', 'store', 23)).resolves.toBe('store-value')
      })

      it('falls through to a broader scope when the narrowest scope has no value for the key', async () => {
        const repository = createRepository()
        mockFindOneByFilter(repository, {
          'api-key:default:0': record({ scope: 'default', scope_id: 0, value: 'default-value' }),
          'api-key:website:5': record({ scope: 'website', scope_id: 5, value: 'website-value' })
          // no entry for store:23 -> findOne resolves null, falls through to website
        })

        await expect(repository.get('api-key', 'store', 23)).resolves.toBe('website-value')
      })
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

    it('treats a "Document not found" findOne error as no existing record and inserts', async () => {
      const repository = createRepository()
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(
          new Error(
            'AbdbCollection: unexpected error: Request abc to v1/collection/configuration/findOne failed: Document not found'
          )
        )
      const insertOne = jest.spyOn(repository, 'insertOne').mockResolvedValue({})

      await repository.set({ 'api-key': 'new-value' })

      expect(insertOne).toHaveBeenCalledWith({
        key: 'api-key',
        value: 'new-value',
        scope: 'default',
        scope_id: 0
      })
    })

    it('propagates a genuine findOne Error unrelated to a missing document', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('network timeout'))

      await expect(repository.set({ 'api-key': 'new-value' })).rejects.toThrow('network timeout')
    })

    it('propagates a non-Error value thrown by findOne', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'findOne').mockRejectedValue('boom')

      await expect(repository.set({ 'api-key': 'new-value' })).rejects.toBe('boom')
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

      await expect(repository.all()).resolves.toEqual({
        price_change_enable: '0',
        'api-key': 'default-value'
      })
    })

    it('merges stored records over the default config', async () => {
      defaultConfig['api-key'] = 'default-value'
      const repository = createRepository()
      const find = jest
        .spyOn(repository, 'find')
        .mockResolvedValue([record({ key: 'api-key', value: 'stored-value' })])

      await expect(repository.all()).resolves.toEqual({
        price_change_enable: '0',
        'api-key': 'stored-value'
      })
      expect(find).toHaveBeenCalledWith({ scope: 'default', scope_id: 0 })
    })

    it('reads a custom scope', async () => {
      const repository = createRepository()
      const find = jest
        .spyOn(repository, 'find')
        .mockResolvedValue([record({ key: 'other-key', value: 'other-value', scope: 'store' })])

      await expect(repository.all('store', 5)).resolves.toEqual({
        price_change_enable: '0',
        'other-key': 'other-value'
      })
      expect(find).toHaveBeenCalledWith({ scope: 'store', scope_id: 5 })
    })

    it('merges multiple scope layers, the narrowest layer overriding broader ones per key', async () => {
      const repository = createRepository()
      const find = jest.spyOn(repository, 'find').mockImplementation(async filter => {
        const { scope, scope_id: scopeId } = filter as { scope: string; scope_id: number }
        if (scope === 'default' && scopeId === 0) {
          return [
            record({ key: 'shared-key', value: 'default-value', scope: 'default', scope_id: 0 }),
            record({
              key: 'default-only-key',
              value: 'default-only',
              scope: 'default',
              scope_id: 0
            })
          ]
        }
        if (scope === 'website' && scopeId === 5) {
          return [
            record({ key: 'shared-key', value: 'website-value', scope: 'website', scope_id: 5 })
          ]
        }
        if (scope === 'store' && scopeId === 23) {
          return [record({ key: 'shared-key', value: 'store-value', scope: 'store', scope_id: 23 })]
        }
        return []
      })

      await expect(repository.all('store', 23)).resolves.toEqual({
        price_change_enable: '0',
        'default-only-key': 'default-only',
        'shared-key': 'store-value'
      })
      expect(find).toHaveBeenCalledTimes(3)
    })

    it('falls through to a broader layer for a key the narrowest layer does not define', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'find').mockImplementation(async filter => {
        const { scope, scope_id: scopeId } = filter as { scope: string; scope_id: number }
        if (scope === 'website' && scopeId === 5) {
          return [
            record({ key: 'shared-key', value: 'website-value', scope: 'website', scope_id: 5 })
          ]
        }
        // default and store layers have no records for this key
        return []
      })

      await expect(repository.all('store', 23)).resolves.toEqual({
        price_change_enable: '0',
        'shared-key': 'website-value'
      })
    })
  })
})
