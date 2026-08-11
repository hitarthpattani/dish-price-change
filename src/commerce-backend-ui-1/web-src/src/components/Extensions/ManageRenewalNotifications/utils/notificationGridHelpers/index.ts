/*
 * <license header>
 */

import { NOTIFICATION_STATUS_LABELS } from '@components/Extensions/ManageRenewalNotifications/utils/notificationGridConstants'
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationGridItem
} from '@components/Extensions/ManageRenewalNotifications/types'

/**
 * Converts API response to array format suitable for DataTable
 *
 * @param {NotificationListResponse | null | undefined} response - API response containing notifications
 * @returns {NotificationGridItem[]} Array of notifications formatted for DataTable
 */
export const toNotificationsArray = (
  response: NotificationListResponse | null | undefined
): NotificationGridItem[] => {
  if (!response?.notifications || !Array.isArray(response.notifications)) {
    return []
  }

  return response.notifications.map(
    (item: NotificationItem): NotificationGridItem => ({
      id: item._id || item.uuid,
      uuid: item.uuid,
      renewal_date: item.renewal_date,
      event_type: item.event_type || '',
      status: NOTIFICATION_STATUS_LABELS[item.status] ?? String(item.status)
    })
  )
}
