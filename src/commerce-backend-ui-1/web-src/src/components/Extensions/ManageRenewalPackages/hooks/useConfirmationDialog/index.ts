/*
 * <license header>
 */

import { useState, useCallback } from 'react'

/**
 * Confirmation dialog data structure
 */
export interface ConfirmationDialogData {
  message: string
  keys: string[]
}

/**
 * Custom hook to manage confirmation dialog state for package mapping deletion.
 *
 * Provides functions to show and dismiss a confirmation dialog with a message and the
 * associated record ids (a single id for row-level delete, multiple for mass delete).
 */
export const useConfirmationDialog = () => {
  const [confirmationDialogData, setConfirmationDialogData] = useState<ConfirmationDialogData>({
    message: '',
    keys: []
  })

  const showConfirmationDialog = useCallback((message: string, keys: string[]) => {
    setConfirmationDialogData({ message, keys })
  }, [])

  const dismissConfirmationDialog = useCallback(() => {
    setConfirmationDialogData({ message: '', keys: [] })
  }, [])

  return {
    confirmationDialogData,
    showConfirmationDialog,
    dismissConfirmationDialog
  } as const
}
