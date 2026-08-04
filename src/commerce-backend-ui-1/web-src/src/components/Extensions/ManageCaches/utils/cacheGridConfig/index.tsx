/*
 * <license header>
 */

import React from 'react'
import { ActionButton, Text } from '@adobe/react-spectrum'
import DataRefreshIcon from '@spectrum-icons/workflow/DataRefresh'

/**
 * Cache Grid Configuration
 *
 * Contains JSX configuration for the Cache Grid component,
 * including button definitions.
 *
 * @module cacheGridConfig
 */

/**
 * Generates grid button elements for the Cache Grid.
 *
 * Returns an array of React elements representing the action buttons
 * displayed in the grid toolbar (Flush Cache button).
 *
 * @param {Function} onFlushCachePress - Callback when "Flush Cache" is clicked
 * @param {boolean} isProcessing - Whether the grid is currently processing (disables buttons)
 * @param {boolean} hasData - Whether there is data in the grid (disables button if empty)
 * @returns {React.ReactElement[]} Array of button elements
 *
 * @example
 * ```tsx
 * const buttons = getCacheGridButtons(handleFlushCache, false, true);
 * <DataTable buttons={buttons} ... />
 * ```
 */
export const getCacheGridButtons = (
  onFlushCachePress: () => void,
  isProcessing: boolean = false,
  hasData: boolean = false
): React.ReactElement[] => {
  return [
    <ActionButton
      key="flush-cache"
      type="button"
      isDisabled={isProcessing || !hasData}
      onPress={onFlushCachePress}
      marginEnd="size-200"
      isQuiet={false}
    >
      <DataRefreshIcon size={'M'} />
      <Text>Flush Cache</Text>
    </ActionButton>
  ]
}
