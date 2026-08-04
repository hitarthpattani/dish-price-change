/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as listAction } from '@actions/cache-manager/list'
import { CacheManager } from '@lib/utils/cache-manager'

// Type for OpenWhisk action parameters
type ActionParams = Record<string, unknown>

// Shape of the list action's success response body
interface ListResponseBody {
  keys: Array<{ id: string; key: string; value: unknown; expiration: string }>
  count: number
  timestamp: string
}

// Mock the CacheManager
jest.mock('@lib/utils/cache-manager')

describe('cache-manager/list action', () => {
  let mockListCache: jest.Mock

  const validParams: ActionParams = {
    __ow_headers: {
      authorization: 'Bearer token',
      'x-gw-ims-org-id': 'org-id'
    },
    __ow_method: 'get',
    LOG_LEVEL: 'silent'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockListCache = jest.fn()

    // Mock CacheManager constructor
    ;(CacheManager as jest.Mock).mockImplementation(() => ({
      listCache: mockListCache
    }))
  })

  describe('successful list operations', () => {
    it('should list cache keys successfully', async () => {
      const mockCacheKeys = [
        {
          id: 'product_mapping',
          key: 'PRODUCT_MAPPING',
          value: { data: 'test' },
          expiration: '2024-12-31T23:59:59Z'
        },
        {
          id: 'user_data',
          key: 'USER_DATA',
          value: { data: 'test2' },
          expiration: '2024-12-31T23:59:59Z'
        }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect((result.body as Record<string, unknown>).keys).toEqual(mockCacheKeys)
      expect((result.body as Record<string, unknown>).count).toBe(2)
      expect((result.body as Record<string, unknown>).timestamp).toBeDefined()
    })

    it('should return empty array when no cache keys exist', async () => {
      mockListCache.mockResolvedValue([])

      const result = (await listAction(validParams)) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect((result.body as Record<string, unknown>).keys).toEqual([])
      expect((result.body as Record<string, unknown>).count).toBe(0)
      expect((result.body as Record<string, unknown>).timestamp).toBeDefined()
    })

    it('should include timestamp in ISO format', async () => {
      mockListCache.mockResolvedValue([])

      const result = (await listAction(validParams)) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect((result.body as Record<string, unknown>).timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    })

    it('should list single cache entry', async () => {
      const mockCacheKeys = [
        {
          id: 'single_key',
          key: 'SINGLE_KEY',
          value: { data: 'value' },
          expiration: 'N/A'
        }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect((result.body as Record<string, unknown>).count).toBe(1)
      expect((result.body as Record<string, unknown>).keys).toHaveLength(1)
    })

    it('should handle cache entries with N/A expiration', async () => {
      const mockCacheKeys = [
        {
          id: 'no_expiry',
          key: 'NO_EXPIRY',
          value: { data: 'value' },
          expiration: 'N/A'
        }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect((result.body as Record<string, unknown>).keys[0]?.expiration).toBe('N/A')
    })

    it('should handle large number of cache entries', async () => {
      const mockCacheKeys = Array.from({ length: 100 }, (_, i) => ({
        id: `key_${i}`,
        key: `KEY_${i}`,
        value: { data: `value${i}` },
        expiration: '2024-12-31T23:59:59Z'
      }))

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect((result.body as Record<string, unknown>).count).toBe(100)
      expect((result.body as Record<string, unknown>).keys).toHaveLength(100)
    })
  })

  describe('error handling', () => {
    it('should return 500 when CacheManager.listCache throws error', async () => {
      mockListCache.mockRejectedValue(new Error('List failed'))

      const result = (await listAction(validParams)) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toBe('Failed to retrieve cache keys: List failed')
    })

    it('should handle errors with no message', async () => {
      mockListCache.mockRejectedValue(new Error())

      const result = (await listAction(validParams)) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toContain('Failed to retrieve cache keys:')
    })

    it('should handle non-Error exceptions', async () => {
      mockListCache.mockRejectedValue('String error')

      const result = (await listAction(validParams)) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toBe('Failed to retrieve cache keys: String error')
    })

    it('should handle null errors', async () => {
      mockListCache.mockRejectedValue(null)

      const result = (await listAction(validParams)) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toBe('Failed to retrieve cache keys: Unknown error')
    })

    it('should handle undefined errors', async () => {
      mockListCache.mockRejectedValue(undefined)

      const result = (await listAction(validParams)) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toBe('Failed to retrieve cache keys: Unknown error')
    })

    it('should handle CacheManager initialization errors', async () => {
      ;(CacheManager as jest.Mock).mockImplementation(() => {
        throw new Error('Init failed')
      })

      const result = (await listAction(validParams)) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toBe('Failed to retrieve cache keys: Init failed')
    })
  })

  describe('response structure', () => {
    it('should return correct response structure', async () => {
      const mockCacheKeys = [
        {
          id: 'test',
          key: 'TEST',
          value: { data: 'value' },
          expiration: '2024-12-31T23:59:59Z'
        }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse
      const body = result.body as ListResponseBody

      expect(result).toHaveProperty('statusCode')
      expect(result).toHaveProperty('body')
      expect(body).toHaveProperty('keys')
      expect(body).toHaveProperty('count')
      expect(body).toHaveProperty('timestamp')
      expect(typeof result.statusCode).toBe('number')
      expect(Array.isArray(body.keys)).toBe(true)
      expect(typeof body.count).toBe('number')
      expect(typeof body.timestamp).toBe('string')
    })

    it('should have matching keys length and count', async () => {
      const mockCacheKeys = [
        { id: 'key1', key: 'KEY1', value: {}, expiration: 'N/A' },
        { id: 'key2', key: 'KEY2', value: {}, expiration: 'N/A' },
        { id: 'key3', key: 'KEY3', value: {}, expiration: 'N/A' }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse
      const body = result.body as ListResponseBody

      expect(body.keys.length).toBe(body.count)
      expect(body.count).toBe(3)
    })
  })

  describe('cache key structure', () => {
    it('should preserve cache key structure', async () => {
      const mockCacheKeys = [
        {
          id: 'product_mapping',
          key: 'PRODUCT_MAPPING',
          value: {
            products: ['prod1', 'prod2'],
            updated: '2024-01-01'
          },
          expiration: '2024-12-31T23:59:59Z'
        }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse
      const body = result.body as ListResponseBody

      expect(body.keys[0]).toEqual(mockCacheKeys[0])
      expect(body.keys[0]?.id).toBe('product_mapping')
      expect(body.keys[0]?.key).toBe('PRODUCT_MAPPING')
      expect(body.keys[0]?.value).toEqual({
        products: ['prod1', 'prod2'],
        updated: '2024-01-01'
      })
      expect(body.keys[0]?.expiration).toBe('2024-12-31T23:59:59Z')
    })

    it('should handle null values in cache entries', async () => {
      const mockCacheKeys = [
        {
          id: 'null_value',
          key: 'NULL_VALUE',
          value: null,
          expiration: 'N/A'
        }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse

      expect((result.body as Record<string, unknown>).keys[0]?.value).toBeNull()
    })

    it('should handle complex nested values', async () => {
      const mockCacheKeys = [
        {
          id: 'complex',
          key: 'COMPLEX',
          value: {
            nested: {
              deeply: {
                nested: {
                  data: 'value'
                }
              }
            }
          },
          expiration: '2024-12-31T23:59:59Z'
        }
      ]

      mockListCache.mockResolvedValue(mockCacheKeys)

      const result = (await listAction(validParams)) as SuccessResponse

      expect((result.body as Record<string, unknown>).keys[0]?.value).toEqual(
        mockCacheKeys[0]?.value
      )
    })
  })

  describe('header validation', () => {
    it('should require authorization header', async () => {
      const result = (await listAction({
        ...validParams,
        __ow_headers: { 'x-gw-ims-org-id': 'org-id' }
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toContain('authorization')
    })

    it('should require x-gw-ims-org-id header', async () => {
      const result = (await listAction({
        ...validParams,
        __ow_headers: { authorization: 'Bearer token' }
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toContain('x-gw-ims-org-id')
    })

    it('should require both headers', async () => {
      const result = (await listAction({
        ...validParams,
        __ow_headers: {}
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toContain('authorization')
      expect(result.error.body.error).toContain('x-gw-ims-org-id')
    })
  })

  describe('HTTP methods', () => {
    it('should work with POST method', async () => {
      mockListCache.mockResolvedValue([])

      const result = (await listAction({
        ...validParams,
        __ow_method: 'post'
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
    })

    it('should work with GET method', async () => {
      mockListCache.mockResolvedValue([])

      const result = (await listAction({
        ...validParams,
        __ow_method: 'get'
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
    })
  })
})
