/*
 * <license header>
 */

import type { SuccessResponse } from '@adobe-commerce/aio-toolkit'
import { main as checkoutSubmitConsumer } from '@actions/commerce/events/checkout-submit/consumer/index'

type ActionParams = Record<string, unknown>

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

const baseParams: ActionParams = {
  __ow_headers: {},
  orderId: '12345'
}

describe('commerce/events/checkout-submit/consumer', () => {
  it('should be defined', () => {
    expect(checkoutSubmitConsumer).toBeInstanceOf(Function)
  })

  it('should return success response with params', async () => {
    const response = (await checkoutSubmitConsumer(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.success).toBe(true)
    expect(body.params).toEqual(baseParams)
  })
})
