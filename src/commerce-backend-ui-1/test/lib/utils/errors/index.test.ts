/*
 * <license header>
 */

import { PriceChangeError, RetryableError, ConfigurationError } from '@lib/utils/errors'

describe('errors', () => {
  describe('PriceChangeError', () => {
    it('should set message and name', () => {
      const error = new PriceChangeError('something failed')

      expect(error.message).toBe('something failed')
      expect(error.name).toBe('PriceChangeError')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('RetryableError', () => {
    it('should set message, name and code', () => {
      const error = new RetryableError('downstream failed', 503)

      expect(error.message).toBe('downstream failed')
      expect(error.name).toBe('RetryableError')
      expect(error.code).toBe(503)
      expect(error).toBeInstanceOf(PriceChangeError)
    })

    it('should support a string code', () => {
      const error = new RetryableError('downstream failed', 'ETIMEDOUT')

      expect(error.code).toBe('ETIMEDOUT')
    })
  })

  describe('ConfigurationError', () => {
    it('should set message and name', () => {
      const error = new ConfigurationError('missing config')

      expect(error.message).toBe('missing config')
      expect(error.name).toBe('ConfigurationError')
      expect(error).toBeInstanceOf(PriceChangeError)
    })
  })
})
