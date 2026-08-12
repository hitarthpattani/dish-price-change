/*
 * <license header>
 */

import { useCallback } from 'react'
import { ToastQueue } from '@adobe/react-spectrum'
import { PACKAGE_MAPPING_MESSAGES } from '@components/Extensions/ManageRenewalPackages/utils/packageMappingGridConstants'

/**
 * Custom hook for managing toast notifications on the renewal package mapping screen
 *
 * @returns {Object} Notification functions
 */
export const usePackageMappingGridNotifications = () => {
  /** Display a list load error toast message */
  const showLoadError = useCallback(() => {
    ToastQueue.negative(PACKAGE_MAPPING_MESSAGES.LOAD_ERROR, {
      timeout: PACKAGE_MAPPING_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /** Display a single mapping load error toast message (edit form) */
  const showLoadMappingError = useCallback(() => {
    ToastQueue.negative(PACKAGE_MAPPING_MESSAGES.LOAD_MAPPING_ERROR, {
      timeout: PACKAGE_MAPPING_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /** Display a SKU options load error toast message (add/edit form) */
  const showLoadSkusError = useCallback(() => {
    ToastQueue.negative(PACKAGE_MAPPING_MESSAGES.LOAD_SKUS_ERROR, {
      timeout: PACKAGE_MAPPING_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /** Display a save success toast message */
  const showSaveSuccess = useCallback(() => {
    ToastQueue.positive(PACKAGE_MAPPING_MESSAGES.SAVE_SUCCESS, {
      timeout: PACKAGE_MAPPING_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /** Display a save error toast message */
  const showSaveError = useCallback(() => {
    ToastQueue.negative(PACKAGE_MAPPING_MESSAGES.SAVE_ERROR, {
      timeout: PACKAGE_MAPPING_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /** Display a delete success toast message */
  const showDeleteSuccess = useCallback(() => {
    ToastQueue.positive(PACKAGE_MAPPING_MESSAGES.DELETE_SUCCESS, {
      timeout: PACKAGE_MAPPING_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /** Display a delete error toast message */
  const showDeleteError = useCallback(() => {
    ToastQueue.negative(PACKAGE_MAPPING_MESSAGES.DELETE_ERROR, {
      timeout: PACKAGE_MAPPING_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  return {
    showLoadError,
    showLoadMappingError,
    showLoadSkusError,
    showSaveSuccess,
    showSaveError,
    showDeleteSuccess,
    showDeleteError
  }
}
