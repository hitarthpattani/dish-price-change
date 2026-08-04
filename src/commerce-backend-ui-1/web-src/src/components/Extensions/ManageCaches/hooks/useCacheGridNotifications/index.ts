/*
 * <license header>
 */

import { useCallback } from 'react'
import { ToastQueue } from '@adobe/react-spectrum'
import { CACHE_GRID_MESSAGES } from '@components/Extensions/ManageCaches/utils/cacheGridConstants'

/**
 * Custom hook for managing toast notifications in the Cache Grid
 *
 * Provides reusable functions to display success and error messages
 * using React Spectrum's ToastQueue.
 *
 * @returns {Object} Notification functions
 * @returns {Function} showDeleteSuccess - Display delete success message
 * @returns {Function} showDeleteError - Display delete error message
 * @returns {Function} showLoadError - Display load error message
 * @returns {Function} showFlushSuccess - Display flush cache success message
 *
 * @example
 * ```typescript
 * const {
 *   showDeleteSuccess,
 *   showDeleteError,
 *   showLoadError,
 *   showFlushSuccess
 * } = useCacheGridNotifications();
 *
 * // Show delete success
 * showDeleteSuccess();
 *
 * // Show delete error
 * showDeleteError();
 *
 * // Show load error
 * showLoadError();
 *
 * // Show flush success
 * showFlushSuccess();
 * ```
 */
export const useCacheGridNotifications = () => {
  /**
   * Display delete success toast message
   */
  const showDeleteSuccess = useCallback(() => {
    ToastQueue.positive(CACHE_GRID_MESSAGES.DELETE_SUCCESS, {
      timeout: CACHE_GRID_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /**
   * Display delete error toast message
   */
  const showDeleteError = useCallback(() => {
    ToastQueue.negative(CACHE_GRID_MESSAGES.DELETE_ERROR, {
      timeout: CACHE_GRID_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /**
   * Display load error toast message
   */
  const showLoadError = useCallback(() => {
    ToastQueue.negative(CACHE_GRID_MESSAGES.LOAD_ERROR, {
      timeout: CACHE_GRID_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /**
   * Display flush cache success toast message
   */
  const showFlushSuccess = useCallback(() => {
    ToastQueue.positive(CACHE_GRID_MESSAGES.FLUSH_SUCCESS, {
      timeout: CACHE_GRID_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  return {
    showDeleteSuccess,
    showDeleteError,
    showLoadError,
    showFlushSuccess
  }
}
