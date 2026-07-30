/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as consumer } from '@actions/external-events/reporting-delivery-consumer'

describe('reporting-delivery-consumer', () => {
  it('should return a placeholder success response (stub)', async () => {
    const response = (await consumer({ data: {} })) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('reporting-delivery-consumer')
  })
})
