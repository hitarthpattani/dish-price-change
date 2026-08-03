/*
 * <license header>
 */

/* This file exposes the PrerenewalNotificationsRepository class */

import { AbdbRepository } from '@adobe-commerce/aio-toolkit'
import { ObjectId } from 'bson'
import { PrerenewalNotificationsCollection } from '@lib/database/collection/prerenewal-notifications'
import {
  PrerenewalNotificationInput,
  PrerenewalNotificationRecord,
  PrerenewalNotificationSource,
  PrerenewalNotificationStatus
} from '@lib/database/collection/prerenewal-notifications/types'

/**
 * Repository for the `prerenewal_notifications` ABDB collection (plan §5.3).
 *
 * Consumed by: Flow 1 (insert via consumer), Flow 2 (bulk insert via CSV import),
 * Flow 3 (read batch + lifecycle/retry updates), Flow 5 (delete completed records).
 */
export class PrerenewalNotificationsRepository extends AbdbRepository<PrerenewalNotificationRecord> {
  private readonly token: string
  private readonly region: string

  /**
   * @param token - A valid IMS access token used to authenticate ABDB requests.
   * @param region - App Builder Data region. Defaults to `amer`.
   */
  constructor(token: string, region = 'amer') {
    super(new PrerenewalNotificationsCollection(), token, region)
    this.token = token
    this.region = region
  }

  /**
   * Insert a single notification row (used by the Flow 1 persist consumer).
   *
   * @param rec - Notification record to persist. A missing source is defaulted.
   * @returns The persisted record with its generated ABDB identifier.
   */
  public async insertNotification(
    rec: PrerenewalNotificationInput
  ): Promise<PrerenewalNotificationRecord> {
    const record = this.withInsertDefaults(rec, PrerenewalNotificationSource.WEBHOOK)
    const result = await this.insertOne(record)

    return { ...record, _id: String(result.insertedId) }
  }

  /**
   * Bulk-insert notification rows (used by the Flow 2 CSV import). Returns the inserted count.
   *
   * @param recs - Notification records to persist as file-originated queue entries.
   * @returns Number of records inserted; zero for an empty input array.
   */
  public async insertMany(recs: PrerenewalNotificationInput[]): Promise<number> {
    if (recs.length === 0) {
      return 0
    }

    const records = recs.map(rec => this.withInsertDefaults(rec, PrerenewalNotificationSource.FILE))
    const result = await this.insert(records)

    if (typeof result.insertedCount === 'number') {
      return result.insertedCount
    }

    return Object.keys(result.insertedIds ?? {}).length
  }

  /**
   * Find notifications due for price change (used by the Flow 3 scheduler).
   *
   * Selects all `NEW` records plus `RETRY` records whose retry timestamp is due, ordered by
   * `renewal_date ASC`.
   *
   * @param batchSize - Maximum number of queue records to return.
   * @param retryCutoffIso - Latest retry timestamp eligible for this sweep.
   * @returns Due queue records ordered by renewal date.
   * @throws RangeError When `batchSize` is not a positive integer.
   */
  public async findDueForPriceChange(
    batchSize: number,
    retryCutoffIso: string
  ): Promise<PrerenewalNotificationRecord[]> {
    this.assertPositiveInteger(batchSize, 'batchSize')

    return this.find(
      {
        $or: [
          { status: PrerenewalNotificationStatus.NEW },
          {
            status: PrerenewalNotificationStatus.RETRY,
            timestamp: { $lte: retryCutoffIso }
          }
        ]
      },
      { page_size: batchSize, sort: { column: 'renewal_date', direction: 'asc' } }
    )
  }

  /**
   * Mark terminal queue records as complete and clear their retry timestamp.
   *
   * @param ids - ABDB record identifiers to complete.
   */
  public async markComplete(ids: string[]): Promise<void> {
    await this.updateStatus(ids, {
      status: PrerenewalNotificationStatus.COMPLETE,
      timestamp: null
    })
  }

  /**
   * Schedule selected records for retry and increment their retry counter.
   *
   * The counter uses an atomic `$inc` so concurrent failure handling cannot overwrite retries.
   *
   * @param ids - ABDB record identifiers to retry.
   * @param iso - ISO-8601 timestamp anchoring retry-interval eligibility.
   */
  public async scheduleRetry(ids: string[], iso: string): Promise<void> {
    if (ids.length === 0) {
      return
    }

    const objectIds = this.toObjectIds(ids)
    await this.getCollection().run(
      collection =>
        collection.updateMany(
          { _id: { $in: objectIds } },
          {
            $inc: { retry_count: 1 },
            $set: {
              status: PrerenewalNotificationStatus.RETRY,
              timestamp: iso,
              _updated_at: new Date().toISOString()
            }
          }
        ),
      this.token,
      this.region
    )
  }

  /**
   * Delete complete rows older than `days`, capped at `batchSize` (Flow 5 purge).
   * Returns the number of rows deleted.
   *
   * @param days - Minimum record age in 24-hour periods.
   * @param batchSize - Maximum number of records to delete in one sweep.
   * @returns Number of records deleted.
   * @throws RangeError When the retention period or batch size is invalid.
   */
  public async deleteCompletedOlderThan(days: number, batchSize: number): Promise<number> {
    if (!Number.isFinite(days) || days < 0) {
      throw new RangeError('days must be a non-negative number')
    }
    this.assertPositiveInteger(batchSize, 'batchSize')

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    return this.getCollection().run(
      async collection => {
        const records = await collection
          .find(
            {
              status: PrerenewalNotificationStatus.COMPLETE,
              _created_at: { $lte: cutoff }
            },
            { projection: { _id: 1 } }
          )
          .sort({ _created_at: 1 })
          .limit(batchSize)
          .toArray()

        if (records.length === 0) {
          return 0
        }

        const result = await collection.deleteMany({
          _id: { $in: records.map(record => record._id) }
        })
        return result.deletedCount ?? 0
      },
      this.token,
      this.region
    )
  }

  /**
   * Apply queue metadata that is not supplied by an ingestion action.
   *
   * @param rec - Incoming notification record.
   * @param source - Default ingestion source for the calling flow.
   * @returns A new record containing lifecycle and source defaults.
   */
  private withInsertDefaults(
    rec: PrerenewalNotificationInput,
    source: PrerenewalNotificationSource
  ): PrerenewalNotificationRecord {
    return {
      ...rec,
      status: PrerenewalNotificationStatus.NEW,
      retry_count: 0,
      source: rec.source ?? source,
      timestamp: null
    }
  }

  /**
   * Apply the same lifecycle status update to a set of ABDB records.
   *
   * @param ids - ABDB record identifiers to update.
   * @param payload - Status and retry timestamp fields to apply.
   */
  private async updateStatus(
    ids: string[],
    payload: Pick<PrerenewalNotificationRecord, 'status' | 'timestamp'>
  ): Promise<void> {
    if (ids.length === 0) {
      return
    }

    await this.update(payload, { _id: { $in: this.toObjectIds(ids) } })
  }

  /**
   * Convert serialized ABDB identifiers into MongoDB ObjectIds for filtered operations.
   *
   * @param ids - Serialized ABDB identifiers.
   * @returns MongoDB ObjectIds in the original order.
   */
  private toObjectIds(ids: string[]): ObjectId[] {
    return ids.map(id => new ObjectId(id))
  }

  /**
   * Validate numeric batch controls before issuing a database operation.
   *
   * @param value - Candidate numeric value.
   * @param name - Parameter name included in validation errors.
   * @throws RangeError When `value` is not a positive integer.
   */
  private assertPositiveInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError(`${name} must be a positive integer`)
    }
  }
}
