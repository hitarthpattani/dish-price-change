/*
 * <license header>
 */

import { PartnerBillingClient } from '@lib/integrations/partner-billing'

describe('PartnerBillingClient', () => {
  const createClient = () =>
    new PartnerBillingClient({
      pbp_batch_endpoint: 'https://pbp.example.com/batch'
    })

  it('should construct without params', () => {
    expect(() => new PartnerBillingClient({})).not.toThrow()
  })

  describe('getToken', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().getToken()).rejects.toThrow('TODO: implement getToken')
    })
  })

  describe('batchPriceChange', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().batchPriceChange('a-token', {})).rejects.toThrow(
        'TODO: implement batchPriceChange'
      )
    })
  })
})
