/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as consumer } from '@actions/external-events/pre-renewal-persist-consumer'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { EventsPublisher } from '@lib/utils/events-publisher'
import { ReportBuilder } from '@lib/utils/report-builder'

jest.mock('@lib/database/repository/prerenewal-notifications')
jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/utils/events-publisher')
jest.mock('@lib/utils/report-builder')

describe('pre-renewal-persist-consumer', () => {
  let mockInsertNotification: jest.Mock
  let mockPublish: jest.Mock

  const reportRow = { uuid: 'uuid-123', status: 'fail' } as unknown as ReturnType<
    typeof ReportBuilder.build
  >

  const notification = {
    uuid: 'uuid-123',
    event_type: 'renewal.scheduled',
    notification_time: '2026-08-07T00:00:00.000Z',
    renewal_date: '2026-08-20T00:00:00.000Z'
  }

  const baseParams = {
    data: notification,
    LOG_LEVEL: 'silent',
    IMS_OAUTH_S2S_CLIENT_ID: 'client-id',
    PRICE_CHANGE_INTERNAL_EVENTS_PROVIDER_ID: 'provider-123'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockInsertNotification = jest.fn().mockResolvedValue({ _id: 'record-1' })
    ;(PrerenewalNotificationsRepository as unknown as jest.Mock).mockImplementation(() => ({
      insertNotification: mockInsertNotification
    }))
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockPublish = jest.fn().mockResolvedValue(undefined)
    ;(EventsPublisher as unknown as jest.Mock).mockImplementation(() => ({
      publish: mockPublish
    }))
    ;(ReportBuilder.build as jest.Mock).mockReturnValue(reportRow)
  })

  it('persists the notification and returns success', async () => {
    const response = (await consumer(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ success: true, message: 'Pre-renewal notification persisted' })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(PrerenewalNotificationsRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockInsertNotification).toHaveBeenCalledWith({
      uuid: 'uuid-123',
      event_type: 'renewal.scheduled',
      notification_time: '2026-08-07T00:00:00.000Z',
      renewal_date: '2026-08-20T00:00:00.000Z',
      source: 'webhook'
    })
  })

  it('reports the failure and returns 500 when uuid is missing', async () => {
    const { uuid: _omit, ...rest } = notification

    const response = (await consumer({ ...baseParams, data: rest })) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('missing a valid uuid')
    expect(GenerateAccessToken.execute).not.toHaveBeenCalled()
    expect(mockPublish).toHaveBeenCalledWith('com.dish.pricechange.reporting.queued', reportRow)
  })

  it('reports the failure and returns 500 when uuid is blank', async () => {
    const response = (await consumer({
      ...baseParams,
      data: { ...notification, uuid: '  ' }
    })) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('missing a valid uuid')
  })

  it('falls back renewal_date to notification_time when absent', async () => {
    const { renewal_date: _omit, ...rest } = notification

    await consumer({ ...baseParams, data: rest })

    expect(mockInsertNotification).toHaveBeenCalledWith(
      expect.objectContaining({ renewal_date: '2026-08-07T00:00:00.000Z' })
    )
  })

  it('falls back renewal_date to now when neither renewal_date nor notification_time is present', async () => {
    await consumer({ ...baseParams, data: { uuid: 'uuid-123', event_type: 'resumed' } })

    const [record] = mockInsertNotification.mock.calls[0]
    expect(typeof record.renewal_date).toBe('string')
    expect(Number.isNaN(Date.parse(record.renewal_date))).toBe(false)
  })

  it('omits event_type when it is missing from the notification', async () => {
    await consumer({ ...baseParams, data: { uuid: 'uuid-123', renewal_date: '2026-08-20' } })

    expect(mockInsertNotification).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: undefined })
    )
  })

  it('reports the failure and returns 500 when the insert fails', async () => {
    const insertError = new Error('abdb unavailable')
    mockInsertNotification.mockRejectedValue(insertError)

    const response = (await consumer(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')

    expect(ReportBuilder.build).toHaveBeenCalledWith(
      notification,
      false,
      insertError,
      'fail',
      'message_consumption'
    )
    expect(mockPublish).toHaveBeenCalledWith('com.dish.pricechange.reporting.queued', reportRow)
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockInsertNotification.mockRejectedValue('insert failure')

    const response = (await consumer(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('insert failure')
  })

  it('still returns 500 when reporting the failure itself fails to publish', async () => {
    mockInsertNotification.mockRejectedValue(new Error('abdb unavailable'))
    mockPublish.mockRejectedValue(new Error('provider unavailable'))

    const response = (await consumer(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const response = (await consumer(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('token failure')
  })
})
