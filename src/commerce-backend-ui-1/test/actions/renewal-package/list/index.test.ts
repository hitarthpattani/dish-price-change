/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as list } from '@actions/renewal-package/list'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'

jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/database/repository/renewal-package-mapping')

type ActionParams = Record<string, unknown>

describe('list', () => {
  let mockListByType: jest.Mock

  const mapping = {
    mapping_type: 'active',
    effective_date: '2026-01-01T00:00:00.000Z',
    packages: '["sku-1"]'
  }

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'get',
    type: 'active'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockListByType = jest.fn().mockResolvedValue([mapping])
    ;(RenewalPackageMappingRepository as unknown as jest.Mock).mockImplementation(() => ({
      listByType: mockListByType
    }))
  })

  it('lists mappings for the given type', async () => {
    const response = (await list(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ mappings: [mapping], count: 1 })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(RenewalPackageMappingRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockListByType).toHaveBeenCalledWith('active')
  })

  it('returns 500 when listing fails', async () => {
    mockListByType.mockRejectedValue(new Error('abdb unavailable'))

    const response = (await list(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockListByType.mockRejectedValue('lookup failure')

    const response = (await list(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('lookup failure')
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const response = (await list(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('token failure')
  })

  it('returns 400 when the type query parameter is missing', async () => {
    const response = (await list({ ...baseParams, type: undefined })) as ErrorResponse

    expect(response.error.statusCode).toBe(400)
    expect(mockListByType).not.toHaveBeenCalled()
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await list({ ...baseParams, __ow_method: 'post' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
