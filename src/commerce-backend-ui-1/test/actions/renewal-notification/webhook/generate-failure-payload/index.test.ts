/*
 * <license header>
 */

jest.mock('@lib/utils/report-builder')

import { GenerateFailurePayload } from '@actions/renewal-notification/webhook/generate-failure-payload'
import { ReportBuilder } from '@lib/utils/report-builder'

describe('GenerateFailurePayload', () => {
  const notification = { uuid: 'uuid-123', event_type: 'renewal.scheduled' }
  const reportRow = { uuid: 'uuid-123', status: 'fail' } as unknown as ReturnType<
    typeof ReportBuilder.build
  >

  beforeEach(() => {
    jest.clearAllMocks()
    ;(ReportBuilder.build as jest.Mock).mockReturnValue(reportRow)
  })

  describe('execute', () => {
    it('builds a message_consumption failure row from the notification and error', () => {
      const publishError = new Error('provider unavailable')

      const payload = GenerateFailurePayload.execute(notification, publishError)

      expect(ReportBuilder.build).toHaveBeenCalledWith(
        notification,
        false,
        publishError,
        'fail',
        'message_consumption'
      )
      expect(payload).toBe(reportRow)
    })
  })
})
