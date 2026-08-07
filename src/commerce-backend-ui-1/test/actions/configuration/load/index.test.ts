/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as loadAction } from '@actions/configuration/load'
import { ConfigurationRepository } from '@lib/database/repository/configuration'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { StoreScopeTree } from '@lib/utils/store-scope-tree'

type ActionParams = Record<string, unknown>

jest.mock('@lib/database/repository/configuration')
jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/utils/store-scope-tree')

describe('configuration/load action', () => {
  let mockAll: jest.Mock
  let mockBuild: jest.Mock

  const scopeTree = [
    { scope: 'default', scopeId: 0, label: 'Default Config' },
    {
      scope: 'website',
      scopeId: 5,
      code: 'arcteryx',
      label: 'Arc`teryx',
      children: [
        {
          code: 'arcteryx',
          label: 'Arc`teryx',
          children: [
            { scope: 'store', scopeId: 23, code: 'arcteryx_en', label: 'Arc`teryx English' }
          ]
        }
      ]
    }
  ]

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

    mockBuild = jest.fn().mockResolvedValue(scopeTree)
    ;(StoreScopeTree as unknown as jest.Mock).mockImplementation(() => ({
      build: mockBuild
    }))
  })

  it('loads configuration for the default scope', async () => {
    const result = (await loadAction(validParams)) as SuccessResponse

    expect(result.statusCode).toBe(200)
    const body = result.body as Record<string, unknown>
    expect(body.configuration).toEqual({ 'api-key': 'value' })
    expect(body.scope).toBe('default')
    expect(body.scopeId).toBe(0)
    expect(body.scopeTree).toEqual(scopeTree)
    expect(ConfigurationRepository).toHaveBeenCalledWith('a-valid-token', scopeTree)
    expect(mockAll).toHaveBeenCalledWith('default', 0)
    expect(StoreScopeTree).toHaveBeenCalledWith(validParams)
  })

  it('loads configuration for a custom scope and scope id', async () => {
    const result = (await loadAction({
      ...validParams,
      scope: 'website',
      scope_id: 2
    })) as SuccessResponse

    expect(result.statusCode).toBe(200)
    const body = result.body as Record<string, unknown>
    expect(body.scope).toBe('website')
    expect(body.scopeId).toBe(2)
    expect(mockAll).toHaveBeenCalledWith('website', 2)
  })

  it('loads configuration for a store scope, inheriting through its website', async () => {
    const result = (await loadAction({
      ...validParams,
      scope: 'store',
      scope_id: 23
    })) as SuccessResponse

    expect(result.statusCode).toBe(200)
    const body = result.body as Record<string, unknown>
    expect(body.scope).toBe('store')
    expect(body.scopeId).toBe(23)
    expect(mockAll).toHaveBeenCalledWith('store', 23)
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

  it('returns 500 when the scope tree build fails', async () => {
    mockBuild.mockRejectedValue(new Error('scope tree failure'))

    const result = (await loadAction(validParams)) as ErrorResponse

    expect(result.error.statusCode).toBe(500)
    expect(result.error.body.error).toContain('scope tree failure')
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
