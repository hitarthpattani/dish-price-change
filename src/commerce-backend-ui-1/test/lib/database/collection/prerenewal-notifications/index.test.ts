/*
 * <license header>
 */

import { PrerenewalNotificationsCollection } from '@lib/database/collection/prerenewal-notifications'

describe('PrerenewalNotificationsCollection', () => {
  it('should be named prerenewal_notifications', () => {
    const collection = new PrerenewalNotificationsCollection()

    expect(collection.getName()).toBe('prerenewal_notifications')
  })

  it('should declare all expected columns', () => {
    const collection = new PrerenewalNotificationsCollection()

    const columnNames = collection.getColumns().map(column => column.getName())

    expect(columnNames).toEqual([
      'request',
      'status',
      'retry_count',
      'event_type',
      'source',
      'notification_time',
      'timestamp',
      'renewal_date'
    ])
  })
})
