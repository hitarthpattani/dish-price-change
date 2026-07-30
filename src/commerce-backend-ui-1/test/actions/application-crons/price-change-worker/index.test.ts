/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as worker } from '@actions/application-crons/price-change-worker'

describe('price-change-worker', () => {
  it('should return a placeholder success response (stub)', async () => {
    const response = (await worker({})) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('price-change-worker')
  })
})
