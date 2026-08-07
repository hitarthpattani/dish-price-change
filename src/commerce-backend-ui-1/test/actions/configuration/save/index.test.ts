/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as saveAction } from '@actions/configuration/save'
import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'

type ActionParams = Record<string, unknown>

jest.mock('@lib/database/repository/configuration')
jest.mock('@lib/utils/generate-access-token')

describe('configuration/save action', () => {
  let mockSet: jest.Mock
  let mockAll: jest.Mock

  const validParams: ActionParams = {
    __ow_headers: {
      authorization: 'Bearer token',
      'x-gw-ims-org-id': 'org-id'
    },
    __ow_method: 'post',
    LOG_LEVEL: 'silent',
    configuration: { 'api-key': 'value', 'empty-key': '', 'null-key': null }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockSet = jest.fn().mockResolvedValue(undefined)
    mockAll = jest.fn().mockResolvedValue({ 'api-key': 'value' })
    ;(ConfigurationRepository as unknown as jest.Mock).mockImplementation(() => ({
      set: mockSet,
      all: mockAll
    }))
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')
  })

  it('saves the filtered configuration for the default scope', async () => {
    const result = (await saveAction(validParams)) as SuccessResponse

    expect(result.statusCode).toBe(200)
    const body = result.body as Record<string, unknown>
    expect(body.configuration).toEqual({
      'api-key': 'value'
    })
    expect(body.scope).toBe('default')
    expect(body.scopeId).toBe(0)
    expect(ConfigurationRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockSet).toHaveBeenCalledWith({ 'api-key': 'value' }, 'default', 0)
    expect(mockAll).toHaveBeenCalledWith('default', 0)
  })

  it('saves configuration for a custom scope and scope id', async () => {
    const result = (await saveAction({
      ...validParams,
      scope: 'website',
      scope_id: 2
    })) as SuccessResponse

    expect(result.statusCode).toBe(200)
    const body = result.body as Record<string, unknown>
    expect(body.scope).toBe('website')
    expect(body.scopeId).toBe(2)
    expect(mockSet).toHaveBeenCalledWith({ 'api-key': 'value' }, 'website', 2)
    expect(mockAll).toHaveBeenCalledWith('website', 2)
  })

  it('requires the configuration parameter', async () => {
    const { configuration: _configuration, ...paramsWithoutConfiguration } = validParams

    const result = (await saveAction(paramsWithoutConfiguration)) as ErrorResponse

    expect(result.error.statusCode).toBe(400)
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const result = (await saveAction(validParams)) as ErrorResponse

    expect(result.error.statusCode).toBe(500)
    expect(result.error.body.error).toContain('token failure')
  })

  it('returns 500 when the repository save fails', async () => {
    mockSet.mockRejectedValue(new Error('save failure'))

    const result = (await saveAction(validParams)) as ErrorResponse

    expect(result.error.statusCode).toBe(500)
    expect(result.error.body.error).toContain('save failure')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockSet.mockRejectedValue('string failure')

    const result = (await saveAction(validParams)) as ErrorResponse

    expect(result.error.statusCode).toBe(500)
    expect(result.error.body.error).toContain('string failure')
  })

  it('requires the authorization and x-gw-ims-org-id headers', async () => {
    const result = (await saveAction({ ...validParams, __ow_headers: {} })) as ErrorResponse

    expect(result.error.statusCode).toBe(400)
  })
})
