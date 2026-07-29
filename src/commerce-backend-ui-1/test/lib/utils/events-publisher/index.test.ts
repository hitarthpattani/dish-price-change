/*
 * <license header>
 */

import { publishInternalEvent } from '@lib/utils/events-publisher'

describe('publishInternalEvent', () => {
  it('should throw TODO error', async () => {
    await expect(
      publishInternalEvent('com.dish.pricechange.prerenewal.received', {})
    ).rejects.toThrow('TODO: implement publishInternalEvent')
  })
})
