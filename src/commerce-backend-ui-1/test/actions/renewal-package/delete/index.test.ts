/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as deleteAction } from '@actions/renewal-package/delete'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { RenewalPackageMappingRepository } from '@lib/database/repository/renewal-package-mapping'

jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/database/repository/renewal-package-mapping')

type ActionParams = Record<string, unknown>

describe('delete', () => {
  let mockDeleteMappings: jest.Mock

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'post',
    ids: ['507f1f77bcf86cd799439011']
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockDeleteMappings = jest.fn().mockResolvedValue(1)
    ;(RenewalPackageMappingRepository as unknown as jest.Mock).mockImplementation(() => ({
      deleteMappings: mockDeleteMappings
    }))
  })

  it('deletes the mappings and returns success', async () => {
    const response = (await deleteAction(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ success: true })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(RenewalPackageMappingRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockDeleteMappings).toHaveBeenCalledWith(baseParams.ids)
  })

  it('works with the DELETE method', async () => {
    const response = (await deleteAction({
      ...baseParams,
      __ow_method: 'delete'
    })) as SuccessResponse

    expect(response.statusCode).toBe(200)
  })

  it('returns 500 when deletion fails', async () => {
    mockDeleteMappings.mockRejectedValue(new Error('abdb unavailable'))

    const response = (await deleteAction(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockDeleteMappings.mockRejectedValue('delete failure')

    const response = (await deleteAction(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('delete failure')
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const response = (await deleteAction(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('token failure')
  })

  it('returns 400 when the ids parameter is missing', async () => {
    const response = (await deleteAction({ ...baseParams, ids: undefined })) as ErrorResponse

    expect(response.error.statusCode).toBe(400)
    expect(mockDeleteMappings).not.toHaveBeenCalled()
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await deleteAction({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
