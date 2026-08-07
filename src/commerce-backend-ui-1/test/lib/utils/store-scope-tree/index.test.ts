/*
 * <license header>
 */

const mockFetchWebsites = jest.fn()
const mockFetchStoreGroups = jest.fn()
const mockFetchStoreViews = jest.fn()
const mockLoadCache = jest.fn()
const mockSaveCache = jest.fn()

jest.mock('@lib/adobe-commerce/website', () => ({
  AdobeCommerceWebsiteClient: jest.fn().mockImplementation(() => ({
    fetchWebsites: mockFetchWebsites
  }))
}))
jest.mock('@lib/adobe-commerce/store-group', () => ({
  AdobeCommerceStoreGroupClient: jest.fn().mockImplementation(() => ({
    fetchStoreGroups: mockFetchStoreGroups
  }))
}))
jest.mock('@lib/adobe-commerce/store-view', () => ({
  AdobeCommerceStoreViewClient: jest.fn().mockImplementation(() => ({
    fetchStoreViews: mockFetchStoreViews
  }))
}))
jest.mock('@lib/utils/cache-manager', () => ({
  CacheManager: jest.fn().mockImplementation(() => ({
    loadCache: mockLoadCache,
    saveCache: mockSaveCache
  }))
}))

import { CacheManager } from '@lib/utils/cache-manager'
import { StoreScopeTree } from '@lib/utils/store-scope-tree'

describe('StoreScopeTree', () => {
  const params = { COMMERCE_BASE_URL: 'https://commerce.example.com' }

  const builtTree = [
    { scope: 'default', scopeId: 0, label: 'Default Config' },
    {
      scope: 'website',
      scopeId: 1,
      code: 'base',
      label: 'Main Website',
      children: [
        {
          code: 'main_website_store',
          label: 'Main Website Store',
          children: [{ scope: 'store', scopeId: 1, code: 'default', label: 'Default Store View' }]
        },
        {
          code: '2',
          label: 'No Code Group',
          children: [{ scope: 'store', scopeId: 2, code: 'second', label: 'Second Store View' }]
        }
      ]
    }
  ]

  beforeEach(() => {
    mockFetchWebsites.mockReset()
    mockFetchStoreGroups.mockReset()
    mockFetchStoreViews.mockReset()
    mockLoadCache.mockReset().mockResolvedValue(undefined)
    mockSaveCache.mockReset().mockResolvedValue(undefined)
    ;(CacheManager as jest.Mock).mockClear()

    mockFetchWebsites.mockResolvedValue({
      success: true,
      message: [{ id: 1, code: 'base', name: 'Main Website', sort_order: 0, default_group_id: 1 }]
    })
    mockFetchStoreGroups.mockResolvedValue({
      success: true,
      message: [
        {
          id: 1,
          website_id: 1,
          name: 'Main Website Store',
          root_category_id: 2,
          default_store_id: 1,
          code: 'main_website_store'
        },
        {
          id: 2,
          website_id: 1,
          name: 'No Code Group',
          root_category_id: 2,
          default_store_id: 2
        }
      ]
    })
    mockFetchStoreViews.mockResolvedValue({
      success: true,
      message: [
        {
          id: 1,
          code: 'default',
          website_id: 1,
          store_group_id: 1,
          name: 'Default Store View',
          sort_order: 0,
          is_active: 1
        },
        {
          id: 2,
          code: 'second',
          website_id: 1,
          store_group_id: 2,
          name: 'Second Store View',
          sort_order: 0,
          is_active: 1
        }
      ]
    })
  })

  it('should cache the scope tree for 360 days', () => {
    new StoreScopeTree(params)

    expect(CacheManager).toHaveBeenCalledWith(60 * 60 * 24 * 360)
  })

  describe('build', () => {
    it('should assemble the default -> website -> store group -> store view tree on a cache miss', async () => {
      const tree = await new StoreScopeTree(params).build()

      expect(tree).toEqual(builtTree)
      expect(mockFetchWebsites).toHaveBeenCalled()
      expect(mockSaveCache).toHaveBeenCalledWith('STORE_SCOPE_TREE', builtTree)
    })

    it('should return the cached tree without calling Adobe Commerce', async () => {
      mockLoadCache.mockResolvedValue(builtTree)

      const tree = await new StoreScopeTree(params).build()

      expect(tree).toEqual(builtTree)
      expect(mockFetchWebsites).not.toHaveBeenCalled()
      expect(mockFetchStoreGroups).not.toHaveBeenCalled()
      expect(mockFetchStoreViews).not.toHaveBeenCalled()
      expect(mockSaveCache).not.toHaveBeenCalled()
    })

    it('should fall through to a fresh fetch when the cache read fails', async () => {
      mockLoadCache.mockRejectedValue(new Error('state unavailable'))

      const tree = await new StoreScopeTree(params).build()

      expect(tree).toEqual(builtTree)
      expect(mockFetchWebsites).toHaveBeenCalled()
    })

    it('should still return the freshly built tree when the cache write fails', async () => {
      mockSaveCache.mockRejectedValue(new Error('state unavailable'))

      const tree = await new StoreScopeTree(params).build()

      expect(tree).toEqual(builtTree)
    })

    it('should throw when a Commerce API call fails', async () => {
      mockFetchWebsites.mockResolvedValue({ success: false, statusCode: 500, message: 'boom' })
      mockFetchStoreGroups.mockResolvedValue({ success: true, message: [] })
      mockFetchStoreViews.mockResolvedValue({ success: true, message: [] })

      await expect(new StoreScopeTree(params).build()).rejects.toThrow(
        'Failed to load websites from Adobe Commerce: boom'
      )
    })
  })
})
