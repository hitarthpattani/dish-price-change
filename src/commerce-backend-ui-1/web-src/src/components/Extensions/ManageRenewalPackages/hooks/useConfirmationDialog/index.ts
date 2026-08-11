/*
 * <license header>
 */

import { useState, useCallback } from 'react'

/**
 * Confirmation dialog data structure
 */
export interface ConfirmationDialogData {
  message: string
  id: string | null
}

/**
 * Custom hook to manage confirmation dialog state for package mapping deletion.
 *
 * Provides functions to show and dismiss a confirmation dialog with a message and the
 * associated record id.
 */
export const useConfirmationDialog = () => {
  const [confirmationDialogData, setConfirmationDialogData] = useState<ConfirmationDialogData>({
    message: '',
    id: null
  })

  const showConfirmationDialog = useCallback((message: string, id: string) => {
    setConfirmationDialogData({ message, id })
  }, [])

  const dismissConfirmationDialog = useCallback(() => {
    setConfirmationDialogData({ message: '', id: null })
  }, [])

  return {
    confirmationDialogData,
    showConfirmationDialog,
    dismissConfirmationDialog
  } as const
}
