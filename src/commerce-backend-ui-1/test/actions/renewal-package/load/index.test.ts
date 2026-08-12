/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as load } from '@actions/renewal-package/load'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'

jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/database/repository/renewal-package-mapping')

type ActionParams = Record<string, unknown>

describe('load', () => {
  let mockFindById: jest.Mock

  const mapping = {
    mapping_type: 'active',
    effective_date: '2026-01-01T00:00:00.000Z',
    packages: '["sku-1"]'
  }

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'get',
    id: '507f1f77bcf86cd799439011'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockFindById = jest.fn().mockResolvedValue(mapping)
    ;(RenewalPackageMappingRepository as unknown as jest.Mock).mockImplementation(() => ({
      findById: mockFindById
    }))
  })

  it('returns the mapping for the given id', async () => {
    const response = (await load(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ mapping })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(RenewalPackageMappingRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockFindById).toHaveBeenCalledWith(baseParams.id)
  })

  it('returns 404 when the mapping does not exist', async () => {
    mockFindById.mockResolvedValue(null)

    const response = (await load(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(404)
    expect(response.error.body.error).toContain('Mapping not found')
  })

  it('returns 500 when the lookup fails', async () => {
    mockFindById.mockRejectedValue(new Error('abdb unavailable'))

    const response = (await load(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockFindById.mockRejectedValue('lookup failure')

    const response = (await load(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('lookup failure')
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const response = (await load(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('token failure')
  })

  it('returns 400 when the id parameter is missing', async () => {
    const response = (await load({ ...baseParams, id: undefined })) as ErrorResponse

    expect(response.error.statusCode).toBe(400)
    expect(mockFindById).not.toHaveBeenCalled()
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await load({ ...baseParams, __ow_method: 'post' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
