/*
 * <license header>
 */

import { useState, useCallback, useMemo } from 'react'
import { createCacheService } from '@components/Extensions/ManageCaches/utils/cacheService'
import { useConfirmationDialog } from '../useConfirmationDialog'
import {
  CACHE_GRID_ACTIONS,
  CACHE_GRID_DIALOG
} from '@components/Extensions/ManageCaches/utils/cacheGridConstants'
import { toCachesArray } from '@components/Extensions/ManageCaches/utils/cacheGridHelpers'
import { useCacheGridNotifications } from '../useCacheGridNotifications'
import type { CacheGridItem } from '@components/Extensions/ManageCaches/types'

/**
 * Custom hook for managing Cache Grid state and logic
 *
 * Encapsulates all the grid state, data loading, and actions (view, delete, flush)
 * for the Cache Grid component.
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @returns {Object} Grid state and handlers
 *
 * @example
 * ```typescript
 * const {
 *   isProcessing,
 *   gridData,
 *   confirmationDialogData,
 *   viewDialogData,
 *   handleGridLoad,
 *   handleGridActionPress,
 *   handleFlushCache,
 *   handlePrimaryPress,
 *   dismissConfirmationDialog,
 *   dismissViewDialog,
 * } = useCacheGrid(actionCallHeaders);
 * ```
 */
export const useCacheGrid = (actionCallHeaders: Record<string, string>) => {
  // State for tracking loading/processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // State for storing grid data
  const [gridData, setGridData] = useState<CacheGridItem[]>([])

  // State for view dialog
  const [viewDialogData, setViewDialogData] = useState<{
    isOpen: boolean
    item: CacheGridItem | null
  }>({
    isOpen: false,
    item: null
  })

  // Create API service instance
  const cacheService = useMemo(() => createCacheService(actionCallHeaders), [actionCallHeaders])

  // Get confirmation dialog state and methods
  const { confirmationDialogData, showConfirmationDialog, dismissConfirmationDialog } =
    useConfirmationDialog()

  // Get notification functions
  const { showDeleteSuccess, showDeleteError, showLoadError, showFlushSuccess } =
    useCacheGridNotifications()

  /**
   * Handles loading cache data from the backend
   */
  const handleGridLoad = useCallback(async () => {
    setIsProcessing(true)
    try {
      const response = await cacheService.listCaches()
      setGridData(toCachesArray(response))
    } catch (error) {
      console.error('Error loading caches:', error)
      showLoadError()
      setGridData([])
    } finally {
      setIsProcessing(false)
    }
  }, [cacheService, showLoadError])

  /**
   * Handles grid action press (view or delete)
   *
   * @param {string} key - Action key ('view' or 'delete')
   * @param {CacheGridItem} item - Grid item data
   */
  const handleGridActionPress = useCallback(
    async (key: string, item: CacheGridItem) => {
      switch (key) {
        case CACHE_GRID_ACTIONS.VIEW:
          setViewDialogData({
            isOpen: true,
            item
          })
          break
        case CACHE_GRID_ACTIONS.DELETE:
          showConfirmationDialog(CACHE_GRID_DIALOG.DELETE_TITLE, CACHE_GRID_DIALOG.DELETE_MESSAGE, [
            item.id
          ])
          break
        default:
          console.log('no action for', key)
          break
      }
    },
    [showConfirmationDialog]
  )

  /**
   * Handles primary press for delete/flush confirmation dialog
   * Supports both single cache deletion and flushing all caches
   */
  const handlePrimaryPress = useCallback(async () => {
    setIsProcessing(true)
    dismissConfirmationDialog()

    const isFlushAll = confirmationDialogData.keys.length > 1

    try {
      const response = await cacheService.deleteCaches(confirmationDialogData.keys)
      if (response) {
        setGridData(toCachesArray(response))
        // Show appropriate success message based on operation type
        if (isFlushAll) {
          showFlushSuccess()
        } else {
          showDeleteSuccess()
        }
      } else {
        showDeleteError()
      }
    } catch (error) {
      console.error('Error deleting caches:', error)
      showDeleteError()
    } finally {
      setIsProcessing(false)
    }
  }, [
    cacheService,
    confirmationDialogData.keys,
    dismissConfirmationDialog,
    showDeleteSuccess,
    showDeleteError,
    showFlushSuccess
  ])

  /**
   * Dismisses the view dialog
   */
  const dismissViewDialog = useCallback(() => {
    setViewDialogData({
      isOpen: false,
      item: null
    })
  }, [])

  /**
   * Handles flush cache action - deletes all cache entries
   */
  const handleFlushCache = useCallback(() => {
    if (gridData.length === 0) {
      return // No caches to flush
    }

    const allKeys = gridData.map(item => item.id)
    showConfirmationDialog(CACHE_GRID_DIALOG.FLUSH_TITLE, CACHE_GRID_DIALOG.FLUSH_MESSAGE, allKeys)
  }, [gridData, showConfirmationDialog])

  return {
    // State
    isProcessing,
    gridData,
    confirmationDialogData,
    viewDialogData,

    // Handlers
    handleGridLoad,
    handleGridActionPress,
    handleFlushCache,
    handlePrimaryPress,
    dismissConfirmationDialog,
    dismissViewDialog
  }
}
