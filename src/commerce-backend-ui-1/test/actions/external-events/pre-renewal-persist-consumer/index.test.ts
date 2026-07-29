/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as consumer } from '@actions/external-events/pre-renewal-persist-consumer'

describe('pre-renewal-persist-consumer', () => {
  it('should return a placeholder success response (stub)', async () => {
    const response = (await consumer({ data: {} })) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('pre-renewal-persist-consumer')
  })
})
