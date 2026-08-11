/*
 * <license header>
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { createNotificationService } from '@components/Extensions/ManageRenewalNotifications/utils/notificationService'
import { toNotificationsArray } from '@components/Extensions/ManageRenewalNotifications/utils/notificationGridHelpers'
import { useNotificationGridNotifications } from '@components/Extensions/ManageRenewalNotifications/hooks/useNotificationGridNotifications'
import { useConfirmationDialog } from '@components/Extensions/ManageRenewalNotifications/hooks/useConfirmationDialog'
import {
  NOTIFICATION_GRID_ACTIONS,
  NOTIFICATION_GRID_DIALOG
} from '@components/Extensions/ManageRenewalNotifications/utils/notificationGridConstants'
import type { NotificationGridItem } from '@components/Extensions/ManageRenewalNotifications/types'

/**
 * Custom hook for managing the renewal notifications grid
 *
 * Encapsulates loading/reloading of the `renewal-notification/list` data and the row-level
 * and mass delete actions (`renewal-notification/delete`).
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @param {number} [resetTrigger] - Optional trigger to reload the grid after an upload
 * @returns {Object} Grid state and handlers
 */
export const useNotificationGrid = (
  actionCallHeaders: Record<string, string>,
  resetTrigger?: number
) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [gridData, setGridData] = useState<NotificationGridItem[]>([])

  const notificationService = useMemo(
    () => createNotificationService(actionCallHeaders),
    [actionCallHeaders]
  )

  const { confirmationDialogData, showConfirmationDialog, dismissConfirmationDialog } =
    useConfirmationDialog()

  const { showLoadError, showDeleteSuccess, showDeleteError } = useNotificationGridNotifications()

  /** Handles loading renewal notifications from the backend */
  const handleGridLoad = useCallback(async () => {
    setIsProcessing(true)
    try {
      const response = await notificationService.listNotifications()
      setGridData(toNotificationsArray(response))
    } catch (error) {
      console.error('Error loading renewal notifications:', error)
      showLoadError()
      setGridData([])
    } finally {
      setIsProcessing(false)
    }
  }, [notificationService, showLoadError])

  /** Reloads the grid whenever `resetTrigger` changes (e.g. after a successful upload) */
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      handleGridLoad()
    }
  }, [resetTrigger, handleGridLoad])

  /**
   * Handles a row-level grid action (delete)
   *
   * @param {string} key - Action key
   * @param {NotificationGridItem} item - Grid item data
   */
  const handleGridActionPress = useCallback(
    async (key: string, item: NotificationGridItem) => {
      switch (key) {
        case NOTIFICATION_GRID_ACTIONS.DELETE:
          showConfirmationDialog(
            NOTIFICATION_GRID_DIALOG.DELETE_TITLE,
            NOTIFICATION_GRID_DIALOG.DELETE_MESSAGE,
            [item.id]
          )
          break
        default:
          console.log('no action for', key)
          break
      }
    },
    [showConfirmationDialog]
  )

  /**
   * Handles a mass grid action (delete)
   *
   * @param {string} key - Action key
   * @param {string[]} ids - Selected row ids
   */
  const handleMassActionPress = useCallback(
    async (key: string, ids: string[]) => {
      switch (key) {
        case NOTIFICATION_GRID_ACTIONS.DELETE:
          showConfirmationDialog(
            NOTIFICATION_GRID_DIALOG.DELETE_TITLE,
            NOTIFICATION_GRID_DIALOG.DELETE_MESSAGE,
            ids
          )
          break
        default:
          console.log('no action for', key)
          break
      }
    },
    [showConfirmationDialog]
  )

  /** Handles primary press for the delete confirmation dialog */
  const handlePrimaryPress = useCallback(async () => {
    setIsProcessing(true)
    dismissConfirmationDialog()

    try {
      const response = await notificationService.deleteNotifications(confirmationDialogData.keys)
      setGridData(toNotificationsArray(response))
      showDeleteSuccess()
    } catch (error) {
      console.error('Error deleting renewal notifications:', error)
      showDeleteError()
    } finally {
      setIsProcessing(false)
    }
  }, [
    notificationService,
    confirmationDialogData.keys,
    dismissConfirmationDialog,
    showDeleteSuccess,
    showDeleteError
  ])

  return {
    isProcessing,
    gridData,
    confirmationDialogData,
    handleGridLoad,
    handleGridActionPress,
    handleMassActionPress,
    handlePrimaryPress,
    dismissConfirmationDialog
  }
}
