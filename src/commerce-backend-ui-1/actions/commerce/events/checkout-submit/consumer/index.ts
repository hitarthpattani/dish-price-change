/*
 * <license header>
 */

import { EventConsumerAction, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'

export const main = EventConsumerAction.execute(
  'commerce-events-checkout-submit-consumer',
  [],
  [],
  async (params, ctx) => {
    const { logger } = ctx
    logger.info('Commerce events checkout submit consumer invoked')
    return RuntimeActionResponse.success({
      success: true,
      params
    })
  }
)
