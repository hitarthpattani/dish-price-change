/*
 * <license header>
 */

/* This file exposes the PrerenewalNotificationsCollection class */

import { AbdbCollection, AbdbColumnType } from '@adobe-commerce/aio-toolkit'

/**
 * ABDB collection definition for `prerenewal_notifications`.
 *
 * Migrated verbatim from the source Commerce `sling_prerenewal_notifications` table (plan §5.3).
 * The virtual `id` (from AbdbRecord) maps to MongoDB `_id`, replacing the source `entity_id` PK,
 * so `entity_id` is not declared as an explicit column.
 */
export class PrerenewalNotificationsCollection extends AbdbCollection {
  constructor() {
    super('prerenewal_notifications', collection => {
      collection
        .addColumn('request', AbdbColumnType.STRING, 'Request Payload (JSON)', true)
        .addColumn('status', AbdbColumnType.NUMBER, 'Status', true)
        .addColumn('retry_count', AbdbColumnType.NUMBER, 'Retry Count', true)
        .addColumn('event_type', AbdbColumnType.STRING, 'Event Type', false)
        .addColumn('source', AbdbColumnType.STRING, 'Source', false)
        .addColumn(
          'notification_time',
          AbdbColumnType.STRING,
          'Notification Time (ISO-8601)',
          false
        )
        .addColumn('timestamp', AbdbColumnType.STRING, 'Retry Timestamp (ISO-8601)', false)
        .addColumn('renewal_date', AbdbColumnType.STRING, 'Renewal Date (ISO-8601)', true)
    })
  }
}
