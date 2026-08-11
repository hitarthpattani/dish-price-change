/*
 * <license header>
 */

import allActions from '@web/config.json'
import actionWebInvoke from '@web/utils'
import type {
  NotificationListResponse,
  NotificationUploadResponse
} from '@components/Extensions/ManageRenewalNotifications/types'

const actions = allActions as Record<string, string>

/**
 * Notification Service
 *
 * Service layer for interacting with the `renewal-notification` backend actions.
 * Provides methods for listing queued notifications and uploading a renewals CSV.
 */

/**
 * Creates a notification service instance with authentication headers
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @returns {Object} Service object with notification management methods
 */
export const createNotificationService = (actionCallHeaders: Record<string, string>) => {
  /**
   * Lists queued renewal notifications
   *
   * @returns {Promise<NotificationListResponse>} Response containing notification records
   */
  const listNotifications = async (): Promise<NotificationListResponse> => {
    try {
      const response = await actionWebInvoke(
        actions['renewal-notification/list'],
        actionCallHeaders,
        {}
      )
      return response as NotificationListResponse
    } catch (error) {
      console.error('Error listing renewal notifications:', error)
      throw error
    }
  }

  /**
   * Uploads renewal notifications from CSV content
   *
   * @param {string} content - CSV string content containing `uuid`/`renewal_date` rows
   * @returns {Promise<NotificationUploadResponse>} Import summary (imported/skipped/errors)
   */
  const uploadNotifications = async (content: string): Promise<NotificationUploadResponse> => {
    try {
      const response = await actionWebInvoke(
        actions['renewal-notification/upload'],
        actionCallHeaders,
        { content }
      )
      return response as NotificationUploadResponse
    } catch (error) {
      console.error('Error uploading renewal notifications:', error)
      throw error
    }
  }

  /**
   * Deletes renewal notifications by their ABDB record ids
   *
   * @param {string[]} ids - Record ids to delete
   * @returns {Promise<NotificationListResponse>} Refreshed notification list after deletion
   */
  const deleteNotifications = async (ids: string[]): Promise<NotificationListResponse> => {
    try {
      const response = await actionWebInvoke(
        actions['renewal-notification/delete'],
        actionCallHeaders,
        { ids }
      )
      return response as NotificationListResponse
    } catch (error) {
      console.error('Error deleting renewal notifications:', error)
      throw error
    }
  }

  return {
    listNotifications,
    uploadNotifications,
    deleteNotifications
  }
}
