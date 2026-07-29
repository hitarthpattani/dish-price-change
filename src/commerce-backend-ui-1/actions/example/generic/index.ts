/*
 * <license header>
 */

import { RuntimeAction, HttpMethod, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'
import { UserRepository } from '@lib/database/repository/user'
import { Core } from '@adobe/aio-sdk'

/**
 * Example generic action that finds a user by email address and returns a welcome message.
 */
export const main = RuntimeAction.execute(
  'example-generic-action',
  [HttpMethod.POST],
  [],
  [],
  async (params, ctx) => {
    const { logger } = ctx

    logger.info('example-generic-action called', { params })

    const tokenResponse = await Core.AuthClient.generateAccessToken(params)
    const accessToken = tokenResponse?.access_token ?? ''

    const userRepository = new UserRepository(accessToken)
    const user = await userRepository.findByEmail(params.email ?? '')

    return RuntimeActionResponse.success({
      message: `Hello, ${user?.first_name ?? 'Guest'}!`
    })
  }
)
