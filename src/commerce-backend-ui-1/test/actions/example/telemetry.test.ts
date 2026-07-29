/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { Telemetry } from '@adobe-commerce/aio-toolkit'
import { main as telemetryAction } from '../../../actions/example/telemetry/index'

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    }))
  }
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

const baseParams = {
  __ow_headers: {},
  __ow_method: 'post'
}

describe('example/telemetry action', () => {
  it('should be defined', () => {
    expect(telemetryAction).toBeInstanceOf(Function)
  })

  it('should return success response with Hello World when span is null', async () => {
    jest.spyOn(Telemetry.prototype, 'getCurrentSpan').mockReturnValue(null)

    const response = (await telemetryAction(baseParams)) as SuccessResponse

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('Hello World')
  })

  it('should set span attribute and return success when span is active', async () => {
    const mockSpan = { setAttribute: jest.fn(), addEvent: jest.fn() }
    jest.spyOn(Telemetry.prototype, 'getCurrentSpan').mockReturnValue(mockSpan)

    const response = (await telemetryAction(baseParams)) as SuccessResponse

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('Hello World')
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('test', 'ABC')
  })

  it('should return 405 for unsupported HTTP method', async () => {
    const response = await telemetryAction({
      ...baseParams,
      __ow_method: 'delete'
    })

    expect(response).toHaveProperty('error')
    const errorResponse = response as { error: { statusCode: number; body: { error: string } } }
    expect(errorResponse.error.statusCode).toBe(405)
    expect(errorResponse.error.body.error).toContain('Invalid HTTP method')
  })
})
