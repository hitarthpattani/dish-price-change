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
  let mockDeleteMapping: jest.Mock

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'post',
    id: '507f1f77bcf86cd799439011'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockDeleteMapping = jest.fn().mockResolvedValue(undefined)
    ;(RenewalPackageMappingRepository as unknown as jest.Mock).mockImplementation(() => ({
      deleteMapping: mockDeleteMapping
    }))
  })

  it('deletes the mapping and returns success', async () => {
    const response = (await deleteAction(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ success: true })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(RenewalPackageMappingRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockDeleteMapping).toHaveBeenCalledWith(baseParams.id)
  })

  it('works with the DELETE method', async () => {
    const response = (await deleteAction({
      ...baseParams,
      __ow_method: 'delete'
    })) as SuccessResponse

    expect(response.statusCode).toBe(200)
  })

  it('returns 500 when deletion fails', async () => {
    mockDeleteMapping.mockRejectedValue(new Error('abdb unavailable'))

    const response = (await deleteAction(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockDeleteMapping.mockRejectedValue('delete failure')

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

  it('returns 400 when the id parameter is missing', async () => {
    const response = (await deleteAction({ ...baseParams, id: undefined })) as ErrorResponse

    expect(response.error.statusCode).toBe(400)
    expect(mockDeleteMapping).not.toHaveBeenCalled()
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await deleteAction({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
