/*
 * <license header>
 */

import { useState, useCallback } from 'react'

/**
 * Confirmation dialog data structure
 */
export interface ConfirmationDialogData {
  title: string
  message: string
  keys: string[]
}

/**
 * Custom hook to manage confirmation dialog state for cache deletion.
 *
 * Provides functions to show and dismiss a confirmation dialog with a title, message and associated keys.
 *
 * @returns {Object} Confirmation dialog state and handlers
 * @returns {ConfirmationDialogData} confirmationDialogData - Current dialog data (title, message and keys)
 * @returns {Function} showConfirmationDialog - Function to show the dialog with a title, message and keys
 * @returns {Function} dismissConfirmationDialog - Function to dismiss/hide the dialog
 */
export const useConfirmationDialog = () => {
  const [confirmationDialogData, setConfirmationDialogData] = useState<ConfirmationDialogData>({
    title: '',
    message: '',
    keys: []
  })

  const showConfirmationDialog = useCallback((title: string, message: string, keys: string[]) => {
    setConfirmationDialogData({
      title,
      message,
      keys
    })
  }, [])

  const dismissConfirmationDialog = useCallback(() => {
    setConfirmationDialogData({
      title: '',
      message: '',
      keys: []
    })
  }, [])

  return {
    confirmationDialogData,
    showConfirmationDialog,
    dismissConfirmationDialog
  } as const
}
