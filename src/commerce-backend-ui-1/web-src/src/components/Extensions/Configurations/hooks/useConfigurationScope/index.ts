/*
 * <license header>
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { createConfigurationService } from '@components/Extensions/Configurations/utils/configurationService'
import {
  toDefaultScopeItem,
  toScopePickerSections
} from '@components/Extensions/Configurations/utils/scopeTreeHelpers'
import {
  CONFIGURATION_TEXT,
  DEFAULT_SCOPE_KEY
} from '@components/Extensions/Configurations/utils/configurationConstants'
import { useConfigurationNotifications } from '../useConfigurationNotifications'
import type {
  ScopePickerItem,
  ScopePickerSection
} from '@components/Extensions/Configurations/types'

const DEFAULT_SCOPE_ITEM: ScopePickerItem = {
  key: DEFAULT_SCOPE_KEY,
  label: CONFIGURATION_TEXT.DEFAULT_SCOPE_LABEL
}

/**
 * Custom hook for managing the Configuration Scope Picker state and logic
 *
 * Loads the Commerce scope tree (Default Config -> Website -> Store Group ->
 * Store View) on mount and whenever the selected scope changes, tracking the
 * currently selected scope for the Scope Picker. Also exposes the loaded
 * `configuration` map for that scope, so the configuration form can consume it
 * directly instead of issuing its own duplicate `configuration/load` call.
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @returns {Object} Scope picker state and handlers
 *
 * @example
 * ```typescript
 * const {
 *   isLoading,
 *   defaultItem,
 *   sections,
 *   selectedScopeKey,
 *   scope,
 *   scopeId,
 *   configuration,
 *   handleScopeChange,
 * } = useConfigurationScope(actionCallHeaders);
 * ```
 */
export const useConfigurationScope = (actionCallHeaders: Record<string, string>) => {
  // State for tracking loading. Starts true (rather than false) because the mount effect below
  // always calls loadScope() — starting false would let the parent briefly render
  // ConfigurationsForm before that fetch even begins, mounting it with an empty configuration,
  // then unmount it again a tick later once this flips to true.
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // State for the currently selected scope key
  const [selectedScopeKey, setSelectedScopeKey] = useState<string>(DEFAULT_SCOPE_KEY)

  // State for the currently selected scope/scopeId, shared with sibling components (e.g. the
  // configuration form) that need to load/save data for the same scope as the picker.
  const [scope, setScope] = useState<string>('default')
  const [scopeId, setScopeId] = useState<number>(0)

  // State for the "Default Config" picker item
  const [defaultItem, setDefaultItem] = useState<ScopePickerItem>(DEFAULT_SCOPE_ITEM)

  // State for the per-website picker sections
  const [sections, setSections] = useState<ScopePickerSection[]>([])

  // State for the loaded configuration map, shared with the configuration form so it doesn't
  // need to issue its own duplicate configuration/load call for the same scope.
  const [configuration, setConfiguration] = useState<Record<string, string>>({})

  // Create API service instance
  const configurationService = useMemo(
    () => createConfigurationService(actionCallHeaders),
    [actionCallHeaders]
  )

  // Get notification functions
  const { showLoadError } = useConfigurationNotifications()

  // Tracks whether this hook's owning component is still mounted, so a load that resolves after
  // the user has navigated away doesn't try to update state on an unmounted component.
  const isMountedRef = useRef(true)
  useEffect(
    () => () => {
      isMountedRef.current = false
    },
    []
  )

  /**
   * Loads the configuration scope tree for the given scope, defaulting to
   * the backend's own default (`default`/`0`) when omitted.
   */
  const loadScope = useCallback(
    async (targetScope?: string, targetScopeId?: number) => {
      setIsLoading(true)
      try {
        const response = await configurationService.loadConfiguration(targetScope, targetScopeId)
        if (!isMountedRef.current) {
          return
        }
        setDefaultItem(toDefaultScopeItem(response.scopeTree))
        setSections(toScopePickerSections(response.scopeTree))
        setSelectedScopeKey(`${response.scope}:${response.scopeId}`)
        setScope(response.scope)
        setScopeId(response.scopeId)
        setConfiguration(response.configuration ?? {})
      } catch (error) {
        console.error('Error loading configuration scope:', error)
        if (isMountedRef.current) {
          showLoadError()
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [configurationService, showLoadError]
  )

  // Load the scope tree for the default scope on mount
  useEffect(() => {
    void loadScope()
  }, [loadScope])

  /**
   * Handles the user selecting a different scope in the Picker
   *
   * @param {string} key - Picker key in `scope:scopeId` format
   */
  const handleScopeChange = useCallback(
    (key: string) => {
      const [targetScope, targetScopeId] = key.split(':')
      void loadScope(targetScope, Number(targetScopeId))
    },
    [loadScope]
  )

  return {
    // State
    isLoading,
    defaultItem,
    sections,
    selectedScopeKey,
    scope,
    scopeId,
    configuration,

    // Handlers
    handleScopeChange
  }
}
