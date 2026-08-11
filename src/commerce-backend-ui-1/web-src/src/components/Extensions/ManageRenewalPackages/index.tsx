/*
 * <license header>
 */

import React from 'react'
import { Content, Flex, Heading, View, Well, Text } from '@adobe/react-spectrum'
import { ManageRenewalPackagesProps, RenewalPackageType } from './types'
import { DataTable, DataTableColumn } from '@adobe-commerce/aio-experience-kit'

/**
 * Renewal CSV Upload screen (plan §7.4.e) — feature `ManageRenewalNotifications`.
 *
 * A Form with a single-file CSV FileUpload plus a DataTable summarising the import result
 * (imported / skipped / errors). Data source: the `renewal-notification/upload` action (§7.4.a).
 */
const resultColumns: DataTableColumn[] = [
  { uid: 'uuid', name: 'UUID' },
  { uid: 'status', name: 'Status' },
  { uid: 'message', name: 'Message' }
]

/** Screen for managing renewal package mappings. */
export const ManageRenewalPackages: React.FC<ManageRenewalPackagesProps> = ({
  actionCallHeaders,
  packageType
}) => {
  void actionCallHeaders
  void packageType

  return (
    <View
      margin={'size-0'}
      paddingEnd={'size-100'}
      paddingTop={'size-50'}
      paddingBottom={'size-50'}
    >
      <Well>
        {/* Header Section */}
        <Flex direction="column" gap="size-100" marginTop="size-100">
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
        <DataTable columns={resultColumns} data={[]} />
      </Well>
    </View>
  )
}
