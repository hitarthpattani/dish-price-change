/*
 * <license header>
 */

import { getBusinessConfig, extractRequestContext } from '@lib/utils/params'

describe('params', () => {
  describe('getBusinessConfig', () => {
    it('should throw TODO error', () => {
      expect(() => getBusinessConfig({}, 'price_change_enable')).toThrow(
        'TODO: implement getBusinessConfig'
      )
    })

    it('should throw TODO error with a fallback provided', () => {
      expect(() => getBusinessConfig({}, 'price_change_enable', true)).toThrow(
        'TODO: implement getBusinessConfig'
      )
    })
  })

  describe('extractRequestContext', () => {
    it('should throw TODO error', () => {
      expect(() => extractRequestContext({})).toThrow('TODO: implement extractRequestContext')
    })
  })
})
