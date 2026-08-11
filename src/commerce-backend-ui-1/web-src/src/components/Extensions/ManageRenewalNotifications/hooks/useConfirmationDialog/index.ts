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
 * Custom hook to manage confirmation dialog state for renewal notification deletion.
 *
 * Provides functions to show and dismiss a confirmation dialog with a title, message and
 * the associated record ids.
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
