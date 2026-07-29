/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as receiver } from '@actions/renewal/notification'

type ActionParams = Record<string, unknown>

describe('notification', () => {
  const baseParams: ActionParams = {
    __ow_headers: {},
    __ow_method: 'post',
    uuid: 'uuid-123',
    event_type: 'renewal.scheduled'
  }

  it('should return a placeholder success response (stub)', async () => {
    const response = (await receiver(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('notification')
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await receiver({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
