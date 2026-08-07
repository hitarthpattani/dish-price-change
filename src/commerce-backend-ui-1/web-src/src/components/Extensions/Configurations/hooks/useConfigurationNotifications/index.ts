/*
 * <license header>
 */

import { useCallback } from 'react'
import { ToastQueue } from '@adobe/react-spectrum'
import { CONFIGURATION_MESSAGES } from '@components/Extensions/Configurations/utils/configurationConstants'

/**
 * Custom hook for managing toast notifications in the Configurations screen
 *
 * Provides reusable functions to display success and error messages for the
 * scope picker and configuration form using React Spectrum's ToastQueue.
 *
 * @returns {Object} Notification functions
 * @returns {Function} showLoadError - Display scope picker load error message
 * @returns {Function} showFormSaveSuccess - Display configuration form save success message
 * @returns {Function} showFormSaveError - Display configuration form save error message
 *
 * @example
 * ```typescript
 * const { showLoadError, showFormSaveSuccess, showFormSaveError } =
 *   useConfigurationNotifications();
 *
 * showLoadError();
 * ```
 */
export const useConfigurationNotifications = () => {
  /**
   * Display scope picker load error toast message
   */
  const showLoadError = useCallback(() => {
    ToastQueue.negative(CONFIGURATION_MESSAGES.LOAD_ERROR, {
      timeout: CONFIGURATION_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /**
   * Display configuration form save success toast message
   */
  const showFormSaveSuccess = useCallback(() => {
    ToastQueue.positive(CONFIGURATION_MESSAGES.FORM_SAVE_SUCCESS, {
      timeout: CONFIGURATION_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  /**
   * Display configuration form save error toast message
   */
  const showFormSaveError = useCallback(() => {
    ToastQueue.negative(CONFIGURATION_MESSAGES.FORM_SAVE_ERROR, {
      timeout: CONFIGURATION_MESSAGES.TOAST_TIMEOUT
    })
  }, [])

  return {
    showLoadError,
    showFormSaveSuccess,
    showFormSaveError
  }
}
