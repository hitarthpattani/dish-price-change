/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as list } from '@actions/renewal-notification/list'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'

jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/database/repository/prerenewal-notifications')

type ActionParams = Record<string, unknown>

describe('list', () => {
  let mockListNotifications: jest.Mock

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'get'
  }

  const notifications = [
    { uuid: 'uuid-1', renewal_date: '2026-03-19T08:35:00.000Z' },
    { uuid: 'uuid-2', renewal_date: '2026-03-19T06:34:00.000Z' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockListNotifications = jest.fn().mockResolvedValue(notifications)
    ;(PrerenewalNotificationsRepository as unknown as jest.Mock).mockImplementation(() => ({
      listNotifications: mockListNotifications
    }))
  })

  it('returns the notifications with a count', async () => {
    const response = (await list(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ notifications, count: 2 })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(PrerenewalNotificationsRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockListNotifications).toHaveBeenCalledWith()
  })

  it('works with the POST method', async () => {
    const response = (await list({ ...baseParams, __ow_method: 'post' })) as SuccessResponse

    expect(response.statusCode).toBe(200)
  })

  it('returns 500 when the lookup fails', async () => {
    mockListNotifications.mockRejectedValue(new Error('abdb unavailable'))

    const response = (await list(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockListNotifications.mockRejectedValue('lookup failure')

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

  it('should reject an unsupported HTTP method', async () => {
    const response = await list({ ...baseParams, __ow_method: 'delete' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })

  it('requires the authorization and x-gw-ims-org-id headers', async () => {
    const response = (await list({ ...baseParams, __ow_headers: {} })) as ErrorResponse

    expect(response.error.statusCode).toBe(400)
  })
})
