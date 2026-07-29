/*
 * <license header>
 */

import { RecurlyClient } from '@lib/integrations/recurly'

describe('RecurlyClient', () => {
  const createClient = () =>
    new RecurlyClient({
      recurly_endpoint: 'https://recurly.example.com',
      recurly_authorization: 'Basic dXNlcjpwYXNz'
    })

  it('should construct without params', () => {
    expect(() => new RecurlyClient({})).not.toThrow()
  })

  describe('fetchSubscription', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().fetchSubscription('sub-1')).rejects.toThrow(
        'TODO: implement fetchSubscription'
      )
    })
  })

  describe('changeSubscription', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().changeSubscription('sub-1', {})).rejects.toThrow(
        'TODO: implement changeSubscription'
      )
    })
  })
})
