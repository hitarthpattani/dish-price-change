/*
 * <license header>
 */

import React from 'react'
import { View, Heading, Content, Text, Well, Flex, Divider } from '@adobe/react-spectrum'
import { ConfirmationDialog, DataTable } from '@adobe-commerce/aio-experience-kit'

import { useCacheGrid } from '@components/Extensions/ManageCaches/hooks/useCacheGrid'
import {
  CACHE_GRID_TEXT,
  CACHE_GRID_DIALOG,
  CACHE_GRID_COLUMNS,
  CACHE_GRID_ACTION_PROPS
} from '@components/Extensions/ManageCaches/utils/cacheGridConstants'
import { getCacheGridButtons } from '@components/Extensions/ManageCaches/utils/cacheGridConfig'
import { CacheViewDialog } from '../CacheViewDialog'

/**
 * Cache Grid Component
 *
 * A presentational component for displaying cache entries in a grid format.
 * All business logic is delegated to the useCacheGrid custom hook.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Record<string, string>} props.actionCallHeaders - Authentication headers for runtime actions
 *
 * @example
 * ```tsx
 * <CacheGrid actionCallHeaders={headers} />
 * ```
 */
export const CacheGrid: React.FC<{
  actionCallHeaders: Record<string, string>
}> = ({ actionCallHeaders }) => {
  // Use custom hook to manage grid state and logic
  const {
    isProcessing,
    gridData,
    confirmationDialogData,
    viewDialogData,
    handleGridLoad,
    handleGridActionPress,
    handleFlushCache,
    handlePrimaryPress,
    dismissConfirmationDialog,
    dismissViewDialog
  } = useCacheGrid(actionCallHeaders)

  // Build action buttons with current handlers and processing state
  const buttons = getCacheGridButtons(handleFlushCache, isProcessing, gridData.length > 0)

  return (
    <View marginBottom={'size-400'}>
      <Well>
        {/* Header Section */}
        <Flex direction="column" gap="size-100" marginTop={'size-100'} marginBottom="size-250">
          <Heading level={3} marginTop={0} marginBottom="size-50">
            {CACHE_GRID_TEXT.HEADING}
          </Heading>
          <Content>
            <Text>{CACHE_GRID_TEXT.DESCRIPTION}</Text>
          </Content>
        </Flex>

        <Divider size="S" marginBottom="size-250" />

        {/* Data Table */}
        <DataTable
          columns={CACHE_GRID_COLUMNS}
          data={gridData}
          buttons={buttons}
          isProcessing={isProcessing}
          gridActions={CACHE_GRID_ACTION_PROPS}
          onGridLoad={handleGridLoad}
          maxHeight={'size-6000'}
          onGridActionPress={handleGridActionPress}
        />
      </Well>

      {/* Confirmation Dialog for Delete/Flush */}
      <ConfirmationDialog
        title={confirmationDialogData.title}
        message={confirmationDialogData.message}
        primaryButtonVariant={CACHE_GRID_DIALOG.PRIMARY_BUTTON_VARIANT}
        primaryButtonText={CACHE_GRID_DIALOG.PRIMARY_BUTTON_TEXT}
        secondaryButtonText={CACHE_GRID_DIALOG.SECONDARY_BUTTON_TEXT}
        onDismiss={dismissConfirmationDialog}
        onSecondaryPress={dismissConfirmationDialog}
        onPrimaryPress={handlePrimaryPress}
      />

      {/* View Details Dialog */}
      <CacheViewDialog
        isOpen={viewDialogData.isOpen}
        item={viewDialogData.item}
        onClose={dismissViewDialog}
      />
    </View>
  )
}
