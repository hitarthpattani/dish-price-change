/*
 * <license header>
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouteParams } from '@adobe-commerce/aio-experience-kit'
import type { FormBuilderOption } from '@adobe-commerce/aio-experience-kit'
import { createPackageMappingService } from '@components/Extensions/ManageRenewalPackages/utils/packageMappingService'
import {
  parsePackages,
  serializePackages,
  toDateOnly,
  getRouteBase
} from '@components/Extensions/ManageRenewalPackages/utils/packageMappingGridHelpers'
import { usePackageMappingGridNotifications } from '@components/Extensions/ManageRenewalPackages/hooks/usePackageMappingGridNotifications'
import type {
  PackageMappingFormItem,
  RenewalPackageType
} from '@components/Extensions/ManageRenewalPackages/types'

const BLANK_ITEM: PackageMappingFormItem = { effective_date: '', packages: [] }

/**
 * Custom hook for managing the renewal package mapping add/edit form
 *
 * Loads the existing mapping via `renewal-package/load` when `id` is set (edit mode), or seeds a
 * blank item (create mode); loads the `packages` field's SKU options via `renewal-package/skus`
 * (Adobe Commerce's enabled product catalog) regardless of mode; then saves via
 * `renewal-package/save` on submit.
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @param {RenewalPackageType} packageType - Mapping group this form edits (active or pause)
 * @param {string} [id] - ABDB record id being edited; undefined when creating a new mapping
 * @returns {Object} Form state and handlers
 */
export const usePackageMappingForm = (
  actionCallHeaders: Record<string, string>,
  packageType: RenewalPackageType,
  id: string | undefined
) => {
  const [mappingLoading, setMappingLoading] = useState<boolean>(true)
  const [skusLoading, setSkusLoading] = useState<boolean>(true)
  const [skuOptions, setSkuOptions] = useState<FormBuilderOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [editItem, setEditItem] = useState<PackageMappingFormItem>(BLANK_ITEM)

  const packageMappingService = useMemo(
    () => createPackageMappingService(actionCallHeaders),
    [actionCallHeaders]
  )

  const { showLoadMappingError, showLoadSkusError, showSaveSuccess, showSaveError } =
    usePackageMappingGridNotifications()

  const service = useRouteParams()
  const navigate = service.getNavigate()
  const routeBase = getRouteBase(packageType)

  // Tracks whether this component instance is still mounted, so a load/save that resolves after
  // the user has navigated away doesn't update stale state.
  const isMountedRef = useRef(true)
  useEffect(
    () => () => {
      isMountedRef.current = false
    },
    []
  )

  // Loads the `packages` field's SKU options — independent of `id`, since both the add and edit
  // screens need the same Commerce product catalog.
  useEffect(() => {
    setSkusLoading(true)
    packageMappingService
      .listSkus()
      .then(response => {
        if (!isMountedRef.current) {
          return
        }
        setSkuOptions(response.skus.map(sku => ({ value: sku, label: sku })))
      })
      .catch(error => {
        console.error('Error loading renewal package SKU options:', error)
        if (isMountedRef.current) {
          showLoadSkusError()
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setSkusLoading(false)
        }
      })
  }, [packageMappingService, showLoadSkusError])

  useEffect(() => {
    if (!id) {
      setEditItem(BLANK_ITEM)
      setMappingLoading(false)
      return
    }

    setMappingLoading(true)
    packageMappingService
      .loadMapping(id)
      .then(response => {
        if (!isMountedRef.current) {
          return
        }
        setEditItem({
          effective_date: toDateOnly(response.mapping.effective_date),
          packages: parsePackages(response.mapping.packages)
        })
      })
      .catch(error => {
        console.error('Error loading renewal package mapping:', error)
        if (isMountedRef.current) {
          showLoadMappingError()
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setMappingLoading(false)
        }
      })
  }, [id, packageMappingService, showLoadMappingError])

  // Set on a successful save, consumed (and cleared) by onPostFormSubmit. DataForm's FormBuilder
  // calls `setSubmitting(false)` on itself right after `onFormSubmit` resolves, then awaits
  // `onPostFormSubmit` — navigating from onFormSubmit directly would unmount the form before that
  // `setSubmitting(false)` runs, triggering a "state update on an unmounted component" warning.
  const savedRef = useRef(false)

  /**
   * Saves the mapping being created or edited
   *
   * @param {PackageMappingFormItem} values - Form values to save
   */
  const onFormSubmit = useCallback(
    async (values: PackageMappingFormItem): Promise<void> => {
      setIsSubmitting(true)
      try {
        await packageMappingService.saveMapping(
          {
            mapping_type: packageType,
            effective_date: values.effective_date,
            packages: serializePackages(values.packages)
          },
          id
        )
        if (!isMountedRef.current) {
          return
        }
        savedRef.current = true
        showSaveSuccess()
      } catch (error) {
        console.error('Error saving renewal package mapping:', error)
        if (isMountedRef.current) {
          showSaveError()
        }
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false)
        }
      }
    },
    [packageMappingService, packageType, id, showSaveSuccess, showSaveError]
  )

  /** Navigates back to the grid once DataForm has finished its own post-submit state update */
  const onPostFormSubmit = useCallback(async (): Promise<void> => {
    if (savedRef.current) {
      savedRef.current = false
      navigate(routeBase)
    }
  }, [navigate, routeBase])

  /** Navigates back to the grid without saving */
  const onFormDismiss = useCallback((): void => {
    navigate(routeBase)
  }, [navigate, routeBase])

  return {
    loading: mappingLoading || skusLoading,
    skuOptions,
    isSubmitting,
    editItem,
    onFormSubmit,
    onPostFormSubmit,
    onFormDismiss
  }
}
