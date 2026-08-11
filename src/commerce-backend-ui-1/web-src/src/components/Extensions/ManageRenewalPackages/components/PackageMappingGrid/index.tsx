/*
 * <license header>
 */

import React from 'react'
import {
  ActionButton,
  Content,
  Flex,
  Heading,
  Text,
  View,
  Well,
  Divider
} from '@adobe/react-spectrum'
import { ConfirmationDialog, DataTable } from '@adobe-commerce/aio-experience-kit'
import AddCircle from '@spectrum-icons/workflow/AddCircle'

import { usePackageMappingGrid } from '@components/Extensions/ManageRenewalPackages/hooks/usePackageMappingGrid'
import {
  PACKAGE_MAPPING_GRID_COLUMNS,
  PACKAGE_MAPPING_GRID_ACTION_PROPS,
  PACKAGE_MAPPING_DIALOG
} from '@components/Extensions/ManageRenewalPackages/utils/packageMappingGridConstants'
import { RenewalPackageType } from '@components/Extensions/ManageRenewalPackages/types'

/**
 * Package Mapping Grid Component
 *
 * A presentational component listing the SKU→date package mappings for a given mapping group,
 * with add/edit/delete actions. All business logic is delegated to the usePackageMappingGrid
 * custom hook.
 */
export const PackageMappingGrid: React.FC<{
  actionCallHeaders: Record<string, string>
  packageType: RenewalPackageType
}> = ({ actionCallHeaders, packageType }) => {
  const {
    isProcessing,
    gridData,
    confirmationDialogData,
    handleGridLoad,
    onAddButtonPress,
    handleGridActionPress,
    handlePrimaryPress,
    dismissConfirmationDialog
  } = usePackageMappingGrid(actionCallHeaders, packageType)

  const buttons = [
    <ActionButton key="add" type="button" isDisabled={isProcessing} onPress={onAddButtonPress}>
      <AddCircle size={'M'} />
      <Text>Add Mapping</Text>
    </ActionButton>
  ]

  return (
    <View
      margin={'size-0'}
      paddingEnd={'size-100'}
      paddingTop={'size-50'}
      paddingBottom={'size-50'}
    >
      <Well>
        <Flex direction="column" gap="size-100" marginTop={'size-100'} marginBottom="size-300">
          <Heading level={3} marginTop={0} marginBottom="size-50">
            {packageType === RenewalPackageType.ACTIVE
              ? 'Active Renewal Packages'
              : 'Pause Renewal Packages'}
          </Heading>
          <Content>
            <Text>
              {packageType === RenewalPackageType.ACTIVE
                ? 'Manage the active renewal packages that are currently in use.'
                : 'Manage the renewal packages that are currently paused.'}
            </Text>
          </Content>
        </Flex>

        <Divider size="S" marginBottom="size-300" />

        <DataTable
          columns={PACKAGE_MAPPING_GRID_COLUMNS}
          data={gridData}
          buttons={buttons}
          gridActions={PACKAGE_MAPPING_GRID_ACTION_PROPS}
          isProcessing={isProcessing}
          onGridActionPress={handleGridActionPress}
          onGridLoad={handleGridLoad}
          maxHeight={'size-6000'}
        />
      </Well>

      <ConfirmationDialog
        title={PACKAGE_MAPPING_DIALOG.DELETE_TITLE}
        message={confirmationDialogData.message}
        primaryButtonVariant={PACKAGE_MAPPING_DIALOG.PRIMARY_BUTTON_VARIANT}
        primaryButtonText={PACKAGE_MAPPING_DIALOG.PRIMARY_BUTTON_TEXT}
        secondaryButtonText={PACKAGE_MAPPING_DIALOG.SECONDARY_BUTTON_TEXT}
        onDismiss={dismissConfirmationDialog}
        onSecondaryPress={dismissConfirmationDialog}
        onPrimaryPress={handlePrimaryPress}
      />
    </View>
  )
}
