/*
 * <license header>
 */

/* This file defines types for the Sling Prerenewal Notifications Collection */

import type { AbdbRecord } from '@adobe-commerce/aio-toolkit'

/**
 * A record in the `sling_prerenewal_notifications` ABDB collection (plan §5.3).
 *
 * Work-queue row for an inbound renewal/resume notification, tracked through the
 * price-change pipeline with retry bookkeeping.
 */
export interface SlingPrerenewalNotificationRecord extends AbdbRecord {
  /** JSON-encoded renewal payload. */
  request: string

  /** `0`=new, `1`=finalized; intermediate values act as a retry counter. */
  status: number

  /** `renewal.scheduled` or `resumed`. */
  event_type?: string

  /** `webhook` or `file`. */
  source?: string

  /** ISO-8601 notification time. */
  notification_time?: string

  /** ISO-8601 creation timestamp. */
  created_at?: string

  /** ISO-8601 retry timestamp, nullable. */
  timestamp?: string

  /** ISO-8601 renewal date. */
  renewal_date: string
}
