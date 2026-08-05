/*
 * <license header>
 */

import { ConfigurationScope } from '@lib/utils/configuration-scope'

describe('ConfigurationScope', () => {
  describe('resolve', () => {
    it('resolves a valid string scope and numeric scope_id', () => {
      expect(ConfigurationScope.resolve({ scope: 'website', scope_id: 2 })).toEqual({
        scope: 'website',
        scopeId: 2
      })
    })

    it('resolves a numeric string scope_id', () => {
      expect(ConfigurationScope.resolve({ scope_id: '7' })).toEqual({
        scope: undefined,
        scopeId: 7
      })
    })

    it('returns undefined scope when absent', () => {
      expect(ConfigurationScope.resolve({})).toEqual({ scope: undefined, scopeId: undefined })
    })

    it('returns undefined scope when blank', () => {
      expect(ConfigurationScope.resolve({ scope: '   ' })).toEqual({
        scope: undefined,
        scopeId: undefined
      })
    })

    it('returns undefined scope when not a string', () => {
      expect(ConfigurationScope.resolve({ scope: 42 })).toEqual({
        scope: undefined,
        scopeId: undefined
      })
    })

    it('returns undefined scope_id when not finite', () => {
      expect(ConfigurationScope.resolve({ scope_id: Number.NaN })).toEqual({
        scope: undefined,
        scopeId: undefined
      })
    })

    it('returns undefined scope_id when a blank string', () => {
      expect(ConfigurationScope.resolve({ scope_id: '   ' })).toEqual({
        scope: undefined,
        scopeId: undefined
      })
    })

    it('returns undefined scope_id when a non-numeric string', () => {
      expect(ConfigurationScope.resolve({ scope_id: 'abc' })).toEqual({
        scope: undefined,
        scopeId: undefined
      })
    })

    it('returns undefined scope_id when neither a number nor a string', () => {
      expect(ConfigurationScope.resolve({ scope_id: true })).toEqual({
        scope: undefined,
        scopeId: undefined
      })
    })
  })
})
