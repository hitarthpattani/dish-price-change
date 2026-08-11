/*
 * <license header>
 */

import { useState, useCallback, useMemo } from 'react'
import { useRouteParams } from '@adobe-commerce/aio-experience-kit'
import { createPackageMappingService } from '@components/Extensions/ManageRenewalPackages/utils/packageMappingService'
import {
  toPackageMappingsArray,
  getRouteBase
} from '@components/Extensions/ManageRenewalPackages/utils/packageMappingGridHelpers'
import {
  PACKAGE_MAPPING_GRID_ACTIONS,
  PACKAGE_MAPPING_DIALOG
} from '@components/Extensions/ManageRenewalPackages/utils/packageMappingGridConstants'
import { usePackageMappingGridNotifications } from '@components/Extensions/ManageRenewalPackages/hooks/usePackageMappingGridNotifications'
import { useConfirmationDialog } from '@components/Extensions/ManageRenewalPackages/hooks/useConfirmationDialog'
import type {
  PackageMappingGridItem,
  RenewalPackageType
} from '@components/Extensions/ManageRenewalPackages/types'

/**
 * Custom hook for managing the renewal package mapping grid
 *
 * Encapsulates loading of the `renewal-package/list` data for a given mapping group, and the
 * add/edit/delete navigation and actions (`renewal-package/delete`). Each Active/Pause screen is
 * a separate route mounting this hook with a fixed `packageType`.
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @param {RenewalPackageType} packageType - Mapping group to load (active or pause)
 * @returns {Object} Grid state and handlers
 */
export const usePackageMappingGrid = (
  actionCallHeaders: Record<string, string>,
  packageType: RenewalPackageType
) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [gridData, setGridData] = useState<PackageMappingGridItem[]>([])

  const packageMappingService = useMemo(
    () => createPackageMappingService(actionCallHeaders),
    [actionCallHeaders]
  )

  const { showLoadError, showDeleteSuccess, showDeleteError } = usePackageMappingGridNotifications()
  const { confirmationDialogData, showConfirmationDialog, dismissConfirmationDialog } =
    useConfirmationDialog()

  const service = useRouteParams()
  const navigate = service.getNavigate()
  const routeBase = getRouteBase(packageType)

  /** Handles loading package mappings from the backend for the current package type */
  const handleGridLoad = useCallback(async () => {
    setIsProcessing(true)
    try {
      const response = await packageMappingService.listMappings(packageType)
      setGridData(toPackageMappingsArray(response))
    } catch (error) {
      console.error('Error loading renewal package mappings:', error)
      showLoadError()
      setGridData([])
    } finally {
      setIsProcessing(false)
    }
  }, [packageMappingService, packageType, showLoadError])

  /** Navigates to the add-mapping form */
  const onAddButtonPress = useCallback(() => {
    navigate(`${routeBase}/form`)
  }, [navigate, routeBase])

  /**
   * Handles a row-level grid action (edit or delete)
   *
   * @param {string} key - Action key
   * @param {PackageMappingGridItem} item - Grid item data
   */
  const handleGridActionPress = useCallback(
    async (key: string, item: PackageMappingGridItem) => {
      switch (key) {
        case PACKAGE_MAPPING_GRID_ACTIONS.EDIT:
          navigate(`${routeBase}/form/${item.id}`)
          break
        case PACKAGE_MAPPING_GRID_ACTIONS.DELETE:
          showConfirmationDialog(PACKAGE_MAPPING_DIALOG.DELETE_MESSAGE, item.id)
          break
        default:
          console.log('no action for', key)
          break
      }
    },
    [navigate, routeBase, showConfirmationDialog]
  )

  /** Handles primary press for the delete confirmation dialog */
  const handlePrimaryPress = useCallback(async () => {
    const id = confirmationDialogData.id
    dismissConfirmationDialog()

    if (!id) {
      return
    }

    setIsProcessing(true)
    try {
      await packageMappingService.deleteMapping(id)
      showDeleteSuccess()
      await handleGridLoad()
    } catch (error) {
      console.error('Error deleting renewal package mapping:', error)
      showDeleteError()
    } finally {
      setIsProcessing(false)
    }
  }, [
    confirmationDialogData.id,
    dismissConfirmationDialog,
    packageMappingService,
    showDeleteSuccess,
    showDeleteError,
    handleGridLoad
  ])

  return {
    isProcessing,
    gridData,
    confirmationDialogData,
    handleGridLoad,
    onAddButtonPress,
    handleGridActionPress,
    handlePrimaryPress,
    dismissConfirmationDialog
  }
}
