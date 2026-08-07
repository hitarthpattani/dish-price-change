/*
 * <license header>
 */

const mockAll = jest.fn()
const mockLoadCache = jest.fn()
const mockSaveCache = jest.fn()

jest.mock('@lib/database/repository/configuration', () => ({
  ConfigurationRepository: jest.fn().mockImplementation(() => ({
    all: mockAll
  }))
}))
jest.mock('@lib/utils/cache-manager', () => ({
  CacheManager: jest.fn().mockImplementation(() => ({
    loadCache: mockLoadCache,
    saveCache: mockSaveCache
  }))
}))

import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { ConfigurationManager } from '@lib/utils/configuration-manager'
import type { ScopeTreeNode } from '@lib/utils/store-scope-tree/types'

describe('ConfigurationManager', () => {
  const scopeTree: ScopeTreeNode[] = [{ scope: 'default', scopeId: 0, label: 'Default Config' }]

  beforeEach(() => {
    mockAll.mockReset().mockResolvedValue({ 'api-key': 'value' })
    mockLoadCache.mockReset().mockResolvedValue(undefined)
    mockSaveCache.mockReset().mockResolvedValue(undefined)
    ;(ConfigurationRepository as unknown as jest.Mock).mockClear()
  })

  it('builds the underlying repository with the token and scope tree', () => {
    new ConfigurationManager('a-valid-token', scopeTree)

    expect(ConfigurationRepository).toHaveBeenCalledWith('a-valid-token', scopeTree)
  })

  describe('get', () => {
    it('returns the value for the default scope on a cache miss', async () => {
      const reader = new ConfigurationManager('a-valid-token', scopeTree)

      await expect(reader.get('api-key')).resolves.toBe('value')

      expect(mockAll).toHaveBeenCalledWith('default', 0)
      expect(mockSaveCache).toHaveBeenCalledWith('CONFIGURATION_DEFAULT_0', {
        'api-key': 'value'
      })
    })

    it('reads for a custom scope and scope id', async () => {
      const reader = new ConfigurationManager('a-valid-token', scopeTree)

      await expect(reader.get('api-key', 'store', 23)).resolves.toBe('value')

      expect(mockAll).toHaveBeenCalledWith('store', 23)
      expect(mockSaveCache).toHaveBeenCalledWith('CONFIGURATION_STORE_23', {
        'api-key': 'value'
      })
    })

    it('returns the cached configuration without calling the repository', async () => {
      mockLoadCache.mockResolvedValue({ 'api-key': 'cached-value' })
      const reader = new ConfigurationManager('a-valid-token', scopeTree)

      await expect(reader.get('api-key')).resolves.toBe('cached-value')

      expect(mockAll).not.toHaveBeenCalled()
      expect(mockSaveCache).not.toHaveBeenCalled()
    })

    it('falls through to the repository when the cache read fails', async () => {
      mockLoadCache.mockRejectedValue(new Error('state unavailable'))
      const reader = new ConfigurationManager('a-valid-token', scopeTree)

      await expect(reader.get('api-key')).resolves.toBe('value')

      expect(mockAll).toHaveBeenCalledWith('default', 0)
    })

    it('still returns the freshly read value when the cache write fails', async () => {
      mockSaveCache.mockRejectedValue(new Error('state unavailable'))
      const reader = new ConfigurationManager('a-valid-token', scopeTree)

      await expect(reader.get('api-key')).resolves.toBe('value')
    })

    it('returns null when the key is not present in the configuration', async () => {
      const reader = new ConfigurationManager('a-valid-token', scopeTree)

      await expect(reader.get('missing-key')).resolves.toBeNull()
    })
  })
})
