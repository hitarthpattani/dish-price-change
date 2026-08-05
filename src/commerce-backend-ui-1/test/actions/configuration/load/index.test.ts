/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as loadAction } from '@actions/configuration/load'
import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'

type ActionParams = Record<string, unknown>

jest.mock('@lib/database/repository/configuration')
jest.mock('@lib/utils/generate-access-token')

describe('configuration/load action', () => {
  let mockAll: jest.Mock

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

    mockAll = jest.fn().mockResolvedValue({ 'api-key': 'value' })
    ;(ConfigurationRepository as unknown as jest.Mock).mockImplementation(() => ({
      all: mockAll
    }))
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')
  })

  it('loads configuration for the default scope', async () => {
    const result = (await loadAction(validParams)) as SuccessResponse

    expect(result.statusCode).toBe(200)
    expect((result.body as Record<string, unknown>).configuration).toEqual({ 'api-key': 'value' })
    expect(ConfigurationRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockAll).toHaveBeenCalledWith(undefined, undefined)
  })

  it('loads configuration for a custom scope and scope id', async () => {
    const result = (await loadAction({
      ...validParams,
      scope: 'website',
      scope_id: 2
    })) as SuccessResponse

    expect(result.statusCode).toBe(200)
    expect(mockAll).toHaveBeenCalledWith('website', 2)
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const result = (await loadAction(validParams)) as ErrorResponse

    expect(result.error.statusCode).toBe(500)
    expect(result.error.body.error).toContain('token failure')
  })

  it('returns 500 when the repository lookup fails', async () => {
    mockAll.mockRejectedValue(new Error('lookup failure'))

    const result = (await loadAction(validParams)) as ErrorResponse

    expect(result.error.statusCode).toBe(500)
    expect(result.error.body.error).toContain('lookup failure')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockAll.mockRejectedValue('string failure')

    const result = (await loadAction(validParams)) as ErrorResponse

    expect(result.error.statusCode).toBe(500)
    expect(result.error.body.error).toContain('string failure')
  })

  it('requires the authorization and x-gw-ims-org-id headers', async () => {
    const result = (await loadAction({ ...validParams, __ow_headers: {} })) as ErrorResponse

    expect(result.error.statusCode).toBe(400)
  })

  it('works with the POST method', async () => {
    const result = (await loadAction({
      ...validParams,
      __ow_method: 'post'
    })) as SuccessResponse

    expect(result.statusCode).toBe(200)
  })
})
