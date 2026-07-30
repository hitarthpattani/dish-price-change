/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as packageMapping } from '@actions/price-change/package-mapping'

type ActionParams = Record<string, unknown>

describe('package-mapping', () => {
  const baseParams: ActionParams = { __ow_headers: {}, __ow_method: 'get' }

  it('should return a placeholder success response (stub)', async () => {
    const response = (await packageMapping(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('package-mapping')
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await packageMapping({ ...baseParams, __ow_method: 'put' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
