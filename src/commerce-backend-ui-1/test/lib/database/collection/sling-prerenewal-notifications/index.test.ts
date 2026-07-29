/*
 * <license header>
 */

import { SlingPrerenewalNotificationsCollection } from '@lib/database/collection/sling-prerenewal-notifications'

describe('SlingPrerenewalNotificationsCollection', () => {
  it('should be named sling_prerenewal_notifications', () => {
    const collection = new SlingPrerenewalNotificationsCollection()

    expect(collection.getName()).toBe('sling_prerenewal_notifications')
  })

  it('should declare all expected columns', () => {
    const collection = new SlingPrerenewalNotificationsCollection()

    const columnNames = collection.getColumns().map(column => column.getName())

    expect(columnNames).toEqual([
      'request',
      'status',
      'event_type',
      'source',
      'notification_time',
      'created_at',
      'timestamp',
      'renewal_date'
    ])
  })
})
