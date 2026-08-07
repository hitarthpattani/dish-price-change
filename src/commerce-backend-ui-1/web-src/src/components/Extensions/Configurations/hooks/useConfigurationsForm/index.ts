/*
 * <license header>
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouteParams } from '@adobe-commerce/aio-experience-kit'
import type { FormBuilderComponents } from '@adobe-commerce/aio-experience-kit'
import { createConfigurationService } from '@components/Extensions/Configurations/utils/configurationService'
import { getConfigurationsFormFields } from '@components/Extensions/Configurations/utils/configurationsFormConfig'
import { useConfigurationNotifications } from '../useConfigurationNotifications'

/**
 * Custom hook for managing the Configuration Settings form state and logic
 *
 * Saves the flat `configuration` key-value map for the given scope (shared with
 * the Scope Picker via the parent `Configurations` component), and generates the
 * static field/group schema consumed by `DataForm`.
 *
 * This hook does not fetch on its own — `configuration` for the current scope is
 * already loaded once by `useConfigurationScope` (the same `configuration/load`
 * response also builds the scope tree), and passed in as `initialConfiguration`.
 * Fetching it again here would be a duplicate request. `DataForm`'s fields are
 * uncontrolled (each field reads `editItem` exactly once, on its own mount), so
 * the parent `ConfigurationsForm` must be remounted (e.g. via
 * `key={`${scope}:${scopeId}`}`) whenever the scope changes, so this hook's
 * `editItem` state is re-seeded from the new scope's `initialConfiguration`
 * rather than trying to reset it in place.
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @param {string} scope - Configuration scope to save to (e.g. `default`, `website`, `store`)
 * @param {number} scopeId - Identifier of the scope entity to save to
 * @param {Record<string, string>} initialConfiguration - Configuration already loaded for this scope
 * @returns {Object} Form state and handlers
 *
 * @example
 * ```typescript
 * const { formFields, editItem, isSaving, onFormSubmit, onFormDismiss } =
 *   useConfigurationsForm(actionCallHeaders, scope, scopeId, configuration);
 * ```
 */
export const useConfigurationsForm = (
  actionCallHeaders: Record<string, string>,
  scope: string,
  scopeId: number,
  initialConfiguration: Record<string, string>
) => {
  // Static field/group schema, filtered down to the fields available at this scope
  const formFields: FormBuilderComponents = useMemo(
    () => getConfigurationsFormFields(scope),
    [scope]
  )

  // Current configuration values being edited, seeded from the already-loaded configuration
  const [editItem, setEditItem] = useState<Record<string, string>>(initialConfiguration)

  // State for tracking saving
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Create API service instance
  const configurationService = useMemo(
    () => createConfigurationService(actionCallHeaders),
    [actionCallHeaders]
  )

  // Get notification functions
  const { showFormSaveSuccess, showFormSaveError } = useConfigurationNotifications()

  // Navigation service, matching the pattern already used by other Extensions screens
  const service = useRouteParams()
  const navigate = service.getNavigate()

  // Tracks whether this component instance is still mounted, so a save that resolves after the
  // user has switched scope (remounting this hook's owner) doesn't update stale state.
  const isMountedRef = useRef(true)
  useEffect(
    () => () => {
      isMountedRef.current = false
    },
    []
  )

  /**
   * Saves the configuration values for the current scope
   *
   * @param {Record<string, string>} values - Form values to save
   */
  const onFormSubmit = useCallback(
    async (values: Record<string, string>): Promise<void> => {
      setIsSaving(true)
      try {
        const response = await configurationService.saveConfiguration(scope, scopeId, values)
        if (!isMountedRef.current) {
          return
        }
        setEditItem(response.configuration)
        showFormSaveSuccess()
      } catch (error) {
        console.error('Error saving configuration settings:', error)
        if (isMountedRef.current) {
          showFormSaveError()
        }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false)
        }
      }
    },
    [configurationService, scope, scopeId, showFormSaveSuccess, showFormSaveError]
  )

  /**
   * Navigates back to the dashboard without saving
   */
  const onFormDismiss = useCallback((): void => {
    navigate('/')
  }, [navigate])

  return {
    formFields,
    editItem,
    isSaving,
    onFormSubmit,
    onFormDismiss
  }
}
