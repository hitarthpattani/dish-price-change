/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as rebuildCache } from '@actions/application-crons/rebuild-bundle-guid-cache'

describe('rebuild-bundle-guid-cache', () => {
  it('should return a placeholder success response (stub)', async () => {
    const response = (await rebuildCache({})) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('rebuild-bundle-guid-cache')
  })
})
