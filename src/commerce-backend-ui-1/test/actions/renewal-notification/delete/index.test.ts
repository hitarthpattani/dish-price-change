/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as deleteAction } from '@actions/renewal-notification/delete'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'

jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/database/repository/prerenewal-notifications')

type ActionParams = Record<string, unknown>

describe('delete', () => {
  let mockDeleteNotifications: jest.Mock
  let mockListNotifications: jest.Mock

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'post',
    ids: ['507f1f77bcf86cd799439011']
  }

  const notifications = [{ uuid: 'uuid-1', renewal_date: '2026-03-19T08:35:00.000Z' }]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockDeleteNotifications = jest.fn().mockResolvedValue(1)
    mockListNotifications = jest.fn().mockResolvedValue(notifications)
    ;(PrerenewalNotificationsRepository as unknown as jest.Mock).mockImplementation(() => ({
      deleteNotifications: mockDeleteNotifications,
      listNotifications: mockListNotifications
    }))
  })

  it('deletes the given ids and returns the refreshed list', async () => {
    const response = (await deleteAction(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ notifications, count: 1 })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(PrerenewalNotificationsRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockDeleteNotifications).toHaveBeenCalledWith(baseParams.ids)
    expect(mockListNotifications).toHaveBeenCalledWith()
  })

  it('works with the DELETE method', async () => {
    const response = (await deleteAction({
      ...baseParams,
      __ow_method: 'delete'
    })) as SuccessResponse

    expect(response.statusCode).toBe(200)
  })

  it('returns 500 when deletion fails', async () => {
    mockDeleteNotifications.mockRejectedValue(new Error('abdb unavailable'))

    const response = (await deleteAction(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockDeleteNotifications.mockRejectedValue('delete failure')

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

  it('should reject an unsupported HTTP method', async () => {
    const response = await deleteAction({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
