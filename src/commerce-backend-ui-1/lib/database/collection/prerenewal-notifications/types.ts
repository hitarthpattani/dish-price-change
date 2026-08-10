/*
 * <license header>
 */

/* This file defines types for the Sling Prerenewal Notifications Collection */

import type { AbdbRecord } from '@adobe-commerce/aio-toolkit'

/** Supported ingestion origins for pre-renewal queue records. */
export enum PrerenewalNotificationSource {
  WEBHOOK = 'webhook',
  FILE = 'file'
}

/**
 * Lifecycle values stored in the notification status column.
 */
export enum PrerenewalNotificationStatus {
  NEW = 0,
  COMPLETE = 1,
  RETRY = 2
}

/**
 * A record in the `prerenewal_notifications` ABDB collection (plan §5.3).
 *
 * Work-queue row for an inbound renewal/resume notification, tracked through the
 * price-change pipeline with retry bookkeeping.
 */
export interface PrerenewalNotificationRecord extends AbdbRecord {
  /** Subscription UUID. */
  uuid: string

  /** Queue lifecycle state. Retry attempts are tracked separately by `retry_count`. */
  status: PrerenewalNotificationStatus

  /** Number of retries scheduled after the initial processing attempt. */
  retry_count: number

  /** `renewal.scheduled` or `resumed`. */
  event_type?: string

  /** Ingestion origin. */
  source?: PrerenewalNotificationSource

  /** ISO-8601 notification time. */
  notification_time?: string

  /** ISO-8601 retry timestamp, nullable. */
  timestamp?: string | null

  /** ISO-8601 renewal date. */
  renewal_date: string
}

/** Input accepted by repository insert methods before lifecycle defaults are applied. */
export interface PrerenewalNotificationInput extends AbdbRecord {
  /** Subscription UUID. */
  uuid: string

  /** Optional caller value; the repository always initializes this to `NEW`. */
  status?: PrerenewalNotificationStatus

  /** Optional caller value; the repository always initializes this to zero. */
  retry_count?: number

  /** `renewal.scheduled` or `resumed`. */
  event_type?: string

  /** Ingestion origin. */
  source?: PrerenewalNotificationSource

  /** ISO-8601 notification time. */
  notification_time?: string

  /** ISO-8601 retry timestamp, nullable. */
  timestamp?: string | null

  /** ISO-8601 renewal date. */
  renewal_date: string
}
