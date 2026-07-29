/*
 * <license header>
 */

import { RuntimeAction, HttpMethod, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'

const name = 'example-telemetry-action'

/**
 * Example telemetry action that returns a welcome message.
 */
export const main = RuntimeAction.execute(name, [HttpMethod.POST], [], [], async (params, ctx) => {
  const { logger, telemetry } = ctx

  logger.info({
    message: `${name}-log`,
    params: JSON.stringify(params)
  })

  const sampleInstrumental = telemetry.instrument(
    `runtime.action.${name}.sampleInstrumental`,
    async () => {
      const span = telemetry.getCurrentSpan()

      if (span) {
        span.setAttribute('test', 'ABC')
      }

      logger.info({
        message: `${name}-sampleInstrumental`,
        test: 'ABC'
      })

      return 'Hello World'
    }
  )

  const result = await sampleInstrumental()

  return RuntimeActionResponse.success(result)
})
