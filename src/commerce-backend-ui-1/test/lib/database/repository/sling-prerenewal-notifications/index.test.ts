/*
 * <license header>
 */

import { SlingPrerenewalNotificationsRepository } from '@lib/database/repository/sling-prerenewal-notifications'
import { SlingPrerenewalNotificationRecord } from '@lib/database/collection/sling-prerenewal-notifications/types'

describe('SlingPrerenewalNotificationsRepository', () => {
  const record: SlingPrerenewalNotificationRecord = {
    request: '{}',
    status: 0,
    renewal_date: '2026-01-01T00:00:00.000Z'
  }

  const createRepository = () => new SlingPrerenewalNotificationsRepository('a-valid-token')

  it('should build on top of the sling_prerenewal_notifications collection', () => {
    const repository = createRepository()

    expect(repository.getName()).toBe('sling_prerenewal_notifications')
  })

  describe('insertNotification', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().insertNotification(record)).rejects.toThrow(
        'TODO: implement insertNotification'
      )
    })
  })

  describe('insertMany', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().insertMany([record])).rejects.toThrow(
        'TODO: implement insertMany'
      )
    })
  })

  describe('findDueForPriceChange', () => {
    it('should throw TODO error', async () => {
      await expect(
        createRepository().findDueForPriceChange(10, '2026-01-01T00:00:00.000Z')
      ).rejects.toThrow('TODO: implement findDueForPriceChange')
    })
  })

  describe('markConsumed', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().markConsumed(['1'])).rejects.toThrow(
        'TODO: implement markConsumed'
      )
    })
  })

  describe('incrementRetry', () => {
    it('should throw TODO error', async () => {
      await expect(
        createRepository().incrementRetry(['1'], '2026-01-01T00:00:00.000Z')
      ).rejects.toThrow('TODO: implement incrementRetry')
    })
  })

  describe('markNotToRetry', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().markNotToRetry(['1'])).rejects.toThrow(
        'TODO: implement markNotToRetry'
      )
    })
  })

  describe('deleteFinalizedOlderThan', () => {
    it('should throw TODO error', async () => {
      await expect(createRepository().deleteFinalizedOlderThan(30, 100)).rejects.toThrow(
        'TODO: implement deleteFinalizedOlderThan'
      )
    })
  })
})
