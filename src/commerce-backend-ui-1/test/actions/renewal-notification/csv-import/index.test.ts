/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as csvImport } from '@actions/renewal-notification/csv-import'

type ActionParams = Record<string, unknown>

describe('csv-import', () => {
  const baseParams: ActionParams = {
    __ow_headers: {},
    __ow_method: 'post',
    file: 'uuid,renewal_date\n'
  }

  it('should return a placeholder success response (stub)', async () => {
    const response = (await csvImport(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.action).toBe('csv-import')
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await csvImport({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
