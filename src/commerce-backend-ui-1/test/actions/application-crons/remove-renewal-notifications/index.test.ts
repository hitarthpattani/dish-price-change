/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as removeRenewals } from '@actions/application-crons/remove-renewal-notifications'

describe('remove-renewal-notifications', () => {
  it('should return a placeholder success response (stub)', async () => {
    const response = (await removeRenewals({})) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('remove-renewal-notifications')
  })
})
