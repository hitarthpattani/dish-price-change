/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as receiver } from '@actions/renewal-notification/webhook'
import { ConfigurationManager } from '@lib/utils/configuration-manager'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { StoreScopeTree } from '@lib/utils/store-scope-tree'
import { EventsPublisher } from '@lib/utils/events-publisher'
import { ReportBuilder } from '@lib/utils/report-builder'

type ActionParams = Record<string, unknown>

jest.mock('@lib/utils/configuration-manager')
jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/utils/store-scope-tree')
jest.mock('@lib/utils/events-publisher')
jest.mock('@lib/utils/report-builder')

describe('webhook', () => {
  let mockGet: jest.Mock
  let mockBuild: jest.Mock
  let mockPublish: jest.Mock

  const scopeTree = [{ scope: 'default', scopeId: 0, label: 'Default Config' }]
  const reportRow = { uuid: 'uuid-123', status: 'fail' } as unknown as ReturnType<
    typeof ReportBuilder.build
  >

  const baseParams: ActionParams = {
    __ow_headers: {},
    __ow_method: 'post',
    uuid: 'uuid-123',
    event_type: 'renewal.scheduled',
    LOG_LEVEL: 'silent',
    IMS_OAUTH_S2S_CLIENT_ID: 'client-id',
    PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID: 'provider-123'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockGet = jest.fn().mockResolvedValue('1')
    ;(ConfigurationManager as unknown as jest.Mock).mockImplementation(() => ({
      get: mockGet
    }))
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockBuild = jest.fn().mockResolvedValue(scopeTree)
    ;(StoreScopeTree as unknown as jest.Mock).mockImplementation(() => ({
      build: mockBuild
    }))

    mockPublish = jest.fn().mockResolvedValue(undefined)
    ;(EventsPublisher as unknown as jest.Mock).mockImplementation(() => ({
      publish: mockPublish
    }))
    ;(ReportBuilder.build as jest.Mock).mockReturnValue(reportRow)
  })

  it('gates on the scoped price_change_enable flag before doing anything else', async () => {
    await receiver(baseParams)

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(StoreScopeTree).toHaveBeenCalledWith(baseParams)
    expect(ConfigurationManager).toHaveBeenCalledWith('a-valid-token', scopeTree)
    expect(mockGet).toHaveBeenCalledWith('price_change_enable')
  })

  it('returns success without processing when price_change_enable is off', async () => {
    mockGet.mockResolvedValue('0')

    const response = (await receiver(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({
      success: true,
      message: 'Price change feature disabled; notification ignored'
    })
    expect(EventsPublisher).not.toHaveBeenCalled()
  })

  it('treats a missing configuration value as disabled', async () => {
    mockGet.mockResolvedValue(null)

    const response = (await receiver(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(body).toEqual({
      success: true,
      message: 'Price change feature disabled; notification ignored'
    })
  })

  it('ignores an event_type outside renewal.scheduled/resumed', async () => {
    const response = (await receiver({
      ...baseParams,
      event_type: 'cancelled'
    })) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({
      success: true,
      message: 'Unsupported event_type "cancelled"; notification ignored'
    })
    expect(EventsPublisher).not.toHaveBeenCalled()
  })

  it('accepts the "resumed" event_type', async () => {
    const response = (await receiver({ ...baseParams, event_type: 'resumed' })) as SuccessResponse

    expect(response.statusCode).toBe(200)
    expect(mockPublish).toHaveBeenCalledTimes(1)
  })

  it('publishes the stamped, allowlisted notification payload and returns success', async () => {
    const response = (await receiver(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ success: true, message: 'Renewal notification published' })

    expect(EventsPublisher).toHaveBeenCalledWith(baseParams)
    expect(mockPublish).toHaveBeenCalledTimes(1)
    const [eventType, payload] = mockPublish.mock.calls[0]
    expect(eventType).toBe('com.dish.pricechange.prerenewal.received')
    expect(typeof payload.notification_time).toBe('string')
    expect(payload).toEqual({
      uuid: 'uuid-123',
      event_type: 'renewal.scheduled',
      notification_time: payload.notification_time
    })
  })

  it('forwards renewal_date on the published payload when present', async () => {
    await receiver({ ...baseParams, renewal_date: '2026-08-20T00:00:00.000Z' })

    const [, payload] = mockPublish.mock.calls[0]
    expect(payload.renewal_date).toBe('2026-08-20T00:00:00.000Z')
  })

  it('omits renewal_date from the published payload when it is not a string', async () => {
    await receiver({ ...baseParams, renewal_date: 12345 })

    const [, payload] = mockPublish.mock.calls[0]
    expect(payload).not.toHaveProperty('renewal_date')
  })

  it('reports the failure and returns 422 when the publish fails', async () => {
    const publishError = new Error('provider unavailable')
    mockPublish.mockImplementation(async (eventType: string) => {
      if (eventType === 'com.dish.pricechange.prerenewal.received') {
        throw publishError
      }
    })

    const response = (await receiver(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(422)
    expect(response.error.body.error).toContain('provider unavailable')

    expect(ReportBuilder.build).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: 'uuid-123' }),
      false,
      publishError,
      'fail',
      'message_consumption'
    )
    expect(mockPublish).toHaveBeenCalledWith('com.dish.pricechange.reporting.queued', reportRow)
  })

  it('returns 422 with a generic message when the publish failure is not an Error', async () => {
    mockPublish.mockImplementation(async (eventType: string) => {
      if (eventType === 'com.dish.pricechange.prerenewal.received') {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'provider unavailable'
      }
    })

    const response = (await receiver(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(422)
    expect(response.error.body.error).toContain('provider unavailable')
  })

  it('still returns 422 when reporting the failure itself fails to publish', async () => {
    mockPublish.mockRejectedValue(new Error('provider unavailable'))

    const response = (await receiver(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(422)
    expect(response.error.body.error).toContain('provider unavailable')
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const response = (await receiver(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('token failure')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue('string failure')

    const response = (await receiver(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('string failure')
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await receiver({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
