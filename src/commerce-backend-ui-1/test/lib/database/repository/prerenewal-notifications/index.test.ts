/*
 * <license header>
 */

import { ObjectId } from 'bson'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'
import {
  PrerenewalNotificationRecord,
  PrerenewalNotificationSource,
  PrerenewalNotificationStatus
} from '@lib/database/collection/prerenewal-notifications/types'

describe('PrerenewalNotificationsRepository', () => {
  const validId = '507f1f77bcf86cd799439011'
  const record: PrerenewalNotificationRecord = {
    uuid: 'uuid-123',
    status: PrerenewalNotificationStatus.NEW,
    retry_count: 0,
    renewal_date: '2026-01-01T00:00:00.000Z'
  }

  const createRepository = () => new PrerenewalNotificationsRepository('a-valid-token')

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-01T00:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should build on top of the prerenewal_notifications collection', () => {
    expect(createRepository().getName()).toBe('prerenewal_notifications')
  })

  it('exports the persisted source and lifecycle values', () => {
    expect(PrerenewalNotificationSource).toEqual({
      WEBHOOK: 'webhook',
      FILE: 'file'
    })
    expect(PrerenewalNotificationStatus).toMatchObject({
      NEW: 0,
      COMPLETE: 1,
      RETRY: 2
    })
  })

  describe('insertNotification', () => {
    it('inserts a webhook record with queue defaults and returns its id', async () => {
      const repository = createRepository()
      const insertOne = jest
        .spyOn(repository, 'insertOne')
        .mockResolvedValue({ insertedId: new ObjectId(validId) })

      await expect(repository.insertNotification(record)).resolves.toEqual({
        ...record,
        _id: validId,
        source: 'webhook',
        timestamp: null
      })
      expect(insertOne).toHaveBeenCalledWith({
        ...record,
        source: 'webhook',
        timestamp: null
      })
    })
  })

  describe('insertMany', () => {
    it('bulk inserts file records and returns the inserted count', async () => {
      const repository = createRepository()
      const insert = jest
        .spyOn(repository, 'insert')
        .mockResolvedValue({ insertedIds: { 0: new ObjectId(validId) } })

      await expect(repository.insertMany([record])).resolves.toBe(1)
      expect(insert).toHaveBeenCalledWith([
        {
          ...record,
          source: 'file',
          timestamp: null
        }
      ])
    })

    it('uses insertedCount when returned by the database', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'insert').mockResolvedValue({ insertedCount: 1 })

      await expect(repository.insertMany([record])).resolves.toBe(1)
    })

    it('returns zero when the database omits insert counters', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'insert').mockResolvedValue({})

      await expect(repository.insertMany([record])).resolves.toBe(0)
    })

    it('preserves explicitly supplied queue metadata', async () => {
      const repository = createRepository()
      const insert = jest.spyOn(repository, 'insert').mockResolvedValue({ insertedCount: 1 })
      const explicit = {
        ...record,
        source: PrerenewalNotificationSource.WEBHOOK
      }

      await repository.insertMany([explicit])

      expect(insert).toHaveBeenCalledWith([{ ...explicit, timestamp: null }])
    })

    it('forces new lifecycle values for every inserted record', async () => {
      const repository = createRepository()
      const insert = jest.spyOn(repository, 'insert').mockResolvedValue({ insertedCount: 1 })
      const retryRecord = {
        ...record,
        status: PrerenewalNotificationStatus.RETRY,
        retry_count: 5,
        timestamp: '2026-01-01T00:00:00.000Z'
      }

      await repository.insertMany([retryRecord])

      expect(insert).toHaveBeenCalledWith([
        expect.objectContaining({
          status: PrerenewalNotificationStatus.NEW,
          retry_count: 0,
          source: PrerenewalNotificationSource.FILE,
          timestamp: null
        })
      ])
    })

    it('does not call ABDB for an empty batch', async () => {
      const repository = createRepository()
      const insert = jest.spyOn(repository, 'insert')

      await expect(repository.insertMany([])).resolves.toBe(0)
      expect(insert).not.toHaveBeenCalled()
    })
  })

  describe('listNotifications', () => {
    it('lists notifications newest-first, capped at the default page size', async () => {
      const repository = createRepository()
      const find = jest.spyOn(repository, 'find').mockResolvedValue([record])

      await expect(repository.listNotifications()).resolves.toEqual([record])
      expect(find).toHaveBeenCalledWith(
        {},
        { page_size: 100, sort: { column: '_created_at', direction: 'desc' } }
      )
    })

    it('honors a custom page size', async () => {
      const repository = createRepository()
      const find = jest.spyOn(repository, 'find').mockResolvedValue([record])

      await repository.listNotifications(10)

      expect(find).toHaveBeenCalledWith(
        {},
        { page_size: 10, sort: { column: '_created_at', direction: 'desc' } }
      )
    })
  })

  describe('deleteNotifications', () => {
    it('deletes rows matching the given ids and returns the deleted count', async () => {
      const repository = createRepository()
      const deleteSpy = jest.spyOn(repository, 'delete').mockResolvedValue({ deletedCount: 1 })

      await expect(repository.deleteNotifications([validId])).resolves.toBe(1)
      expect(deleteSpy).toHaveBeenCalledWith({ _id: { $in: [new ObjectId(validId)] } })
    })

    it('returns zero when the database omits deletedCount', async () => {
      const repository = createRepository()
      jest.spyOn(repository, 'delete').mockResolvedValue({})

      await expect(repository.deleteNotifications([validId])).resolves.toBe(0)
    })

    it('does not call ABDB for an empty id list', async () => {
      const repository = createRepository()
      const deleteSpy = jest.spyOn(repository, 'delete')

      await expect(repository.deleteNotifications([])).resolves.toBe(0)
      expect(deleteSpy).not.toHaveBeenCalled()
    })
  })

  describe('parseCsvContent', () => {
    it('parses a header row and data rows into objects', () => {
      const content =
        'uuid,renewal_date\nuuid-1,2026-03-19T08:35:00.000Z\nuuid-2,2026-03-19T06:34:00.000Z'

      expect(createRepository().parseCsvContent(content)).toEqual([
        { uuid: 'uuid-1', renewal_date: '2026-03-19T08:35:00.000Z' },
        { uuid: 'uuid-2', renewal_date: '2026-03-19T06:34:00.000Z' }
      ])
    })

    it('strips a leading UTF-8 BOM from the header row', () => {
      const content = '﻿uuid,renewal_date\nuuid-1,2026-03-19T08:35:00.000Z'

      expect(createRepository().parseCsvContent(content)).toEqual([
        { uuid: 'uuid-1', renewal_date: '2026-03-19T08:35:00.000Z' }
      ])
    })

    it('trims whitespace around headers and values', () => {
      const content = ' uuid , renewal_date \n uuid-1 , 2026-03-19T08:35:00.000Z '

      expect(createRepository().parseCsvContent(content)).toEqual([
        { uuid: 'uuid-1', renewal_date: '2026-03-19T08:35:00.000Z' }
      ])
    })

    it('skips blank lines between data rows', () => {
      const content =
        'uuid,renewal_date\nuuid-1,2026-03-19T08:35:00.000Z\n\nuuid-2,2026-03-19T06:34:00.000Z'

      expect(createRepository().parseCsvContent(content)).toHaveLength(2)
    })

    it('throws when the CSV has no data rows', () => {
      expect(() => createRepository().parseCsvContent('uuid,renewal_date')).toThrow(
        'CSV must contain at least a header row and one data row'
      )
    })

    it('throws when the header row is blank', () => {
      expect(() => createRepository().parseCsvContent('\nuuid-1,2026-03-19T08:35:00.000Z')).toThrow(
        'CSV header row is empty'
      )
    })

    it('throws when the CSV is empty', () => {
      expect(() => createRepository().parseCsvContent('')).toThrow(
        'CSV must contain at least a header row and one data row'
      )
    })

    it('throws when a row has a different column count than the header', () => {
      const content = 'uuid,renewal_date\nuuid-1'

      expect(() => createRepository().parseCsvContent(content)).toThrow(
        'Row 2 has 1 values but expected 2'
      )
    })
  })

  describe('findDueForPriceChange', () => {
    it('finds new and due retry rows in renewal-date order', async () => {
      const repository = createRepository()
      const find = jest.spyOn(repository, 'find').mockResolvedValue([record])
      const cutoff = '2026-01-01T00:00:00.000Z'

      await expect(repository.findDueForPriceChange(10, cutoff)).resolves.toEqual([record])
      expect(find).toHaveBeenCalledWith(
        {
          $or: [
            { status: PrerenewalNotificationStatus.NEW },
            {
              status: PrerenewalNotificationStatus.RETRY,
              timestamp: { $lte: cutoff }
            }
          ]
        },
        { page_size: 10, sort: { column: 'renewal_date', direction: 'asc' } }
      )
    })

    it('rejects an invalid batch size', async () => {
      await expect(createRepository().findDueForPriceChange(0, '')).rejects.toThrow(
        'batchSize must be a positive integer'
      )
    })

    it('rejects a fractional batch size', async () => {
      await expect(createRepository().findDueForPriceChange(1.5, '')).rejects.toThrow(
        'batchSize must be a positive integer'
      )
    })
  })

  describe('queue status updates', () => {
    it('marks terminal rows complete and clears their retry timestamp', async () => {
      const repository = createRepository()
      const update = jest.spyOn(repository, 'update').mockResolvedValue({ modifiedCount: 1 })

      await repository.markComplete([validId])

      expect(update).toHaveBeenCalledWith(
        { status: PrerenewalNotificationStatus.COMPLETE, timestamp: null },
        { _id: { $in: [new ObjectId(validId)] } }
      )
    })

    it('sets retry status, increments retry_count, and stamps its due-time anchor', async () => {
      const repository = createRepository()
      const updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 })
      jest
        .spyOn(repository.getCollection(), 'run')
        .mockImplementation(async callback => callback({ updateMany } as never, {} as never))

      await repository.scheduleRetry([validId], '2026-02-02T00:00:00.000Z')

      expect(updateMany).toHaveBeenCalledWith(
        { _id: { $in: [new ObjectId(validId)] } },
        {
          $inc: { retry_count: 1 },
          $set: {
            status: PrerenewalNotificationStatus.RETRY,
            timestamp: '2026-02-02T00:00:00.000Z',
            _updated_at: '2026-02-01T00:00:00.000Z'
          }
        }
      )
    })

    it('skips database updates for empty id lists', async () => {
      const repository = createRepository()
      const update = jest.spyOn(repository, 'update')
      const run = jest.spyOn(repository.getCollection(), 'run')

      await repository.markComplete([])
      await repository.scheduleRetry([], '2026-02-02T00:00:00.000Z')

      expect(update).not.toHaveBeenCalled()
      expect(run).not.toHaveBeenCalled()
    })
  })

  describe('deleteCompletedOlderThan', () => {
    it('deletes only the capped set of oldest complete rows', async () => {
      const repository = createRepository()
      const toArray = jest.fn().mockResolvedValue([{ _id: new ObjectId(validId) }])
      const limit = jest.fn().mockReturnValue({ toArray })
      const sort = jest.fn().mockReturnValue({ limit })
      const find = jest.fn().mockReturnValue({ sort })
      const deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 })
      jest
        .spyOn(repository.getCollection(), 'run')
        .mockImplementation(async callback => callback({ find, deleteMany } as never, {} as never))

      await expect(repository.deleteCompletedOlderThan(30, 100)).resolves.toBe(1)
      expect(find).toHaveBeenCalledWith(
        {
          status: PrerenewalNotificationStatus.COMPLETE,
          _created_at: { $lte: '2026-01-02T00:00:00.000Z' }
        },
        { projection: { _id: 1 } }
      )
      expect(sort).toHaveBeenCalledWith({ _created_at: 1 })
      expect(limit).toHaveBeenCalledWith(100)
      expect(deleteMany).toHaveBeenCalledWith({
        _id: { $in: [new ObjectId(validId)] }
      })
    })

    it('skips deletion when no complete rows match', async () => {
      const repository = createRepository()
      const toArray = jest.fn().mockResolvedValue([])
      const limit = jest.fn().mockReturnValue({ toArray })
      const sort = jest.fn().mockReturnValue({ limit })
      const find = jest.fn().mockReturnValue({ sort })
      const deleteMany = jest.fn()
      jest
        .spyOn(repository.getCollection(), 'run')
        .mockImplementation(async callback => callback({ find, deleteMany } as never, {} as never))

      await expect(repository.deleteCompletedOlderThan(30, 100)).resolves.toBe(0)
      expect(deleteMany).not.toHaveBeenCalled()
    })

    it('returns zero when the database omits deletedCount', async () => {
      const repository = createRepository()
      const toArray = jest.fn().mockResolvedValue([{ _id: new ObjectId(validId) }])
      const limit = jest.fn().mockReturnValue({ toArray })
      const sort = jest.fn().mockReturnValue({ limit })
      const find = jest.fn().mockReturnValue({ sort })
      const deleteMany = jest.fn().mockResolvedValue({})
      jest
        .spyOn(repository.getCollection(), 'run')
        .mockImplementation(async callback => callback({ find, deleteMany } as never, {} as never))

      await expect(repository.deleteCompletedOlderThan(30, 100)).resolves.toBe(0)
    })

    it.each([Number.NaN, -1])('rejects invalid retention days: %s', async days => {
      await expect(createRepository().deleteCompletedOlderThan(days, 100)).rejects.toThrow(
        'days must be a non-negative number'
      )
    })
  })
})
