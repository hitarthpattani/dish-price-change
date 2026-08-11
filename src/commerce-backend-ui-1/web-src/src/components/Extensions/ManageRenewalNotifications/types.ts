/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/MainPage/utils/NavigationProvider/types'

/** Properties required by the renewal-notification management screen. */
export interface ManageRenewalNotificationsProps {
  /** Authentication and organization headers forwarded to backend actions. */
  actionCallHeaders: ActionCallHeaders
}

/** A single `prerenewal_notifications` record as returned by the `list` action. */
export interface NotificationItem {
  _id?: string
  uuid: string
  renewal_date: string
  event_type?: string
  status: number
  retry_count?: number
  [key: string]: unknown
}

/** Response shape returned by the `renewal-notification/list` action. */
export interface NotificationListResponse {
  notifications: NotificationItem[]
  count: number
}

/** Response shape returned by the `renewal-notification/upload` action. */
export interface NotificationUploadResponse {
  imported: number
  skipped: number
  errors: string[]
}

/** Grid-formatted notification item for DataTable display. */
export interface NotificationGridItem {
  id: string
  uuid: string
  renewal_date: string
  event_type: string
  status: string
}
