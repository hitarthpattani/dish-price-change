/*
 * <license header>
 */

import React from 'react'
import {
  Content,
  Divider,
  Flex,
  Heading,
  ProgressCircle,
  Text,
  View,
  Well
} from '@adobe/react-spectrum'
import { DataForm } from '@adobe-commerce/aio-experience-kit'

import { usePackageMappingForm } from '@components/Extensions/ManageRenewalPackages/hooks/usePackageMappingForm'
import { getPackageMappingFormFields } from '@components/Extensions/ManageRenewalPackages/utils/packageMappingFormConfig'
import { RenewalPackageType } from '@components/Extensions/ManageRenewalPackages/types'
import type { PackageMappingFormItem } from '@components/Extensions/ManageRenewalPackages/types'

/**
 * Package Mapping Form Component
 *
 * A presentational component rendering the add/edit form for a single SKU→date package
 * mapping. All business logic is delegated to the usePackageMappingForm custom hook.
 */
export const PackageMappingForm: React.FC<{
  actionCallHeaders: Record<string, string>
  packageType: RenewalPackageType
  id: string | undefined
}> = ({ actionCallHeaders, packageType, id }) => {
  const { loading, isSubmitting, editItem, onFormSubmit, onPostFormSubmit, onFormDismiss } =
    usePackageMappingForm(actionCallHeaders, packageType, id)

  const formFields = getPackageMappingFormFields()

  const packageLabel =
    packageType === RenewalPackageType.ACTIVE ? 'Active Renewal Package' : 'Pause Renewal Package'

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
            {id ? `Edit ${packageLabel} Mapping` : `Add ${packageLabel} Mapping`}
          </Heading>
          <Content>
            <Text>
              {id
                ? 'Update the package SKUs for this mapping.'
                : `Create a new SKU→date mapping for the ${packageLabel.toLowerCase()} group.`}
            </Text>
          </Content>
        </Flex>

        <Divider size="S" marginBottom="size-300" />

        {loading ? (
          <ProgressCircle aria-label="Loading package mapping…" isIndeterminate />
        ) : (
          <DataForm
            key={id ?? 'new'}
            components={formFields}
            editItem={editItem}
            isProcessing={isSubmitting}
            onFormSubmit={async (values: Record<string, unknown>) =>
              onFormSubmit(values as unknown as PackageMappingFormItem)
            }
            onPostFormSubmit={onPostFormSubmit}
            onBackPress={onFormDismiss}
          />
        )}
      </Well>
    </View>
  )
}
