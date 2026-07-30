/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as scheduler } from '@actions/application-crons/price-change-scheduler'

describe('price-change-scheduler', () => {
  it('should return a placeholder success response (stub)', async () => {
    const response = (await scheduler({})) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('price-change-scheduler')
  })
})
