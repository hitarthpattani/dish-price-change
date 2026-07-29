/*
 * <license header>
 */

/* This file exposes the SlingPrerenewalNotificationsCollection class */

import { AbdbCollection, AbdbColumnType } from '@adobe-commerce/aio-toolkit'

/**
 * ABDB collection definition for the `sling_prerenewal_notifications` table.
 *
 * Migrated verbatim from the source Commerce `sling_prerenewal_notifications` table (plan §5.3).
 * The virtual `id` (from AbdbRecord) maps to MongoDB `_id`, replacing the source `entity_id` PK,
 * so `entity_id` is not declared as an explicit column.
 */
export class SlingPrerenewalNotificationsCollection extends AbdbCollection {
  constructor() {
    super('sling_prerenewal_notifications', collection => {
      collection
        .addColumn('request', AbdbColumnType.STRING, 'Request Payload (JSON)', true)
        .addColumn('status', AbdbColumnType.NUMBER, 'Status', true)
        .addColumn('event_type', AbdbColumnType.STRING, 'Event Type', false)
        .addColumn('source', AbdbColumnType.STRING, 'Source', false)
        .addColumn(
          'notification_time',
          AbdbColumnType.STRING,
          'Notification Time (ISO-8601)',
          false
        )
        .addColumn('created_at', AbdbColumnType.STRING, 'Created At (ISO-8601)', false)
        .addColumn('timestamp', AbdbColumnType.STRING, 'Retry Timestamp (ISO-8601)', false)
        .addColumn('renewal_date', AbdbColumnType.STRING, 'Renewal Date (ISO-8601)', true)
    })
  }
}
