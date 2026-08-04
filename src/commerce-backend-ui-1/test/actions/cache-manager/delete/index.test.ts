/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as deleteAction } from '@actions/cache-manager/delete'
import { CacheManager } from '@lib/utils/cache-manager'

// Type for OpenWhisk action parameters
type ActionParams = Record<string, unknown>

// Mock the CacheManager
jest.mock('@lib/utils/cache-manager')

describe('cache-manager/delete action', () => {
  let mockDeleteCache: jest.Mock

  const validParams: ActionParams = {
    __ow_headers: {
      authorization: 'Bearer token',
      'x-gw-ims-org-id': 'org-id'
    },
    __ow_method: 'post',
    LOG_LEVEL: 'silent'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockDeleteCache = jest.fn()

    // Mock CacheManager constructor
    ;(CacheManager as jest.Mock).mockImplementation(() => ({
      deleteCache: mockDeleteCache
    }))
  })

  describe('successful deletions', () => {
    it('should delete single cache key successfully', async () => {
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: 'test-key'
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect(result.body).toEqual({
        success: true,
        deletedCount: 1,
        keys: ['test-key']
      })
      expect(mockDeleteCache).toHaveBeenCalledWith(['test-key'])
    })

    it('should delete multiple cache keys successfully', async () => {
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: ['key1', 'key2', 'key3']
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect(result.body).toEqual({
        success: true,
        deletedCount: 3,
        keys: ['key1', 'key2', 'key3']
      })
      expect(mockDeleteCache).toHaveBeenCalledWith(['key1', 'key2', 'key3'])
    })

    it('should handle array with single key', async () => {
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: ['single-key']
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect(result.body).toEqual({
        success: true,
        deletedCount: 1,
        keys: ['single-key']
      })
    })
  })

  describe('validation errors', () => {
    it('should return 400 when keys parameter is missing', async () => {
      const result = (await deleteAction(validParams)) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toContain('keys')
      expect(mockDeleteCache).not.toHaveBeenCalled()
    })

    it('should return 400 when keys array is empty', async () => {
      const result = (await deleteAction({
        ...validParams,
        keys: []
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toBe('At least one key must be provided')
    })

    it('should return 400 when keys array contains empty string', async () => {
      const result = (await deleteAction({
        ...validParams,
        keys: ['valid', '']
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toBe('All keys must be non-empty strings')
    })

    it('should return 400 when keys array contains whitespace-only string', async () => {
      const result = (await deleteAction({
        ...validParams,
        keys: ['valid', '   ']
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toBe('All keys must be non-empty strings')
    })

    it('should return 400 when keys array contains non-string', async () => {
      const result = (await deleteAction({
        ...validParams,
        keys: ['valid', 123]
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toBe('All keys must be non-empty strings')
    })

    it('should return 400 when keys array contains null', async () => {
      const result = (await deleteAction({
        ...validParams,
        keys: ['valid', null]
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toBe('All keys must be non-empty strings')
    })

    it('should return 400 when keys array contains undefined', async () => {
      const result = (await deleteAction({
        ...validParams,
        keys: ['valid', undefined]
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toBe('All keys must be non-empty strings')
    })

    it('should return 400 when all keys in array are invalid', async () => {
      const result = (await deleteAction({
        ...validParams,
        keys: ['', '   ', null, undefined, 123]
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toBe('All keys must be non-empty strings')
    })
  })

  describe('deletion errors', () => {
    it('should return 500 when CacheManager.deleteCache throws error', async () => {
      mockDeleteCache.mockRejectedValue(new Error('Deletion failed'))

      const result = (await deleteAction({
        ...validParams,
        keys: 'test-key'
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toBe('Failed to delete cache keys: Deletion failed')
    })

    it('should handle errors with no message', async () => {
      mockDeleteCache.mockRejectedValue(new Error())

      const result = (await deleteAction({
        ...validParams,
        keys: 'test-key'
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toContain('Failed to delete cache keys:')
    })

    it('should handle non-Error exceptions', async () => {
      mockDeleteCache.mockRejectedValue('String error')

      const result = (await deleteAction({
        ...validParams,
        keys: 'test-key'
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toContain('Failed to delete cache keys')
    })

    it('should handle CacheManager initialization errors', async () => {
      ;(CacheManager as jest.Mock).mockImplementation(() => {
        throw new Error('Init failed')
      })

      const result = (await deleteAction({
        ...validParams,
        keys: 'test-key'
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(500)
      expect(result.error.body.error).toBe('Failed to delete cache keys: Init failed')
    })
  })

  describe('edge cases', () => {
    it('should handle keys with special characters', async () => {
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: 'key-with-dashes_and_underscores.123'
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect(mockDeleteCache).toHaveBeenCalledWith(['key-with-dashes_and_underscores.123'])
    })

    it('should handle large number of keys', async () => {
      const manyKeys = Array.from({ length: 100 }, (_, i) => `key-${i}`)
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: manyKeys
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect((result.body as Record<string, unknown>).deletedCount).toBe(100)
      expect(mockDeleteCache).toHaveBeenCalledWith(manyKeys)
    })

    it('should handle keys with unicode characters', async () => {
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: ['key-émojis-😀', 'key-中文']
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect(mockDeleteCache).toHaveBeenCalledWith(['key-émojis-😀', 'key-中文'])
    })

    it('should convert single string to array', async () => {
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: 'single-string-key'
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect(mockDeleteCache).toHaveBeenCalledWith(['single-string-key'])
      expect((result.body as Record<string, unknown>).keys).toEqual(['single-string-key'])
    })

    it('should preserve key array when already an array', async () => {
      mockDeleteCache.mockResolvedValue(true)

      const result = (await deleteAction({
        ...validParams,
        keys: ['key1', 'key2']
      })) as SuccessResponse

      expect(result.statusCode).toBe(200)
      expect(mockDeleteCache).toHaveBeenCalledWith(['key1', 'key2'])
      expect((result.body as Record<string, unknown>).keys).toEqual(['key1', 'key2'])
    })
  })

  describe('header validation', () => {
    it('should require authorization header', async () => {
      const result = (await deleteAction({
        ...validParams,
        __ow_headers: { 'x-gw-ims-org-id': 'org-id' },
        keys: 'test-key'
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toContain('authorization')
    })

    it('should require x-gw-ims-org-id header', async () => {
      const result = (await deleteAction({
        ...validParams,
        __ow_headers: { authorization: 'Bearer token' },
        keys: 'test-key'
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toContain('x-gw-ims-org-id')
    })

    it('should require both headers', async () => {
      const result = (await deleteAction({
        ...validParams,
        __ow_headers: {},
        keys: 'test-key'
      })) as ErrorResponse

      expect(result.error.statusCode).toBe(400)
      expect(result.error.body.error).toContain('authorization')
      expect(result.error.body.error).toContain('x-gw-ims-org-id')
    })
  })
})
