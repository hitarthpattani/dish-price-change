/*
 * <license header>
 */

import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { Core } from '@adobe/aio-sdk'

jest.mock('@adobe/aio-sdk')

describe('GenerateAccessToken', () => {
  const validParams = {
    IMS_OAUTH_S2S_CLIENT_ID: 'client-id',
    IMS_OAUTH_S2S_CLIENT_SECRET: 'client-secret',
    IMS_OAUTH_S2S_ORG_ID: 'org-id@AdobeOrg',
    IMS_OAUTH_S2S_SCOPES: 'scope1,scope2'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(Core.AuthClient.generateAccessToken as jest.Mock).mockResolvedValue({
      access_token: 'the-access-token'
    })
  })

  describe('credential validation', () => {
    it.each([
      [
        'IMS_OAUTH_S2S_CLIENT_ID is missing',
        { ...validParams, IMS_OAUTH_S2S_CLIENT_ID: undefined }
      ],
      ['IMS_OAUTH_S2S_CLIENT_ID is not a string', { ...validParams, IMS_OAUTH_S2S_CLIENT_ID: 42 }],
      ['IMS_OAUTH_S2S_CLIENT_ID is blank', { ...validParams, IMS_OAUTH_S2S_CLIENT_ID: '   ' }],
      [
        'IMS_OAUTH_S2S_CLIENT_SECRET is missing',
        { ...validParams, IMS_OAUTH_S2S_CLIENT_SECRET: undefined }
      ],
      ['IMS_OAUTH_S2S_CLIENT_SECRET is blank', { ...validParams, IMS_OAUTH_S2S_CLIENT_SECRET: '' }],
      ['IMS_OAUTH_S2S_ORG_ID is missing', { ...validParams, IMS_OAUTH_S2S_ORG_ID: undefined }],
      ['IMS_OAUTH_S2S_ORG_ID is blank', { ...validParams, IMS_OAUTH_S2S_ORG_ID: '  ' }]
    ])('rejects when %s', async (_description, params) => {
      await expect(GenerateAccessToken.execute(params)).rejects.toThrow(
        'Missing required parameters IMS_OAUTH_S2S_CLIENT_ID, IMS_OAUTH_S2S_CLIENT_SECRET, IMS_OAUTH_S2S_ORG_ID'
      )
    })
  })

  describe('scope parsing', () => {
    it('rejects when scopes resolve to an empty list', async () => {
      await expect(
        GenerateAccessToken.execute({ ...validParams, IMS_OAUTH_S2S_SCOPES: '' })
      ).rejects.toThrow('Missing required parameter IMS_OAUTH_S2S_SCOPES')
    })

    it('rejects when scopes is an empty array', async () => {
      await expect(
        GenerateAccessToken.execute({ ...validParams, IMS_OAUTH_S2S_SCOPES: [] })
      ).rejects.toThrow('Missing required parameter IMS_OAUTH_S2S_SCOPES')
    })

    it('rejects when scopes is an unsupported type', async () => {
      await expect(
        GenerateAccessToken.execute({ ...validParams, IMS_OAUTH_S2S_SCOPES: 42 })
      ).rejects.toThrow('Missing required parameter IMS_OAUTH_S2S_SCOPES')
    })

    it('accepts a string array, ignoring non-string entries', async () => {
      await GenerateAccessToken.execute({
        ...validParams,
        IMS_OAUTH_S2S_SCOPES: ['scope1', 42, ' scope2 ', '']
      })

      expect(Core.AuthClient.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: ['scope1', 'scope2'] })
      )
    })

    it('accepts a JSON array string', async () => {
      await GenerateAccessToken.execute({
        ...validParams,
        IMS_OAUTH_S2S_SCOPES: '["scope1","scope2"]'
      })

      expect(Core.AuthClient.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: ['scope1', 'scope2'] })
      )
    })

    it('falls back to comma-separated parsing when the JSON-looking string is invalid', async () => {
      await GenerateAccessToken.execute({
        ...validParams,
        IMS_OAUTH_S2S_SCOPES: '[scope1,scope2'
      })

      expect(Core.AuthClient.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: ['[scope1', 'scope2'] })
      )
    })

    it('falls back to comma-separated parsing when a JSON string does not parse to an array', async () => {
      await GenerateAccessToken.execute({
        ...validParams,
        IMS_OAUTH_S2S_SCOPES: '["scope1"]extra'
      })

      expect(Core.AuthClient.generateAccessToken).toHaveBeenCalled()
    })

    it('parses a comma-separated string', async () => {
      await GenerateAccessToken.execute({
        ...validParams,
        IMS_OAUTH_S2S_SCOPES: 'scope1, scope2 ,,scope3'
      })

      expect(Core.AuthClient.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: ['scope1', 'scope2', 'scope3'] })
      )
    })
  })

  describe('execute', () => {
    it('requests an access token with the validated credentials and scopes', async () => {
      const accessToken = await GenerateAccessToken.execute(validParams)

      expect(accessToken).toBe('the-access-token')
      expect(Core.AuthClient.generateAccessToken).toHaveBeenCalledWith({
        clientId: 'client-id',
        clientSecret: 'client-secret',
        orgId: 'org-id@AdobeOrg',
        scopes: ['scope1', 'scope2']
      })
    })

    it('returns an empty string when the response omits access_token', async () => {
      ;(Core.AuthClient.generateAccessToken as jest.Mock).mockResolvedValue({})

      await expect(GenerateAccessToken.execute(validParams)).resolves.toBe('')
    })

    it('returns an empty string when the response is null', async () => {
      ;(Core.AuthClient.generateAccessToken as jest.Mock).mockResolvedValue(null)

      await expect(GenerateAccessToken.execute(validParams)).resolves.toBe('')
    })
  })
})
