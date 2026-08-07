/*
 * <license header>
 */

import { ReportBuilder } from '@lib/utils/report-builder'
import { FLOW_CODE } from '@lib/utils/logger'

describe('ReportBuilder', () => {
  const notification = {
    uuid: 'uuid-123',
    user_guid: 'user-456',
    event_type: 'renewal.scheduled',
    source: 'webhook'
  }

  describe('build', () => {
    it('assembles a row from the notification, outcome, and step', () => {
      const row = ReportBuilder.build(
        notification,
        true,
        'all good',
        'success',
        'message_consumption'
      )

      expect(row).toEqual({
        uuid: 'uuid-123',
        user_guid: 'user-456',
        event_type: 'renewal.scheduled',
        origin: 'webhook',
        processing_step: 'message_consumption',
        is_eligible: true,
        reason: 'all good',
        message: 'all good',
        status: 'success',
        source: FLOW_CODE
      })
    })

    it('falls back user_guid to uuid when the notification has no user_guid', () => {
      const { user_guid: _omit, ...rest } = notification

      const row = ReportBuilder.build(rest, false, undefined, 'NA', 'message_consumption')

      expect(row.user_guid).toBe('uuid-123')
    })

    it('defaults uuid/event_type/origin to empty strings when absent', () => {
      const row = ReportBuilder.build({}, false, undefined, 'NA', 'message_consumption')

      expect(row.uuid).toBe('')
      expect(row.user_guid).toBe('')
      expect(row.event_type).toBe('')
      expect(row.origin).toBe('')
    })

    it('summarizes an Error message into reason', () => {
      const row = ReportBuilder.build(
        notification,
        false,
        new Error('publish failed'),
        'fail',
        'step'
      )

      expect(row.reason).toBe('publish failed')
      expect(row.message).toBeInstanceOf(Error)
    })

    it('treats a null/undefined message as an empty reason', () => {
      const row = ReportBuilder.build(notification, false, null, 'NA', 'step')

      expect(row.reason).toBe('')
    })

    it('coerces a non-string, non-Error message into reason', () => {
      const row = ReportBuilder.build(notification, false, { code: 503 }, 'fail', 'step')

      expect(row.reason).toBe('[object Object]')
    })
  })
})
