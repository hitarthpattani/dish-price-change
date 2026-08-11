/*
 * <license header>
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { createNotificationService } from '@components/Extensions/ManageRenewalNotifications/utils/notificationService'
import { toNotificationsArray } from '@components/Extensions/ManageRenewalNotifications/utils/notificationGridHelpers'
import { useNotificationGridNotifications } from '@components/Extensions/ManageRenewalNotifications/hooks/useNotificationGridNotifications'
import type { NotificationGridItem } from '@components/Extensions/ManageRenewalNotifications/types'

/**
 * Custom hook for managing the renewal notifications grid
 *
 * Encapsulates loading and reloading of the `renewal-notification/list` data.
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

  const { showLoadError } = useNotificationGridNotifications()

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

  return {
    isProcessing,
    gridData,
    handleGridLoad
  }
}
