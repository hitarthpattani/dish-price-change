/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as save } from '@actions/renewal-package/save'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'

jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/database/repository/renewal-package-mapping')

type ActionParams = Record<string, unknown>

describe('save', () => {
  let mockSaveMapping: jest.Mock

  const mapping = {
    mapping_type: 'active',
    effective_date: '2026-01-01T00:00:00.000Z',
    packages: 'sku-1,sku-2'
  }

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'post',
    ...mapping
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockSaveMapping = jest.fn().mockResolvedValue(mapping)
    ;(RenewalPackageMappingRepository as unknown as jest.Mock).mockImplementation(() => ({
      saveMapping: mockSaveMapping
    }))
  })

  it('saves the mapping and returns it', async () => {
    const response = (await save(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ mapping })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(RenewalPackageMappingRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockSaveMapping).toHaveBeenCalledWith(mapping)
  })

  it('returns 500 when saving fails', async () => {
    mockSaveMapping.mockRejectedValue(
      new Error('packages must be a non-empty comma-separated list of package SKUs')
    )

    const response = (await save(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain(
      'packages must be a non-empty comma-separated list of package SKUs'
    )
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockSaveMapping.mockRejectedValue('save failure')

    const response = (await save(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('save failure')
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const response = (await save(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('token failure')
  })

  it('returns 400 when a required field is missing', async () => {
    const response = (await save({ ...baseParams, packages: undefined })) as ErrorResponse

    expect(response.error.statusCode).toBe(400)
    expect(mockSaveMapping).not.toHaveBeenCalled()
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await save({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
