/*
 * <license header>
 */

import { useCallback } from 'react'
import { ToastQueue } from '@adobe/react-spectrum'
import { NOTIFICATION_MESSAGES } from '@components/Extensions/ManageRenewalNotifications/utils/notificationGridConstants'

/**
 * Custom hook for managing toast notifications on the renewal notifications screen
 *
 * @returns {Object} Notification functions
 */
export const useNotificationGridNotifications = () => {
  /** Display an upload success toast message */
  const showUploadSuccess = useCallback((message: string) => {
    ToastQueue.positive(message, { timeout: NOTIFICATION_MESSAGES.TOAST_TIMEOUT })
  }, [])

  /** Display an upload error toast message */
  const showUploadError = useCallback((message: string) => {
    ToastQueue.negative(message, { timeout: NOTIFICATION_MESSAGES.TOAST_TIMEOUT })
  }, [])

  /** Display a validation error toast message when no file was selected */
  const showValidationError = useCallback(() => {
    ToastQueue.negative(NOTIFICATION_MESSAGES.NO_FILE_SELECTED, {
      timeout: NOTIFICATION_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /** Display a load error toast message */
  const showLoadError = useCallback(() => {
    ToastQueue.negative(NOTIFICATION_MESSAGES.LOAD_ERROR, {
      timeout: NOTIFICATION_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  return {
    showUploadSuccess,
    showUploadError,
    showValidationError,
    showLoadError
  }
}
