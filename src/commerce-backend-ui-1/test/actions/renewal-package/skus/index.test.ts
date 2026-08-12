/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as skus } from '@actions/renewal-package/skus'
import { AdobeCommerceCatalogClient } from '@lib/adobe-commerce/catalog'

jest.mock('@lib/adobe-commerce/catalog')

type ActionParams = Record<string, unknown>

describe('skus', () => {
  let mockFetchEnabledPackageProducts: jest.Mock

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'get'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockFetchEnabledPackageProducts = jest.fn().mockResolvedValue({
      success: true,
      message: { items: [{ sku: 'SKU-1', name: 'Product 1', status: 1 }], total_count: 1 }
    })
    ;(AdobeCommerceCatalogClient as unknown as jest.Mock).mockImplementation(() => ({
      fetchEnabledPackageProducts: mockFetchEnabledPackageProducts
    }))
  })

  it('returns the enabled product SKUs', async () => {
    const response = (await skus(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ skus: ['SKU-1'] })
    expect(AdobeCommerceCatalogClient).toHaveBeenCalledWith(baseParams)
  })

  it('returns 500 when the commerce call fails', async () => {
    mockFetchEnabledPackageProducts.mockResolvedValue({ success: false, message: 'boom' })

    const response = (await skus(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('boom')
  })

  it('returns 500 when the client throws', async () => {
    mockFetchEnabledPackageProducts.mockRejectedValue(new Error('network error'))

    const response = (await skus(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('network error')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockFetchEnabledPackageProducts.mockRejectedValue('lookup failure')

    const response = (await skus(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('lookup failure')
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await skus({ ...baseParams, __ow_method: 'post' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
