/*
 * <license header>
 */

import { createLogger, logStep, StepCode, FLOW_CODE } from '@lib/utils/logger'

describe('logger', () => {
  it('should export the flow code', () => {
    expect(FLOW_CODE).toBe('PRICECHANGE')
  })

  it('should export the step code catalog', () => {
    expect(StepCode.PRICECHANGE_001).toBe('PRICECHANGE_001')
    expect(StepCode.PRICECHANGE_012).toBe('PRICECHANGE_012')
  })

  describe('createLogger', () => {
    it('should throw TODO error', () => {
      expect(() => createLogger('some-action', {})).toThrow('TODO: implement createLogger')
    })
  })

  describe('logStep', () => {
    it('should throw TODO error', () => {
      const logger = {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }

      expect(() => logStep(logger, StepCode.PRICECHANGE_001, {})).toThrow('TODO: implement logStep')
    })
  })
})
