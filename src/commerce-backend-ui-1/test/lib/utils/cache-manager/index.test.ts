/*
 * <license header>
 */

import { CacheManager } from '@lib/utils/cache-manager'
import { State } from '@adobe/aio-sdk'

// Mock the State module
jest.mock('@adobe/aio-sdk')

interface MockAioState {
  get: jest.Mock
  put: jest.Mock
  delete: jest.Mock
  list: jest.Mock
}

describe('CacheManager', () => {
  let cacheManager: CacheManager
  let mockStateInstance: MockAioState

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock state instance with all required methods
    mockStateInstance = {
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      list: jest.fn()
    }

    // Mock State.init to return our mock instance
    ;(State.init as jest.Mock).mockResolvedValue(mockStateInstance)

    cacheManager = new CacheManager()
  })

  describe('constructor', () => {
    it('should create a CacheManager instance with default values', () => {
      expect(cacheManager).toBeInstanceOf(CacheManager)
    })

    it('should accept custom TTL and keyPrefix', () => {
      const customCacheManager = new CacheManager(7200, 'custom_')
      expect(customCacheManager).toBeInstanceOf(CacheManager)
    })

    it('should throw error for negative TTL', () => {
      expect(() => new CacheManager(-1)).toThrow('TTL must be a non-negative number')
    })

    it('should throw error for empty keyPrefix', () => {
      expect(() => new CacheManager(3600, '')).toThrow('Key prefix cannot be empty')
    })

    it('should throw error for whitespace-only keyPrefix', () => {
      expect(() => new CacheManager(3600, '   ')).toThrow('Key prefix cannot be empty')
    })

    it('should accept TTL of 0', () => {
      const cm = new CacheManager(0)
      expect(cm).toBeInstanceOf(CacheManager)
    })
  })

  describe('loadCache', () => {
    it('should load cached value successfully', async () => {
      const cachedValue = { id: 'test', value: 'data' }
      mockStateInstance.get.mockResolvedValue({
        value: JSON.stringify(cachedValue),
        expiration: '2024-12-31T23:59:59Z'
      })

      const result = await cacheManager.loadCache('test-key')

      expect(result).toEqual(cachedValue)
      expect(mockStateInstance.get).toHaveBeenCalledWith('CACHE_test-key')
      expect(State.init).toHaveBeenCalledTimes(1)
    })

    it('should return undefined for non-existent key', async () => {
      mockStateInstance.get.mockResolvedValue(undefined)

      const result = await cacheManager.loadCache('non-existent')

      expect(result).toBeUndefined()
      expect(mockStateInstance.get).toHaveBeenCalledWith('CACHE_non-existent')
    })

    it('should throw error for empty key', async () => {
      await expect(cacheManager.loadCache('')).rejects.toThrow(
        'Cache key must be a non-empty string'
      )
      expect(mockStateInstance.get).not.toHaveBeenCalled()
    })

    it('should throw error for whitespace-only key', async () => {
      await expect(cacheManager.loadCache('   ')).rejects.toThrow(
        'Cache key must be a non-empty string'
      )
    })

    it('should throw error for non-string key', async () => {
      await expect(cacheManager.loadCache(123 as unknown as string)).rejects.toThrow(
        'Cache key must be a non-empty string'
      )
    })

    it('should throw error for null key', async () => {
      await expect(cacheManager.loadCache(null as unknown as string)).rejects.toThrow(
        'Cache key must be a non-empty string'
      )
    })

    it('should throw error for undefined key', async () => {
      await expect(cacheManager.loadCache(undefined as unknown as string)).rejects.toThrow(
        'Cache key must be a non-empty string'
      )
    })

    it('should handle State.get errors', async () => {
      mockStateInstance.get.mockRejectedValue(new Error('State error'))

      await expect(cacheManager.loadCache('error-key')).rejects.toThrow(
        'Failed to load cache for key "error-key": State error'
      )
    })

    it('should handle State.get errors without message', async () => {
      mockStateInstance.get.mockRejectedValue({})

      await expect(cacheManager.loadCache('error-key')).rejects.toThrow(
        'Failed to load cache for key "error-key": Unknown error'
      )
    })

    it('should reuse state instance on multiple calls', async () => {
      mockStateInstance.get.mockResolvedValue({ data: 'test' })

      await cacheManager.loadCache('key1')
      await cacheManager.loadCache('key2')

      expect(State.init).toHaveBeenCalledTimes(1)
    })
  })

  describe('saveCache', () => {
    it('should save cache successfully with default TTL', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('test-key', { data: 'value' })

      expect(mockStateInstance.put).toHaveBeenCalledWith(
        'CACHE_test-key',
        JSON.stringify({ data: 'value' }),
        { ttl: 3600 }
      )
      expect(State.init).toHaveBeenCalledTimes(1)
    })

    it('should save cache with custom TTL', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('test-key', { data: 'value' }, 7200)

      expect(mockStateInstance.put).toHaveBeenCalledWith(
        'CACHE_test-key',
        JSON.stringify({ data: 'value' }),
        { ttl: 7200 }
      )
    })

    it('should save cache with TTL of 0', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('test-key', { data: 'value' }, 0)

      expect(mockStateInstance.put).toHaveBeenCalledWith(
        'CACHE_test-key',
        JSON.stringify({ data: 'value' }),
        { ttl: 0 }
      )
    })

    it('should save string data', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('string-key', 'simple string')

      expect(mockStateInstance.put).toHaveBeenCalledWith(
        'CACHE_string-key',
        JSON.stringify('simple string'),
        { ttl: 3600 }
      )
    })

    it('should save number data', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('number-key', 42)

      expect(mockStateInstance.put).toHaveBeenCalledWith('CACHE_number-key', JSON.stringify(42), {
        ttl: 3600
      })
    })

    it('should save boolean data', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('bool-key', true)

      expect(mockStateInstance.put).toHaveBeenCalledWith('CACHE_bool-key', JSON.stringify(true), {
        ttl: 3600
      })
    })

    it('should save null data', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('null-key', null)

      expect(mockStateInstance.put).toHaveBeenCalledWith('CACHE_null-key', JSON.stringify(null), {
        ttl: 3600
      })
    })

    it('should save empty string', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.saveCache('empty-key', '')

      expect(mockStateInstance.put).toHaveBeenCalledWith('CACHE_empty-key', JSON.stringify(''), {
        ttl: 3600
      })
    })

    it('should throw error for undefined item', async () => {
      await expect(cacheManager.saveCache('test-key', undefined)).rejects.toThrow(
        'Cache item cannot be undefined'
      )
      expect(mockStateInstance.put).not.toHaveBeenCalled()
    })

    it('should throw error for empty key', async () => {
      await expect(cacheManager.saveCache('', { data: 'value' })).rejects.toThrow(
        'Cache key must be a non-empty string'
      )
    })

    it('should throw error for whitespace-only key', async () => {
      await expect(cacheManager.saveCache('   ', { data: 'value' })).rejects.toThrow(
        'Cache key must be a non-empty string'
      )
    })

    it('should throw error for negative TTL', async () => {
      await expect(cacheManager.saveCache('test-key', { data: 'value' }, -1)).rejects.toThrow(
        'TTL must be a non-negative number'
      )
    })

    it('should throw error for non-numeric TTL', async () => {
      await expect(
        cacheManager.saveCache('test-key', { data: 'value' }, 'invalid' as unknown as number)
      ).rejects.toThrow('TTL must be a non-negative number')
    })

    it('should handle State.put errors', async () => {
      mockStateInstance.put.mockRejectedValue(new Error('State error'))

      await expect(cacheManager.saveCache('error-key', { data: 'value' })).rejects.toThrow(
        'Failed to save cache for key "error-key": State error'
      )
    })

    it('should handle State.put errors without message', async () => {
      mockStateInstance.put.mockRejectedValue({})

      await expect(cacheManager.saveCache('error-key', { data: 'value' })).rejects.toThrow(
        'Failed to save cache for key "error-key": Unknown error'
      )
    })

    it('should use custom key prefix', async () => {
      const customCacheManager = new CacheManager(3600, 'custom_')
      ;(State.init as jest.Mock).mockResolvedValue(mockStateInstance)
      mockStateInstance.put.mockResolvedValue(undefined)

      await customCacheManager.saveCache('test', { data: 'value' })

      expect(mockStateInstance.put).toHaveBeenCalledWith(
        'custom_test',
        JSON.stringify({ data: 'value' }),
        { ttl: 3600 }
      )
    })
  })

  describe('deleteCache', () => {
    it('should delete single cache key successfully', async () => {
      mockStateInstance.delete.mockResolvedValue(undefined)

      const result = await cacheManager.deleteCache(['test-key'])

      expect(result).toBe(true)
      expect(mockStateInstance.delete).toHaveBeenCalledWith('CACHE_test-key')
      expect(mockStateInstance.delete).toHaveBeenCalledTimes(1)
    })

    it('should delete multiple cache keys successfully', async () => {
      mockStateInstance.delete.mockResolvedValue(undefined)

      const result = await cacheManager.deleteCache(['key1', 'key2', 'key3'])

      expect(result).toBe(true)
      expect(mockStateInstance.delete).toHaveBeenCalledTimes(3)
      expect(mockStateInstance.delete).toHaveBeenCalledWith('CACHE_key1')
      expect(mockStateInstance.delete).toHaveBeenCalledWith('CACHE_key2')
      expect(mockStateInstance.delete).toHaveBeenCalledWith('CACHE_key3')
    })

    it('should throw error for non-array keys', async () => {
      await expect(cacheManager.deleteCache('not-array' as unknown as string[])).rejects.toThrow(
        'Keys must be an array'
      )
      expect(mockStateInstance.delete).not.toHaveBeenCalled()
    })

    it('should throw error for empty array', async () => {
      await expect(cacheManager.deleteCache([])).rejects.toThrow('Keys array cannot be empty')
      expect(mockStateInstance.delete).not.toHaveBeenCalled()
    })

    it('should throw error for array with empty string', async () => {
      await expect(cacheManager.deleteCache(['valid', ''])).rejects.toThrow(
        'All keys must be non-empty strings'
      )
    })

    it('should throw error for array with whitespace-only string', async () => {
      await expect(cacheManager.deleteCache(['valid', '   '])).rejects.toThrow(
        'All keys must be non-empty strings'
      )
    })

    it('should throw error for array with non-string', async () => {
      await expect(cacheManager.deleteCache(['valid', 123 as unknown as string])).rejects.toThrow(
        'All keys must be non-empty strings'
      )
    })

    it('should throw error for array with null', async () => {
      await expect(cacheManager.deleteCache(['valid', null as unknown as string])).rejects.toThrow(
        'All keys must be non-empty strings'
      )
    })

    it('should throw error for array with undefined', async () => {
      await expect(
        cacheManager.deleteCache(['valid', undefined as unknown as string])
      ).rejects.toThrow('All keys must be non-empty strings')
    })

    it('should handle State.delete errors', async () => {
      mockStateInstance.delete.mockRejectedValue(new Error('State error'))

      await expect(cacheManager.deleteCache(['error-key'])).rejects.toThrow(
        'Failed to delete cache keys: State error'
      )
    })

    it('should handle State.delete errors without message', async () => {
      mockStateInstance.delete.mockRejectedValue({})

      await expect(cacheManager.deleteCache(['error-key'])).rejects.toThrow(
        'Failed to delete cache keys: Unknown error'
      )
    })

    it('should handle partial deletion errors', async () => {
      mockStateInstance.delete
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Delete error'))

      await expect(cacheManager.deleteCache(['key1', 'key2'])).rejects.toThrow(
        'Failed to delete cache keys: Delete error'
      )
    })
  })

  describe('listCache', () => {
    it('should list cache entries successfully', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_key1', 'CACHE_key2'] }
      })
      mockStateInstance.get
        .mockResolvedValueOnce({
          value: JSON.stringify({ foo: 'bar1' }),
          expiration: '2024-12-31T23:59:59Z'
        })
        .mockResolvedValueOnce({
          value: JSON.stringify({ foo: 'bar2' }),
          expiration: '2024-12-31T23:59:59Z'
        })

      const result = await cacheManager.listCache()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'key1',
        key: 'KEY1',
        value: { foo: 'bar1' },
        expiration: '2024-12-31T23:59:59Z'
      })
      expect(result[1]).toEqual({
        id: 'key2',
        key: 'KEY2',
        value: { foo: 'bar2' },
        expiration: '2024-12-31T23:59:59Z'
      })
      expect(mockStateInstance.list).toHaveBeenCalledWith({ match: 'CACHE_*' })
    })

    it('should return empty array when no cache entries exist', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        // No yields
      })

      const result = await cacheManager.listCache()

      expect(result).toEqual([])
    })

    it('should handle multiple batches from state.list', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_key1', 'CACHE_key2'] }
        yield { keys: ['CACHE_key3'] }
      })
      mockStateInstance.get
        .mockResolvedValueOnce({ data: 'value1' })
        .mockResolvedValueOnce({ data: 'value2' })
        .mockResolvedValueOnce({ data: 'value3' })

      const result = await cacheManager.listCache()

      expect(result).toHaveLength(3)
      expect(mockStateInstance.get).toHaveBeenCalledTimes(3)
    })

    it('should handle cache values without expiration', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_key1'] }
      })
      mockStateInstance.get.mockResolvedValueOnce({ data: 'value' })

      const result = await cacheManager.listCache()

      expect(result[0]?.expiration).toBe('N/A')
    })

    it('should handle null cache values', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_key1'] }
      })
      mockStateInstance.get.mockResolvedValueOnce({
        value: JSON.stringify(null),
        expiration: '2025-01-01T00:00:00Z'
      })

      const result = await cacheManager.listCache()

      expect(result[0]).toEqual({
        id: 'key1',
        key: 'KEY1',
        value: null,
        expiration: '2025-01-01T00:00:00Z'
      })
    })

    it('should handle a key deleted between the list scan and the get call', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_key1'] }
      })
      mockStateInstance.get.mockResolvedValueOnce(undefined)

      const result = await cacheManager.listCache()

      expect(result[0]).toEqual({
        id: 'key1',
        key: 'KEY1',
        value: undefined,
        expiration: 'N/A'
      })
    })

    it('should handle State.list errors', async () => {
      // eslint-disable-next-line require-yield
      mockStateInstance.list.mockImplementation(async function* () {
        throw new Error('List error')
      })

      await expect(cacheManager.listCache()).rejects.toThrow('Failed to list cache: List error')
    })

    it('should handle errors during key loading', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_key1'] }
      })
      mockStateInstance.get.mockRejectedValue(new Error('Get error'))

      await expect(cacheManager.listCache()).rejects.toThrow('Failed to list cache')
    })

    it('should handle list errors without message', async () => {
      // eslint-disable-next-line require-yield
      mockStateInstance.list.mockImplementation(async function* () {
        // eslint-disable-next-line no-throw-literal
        throw { toString: () => '' }
      })

      await expect(cacheManager.listCache()).rejects.toThrow('Failed to list cache: Unknown error')
    })

    it('should use custom key prefix in listing', async () => {
      const customCacheManager = new CacheManager(3600, 'custom_')
      ;(State.init as jest.Mock).mockResolvedValue(mockStateInstance)
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['custom_key1'] }
      })
      mockStateInstance.get.mockResolvedValueOnce({ data: 'value' })

      const result = await customCacheManager.listCache()

      expect(mockStateInstance.list).toHaveBeenCalledWith({ match: 'custom_*' })
      expect(result[0]?.id).toBe('key1')
    })
  })

  describe('State initialization', () => {
    it('should initialize State only once', async () => {
      mockStateInstance.get.mockResolvedValue({ data: 'test' })
      mockStateInstance.put.mockResolvedValue(undefined)

      await cacheManager.loadCache('key1')
      await cacheManager.saveCache('key2', 'value')
      await cacheManager.loadCache('key3')

      expect(State.init).toHaveBeenCalledTimes(1)
    })

    it('should handle concurrent State initialization', async () => {
      mockStateInstance.get.mockResolvedValue({ data: 'test' })

      const promises = [
        cacheManager.loadCache('key1'),
        cacheManager.loadCache('key2'),
        cacheManager.loadCache('key3')
      ]

      await Promise.all(promises)

      expect(State.init).toHaveBeenCalledTimes(1)
    })

    it('should handle State.init errors', async () => {
      ;(State.init as jest.Mock).mockRejectedValue(new Error('Init failed'))
      const newCacheManager = new CacheManager()

      await expect(newCacheManager.loadCache('key')).rejects.toThrow('Failed to load cache')
    })
  })

  describe('edge cases for defensive validations', () => {
    // These tests cover defensive validation in private methods (addPrefix/removePrefix)
    // that are normally unreachable because public methods validate first.
    // Testing these ensures defense-in-depth and 100% code coverage.

    it('should validate keys in addPrefix (defensive)', () => {
      // This tests the defensive validation in addPrefix that's normally unreachable
      // because all public methods validate keys before calling addPrefix.
      // Testing it ensures the defense-in-depth works if code is refactored.
      expect(() =>
        (cacheManager as unknown as { addPrefix: (key: string) => string }).addPrefix('')
      ).toThrow('Cache key must be a non-empty string')
    })

    it('should handle invalid keys from state.list gracefully', async () => {
      // Simulate state.list returning invalid/malformed keys (empty string)
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_valid', '', 'CACHE_another'] }
      })
      mockStateInstance.get
        .mockResolvedValueOnce({ data: 'value1' })
        .mockResolvedValueOnce({ data: 'value2' })
        .mockResolvedValueOnce({ data: 'value3' })

      // This should catch the empty string in removePrefix validation
      await expect(cacheManager.listCache()).rejects.toThrow('Cache key must be a non-empty string')
    })

    it('should handle non-string keys from state.list', async () => {
      // Simulate state.list returning non-string keys
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_valid', null as unknown as string] }
      })
      mockStateInstance.get.mockResolvedValue({ data: 'value' })

      await expect(cacheManager.listCache()).rejects.toThrow('Cache key must be a non-empty string')
    })

    it('should handle whitespace-only keys from state.list', async () => {
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_valid', '   '] }
      })
      mockStateInstance.get.mockResolvedValue({ data: 'value' })

      await expect(cacheManager.listCache()).rejects.toThrow('Cache key must be a non-empty string')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete cache lifecycle', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)
      mockStateInstance.get.mockResolvedValue({
        value: JSON.stringify({ data: 'test-data' }),
        expiration: '2025-01-01T00:00:00Z'
      })
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: ['CACHE_test-key'] }
      })
      mockStateInstance.delete.mockResolvedValue(undefined)

      // Save
      await cacheManager.saveCache('test-key', { data: 'test-data' })
      expect(mockStateInstance.put).toHaveBeenCalled()

      // Load
      const loadResult = await cacheManager.loadCache('test-key')
      expect(loadResult).toEqual({ data: 'test-data' })

      // List
      const listResult = await cacheManager.listCache()
      expect(listResult).toHaveLength(1)

      // Delete
      const deleteResult = await cacheManager.deleteCache(['test-key'])
      expect(deleteResult).toBe(true)

      expect(State.init).toHaveBeenCalledTimes(1)
    })

    it('should handle parallel operations', async () => {
      mockStateInstance.put.mockResolvedValue(undefined)
      mockStateInstance.get.mockResolvedValue({
        value: JSON.stringify({ data: 'test' }),
        expiration: '2025-01-01T00:00:00Z'
      })
      mockStateInstance.delete.mockResolvedValue(undefined)
      mockStateInstance.list.mockImplementation(async function* () {
        yield { keys: [] }
      })

      const results = await Promise.all([
        cacheManager.saveCache('key1', { data: 'value1' }),
        cacheManager.loadCache('key2'),
        cacheManager.deleteCache(['key3']),
        cacheManager.listCache()
      ])

      expect(results[0]).toBeUndefined()
      expect(results[1]).toEqual({ data: 'test' })
      expect(results[2]).toBe(true)
      expect(results[3]).toEqual([])
    })
  })
})
