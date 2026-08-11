/*
 * <license header>
 */

import React, { useCallback, useState } from 'react'
import { Content, Divider, Flex, Heading, Text, View, Well } from '@adobe/react-spectrum'
import { DataTable } from '@adobe-commerce/aio-experience-kit'

import { UploadForm } from './components/UploadForm'
import { useNotificationGrid } from './hooks/useNotificationGrid'
import {
  NOTIFICATION_UPLOAD_TEXT,
  NOTIFICATION_GRID_TEXT,
  NOTIFICATION_GRID_COLUMNS
} from './utils/notificationGridConstants'
import type { ManageRenewalNotificationsProps } from './types'

/**
 * Renewal Notifications screen (plan §7.4.e) — feature `ManageRenewalNotifications`.
 *
 * Combines the CSV upload form (`renewal-notification/upload`, §7.4.a) with a DataTable
 * listing queued notifications (`renewal-notification/list`). Uploading a file triggers a
 * grid reload via `resetTrigger`. The heading/description live here (not in `UploadForm`),
 * matching the Configurations/ConfigurationsForm split.
 */
export const ManageRenewalNotifications: React.FC<ManageRenewalNotificationsProps> = ({
  actionCallHeaders
}) => {
  const [resetTrigger, setResetTrigger] = useState(0)
  const { isProcessing, gridData, handleGridLoad } = useNotificationGrid(
    actionCallHeaders,
    resetTrigger
  )

  /** Bumps `resetTrigger` so the grid reloads after a successful upload */
  const handleUploadSuccess = useCallback(() => {
    setResetTrigger(prev => prev + 1)
  }, [])

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
            {NOTIFICATION_UPLOAD_TEXT.HEADING}
          </Heading>
          <Content>
            <Text>{NOTIFICATION_UPLOAD_TEXT.DESCRIPTION}</Text>
          </Content>
        </Flex>

        <Divider size="S" marginBottom="size-300" />

        <UploadForm actionCallHeaders={actionCallHeaders} onUploadSuccess={handleUploadSuccess} />
      </Well>

      <Well marginTop="size-100">
        <Flex direction="column" gap="size-100" marginBottom="size-250">
          <Heading level={3} marginTop={0} marginBottom="size-50">
            {NOTIFICATION_GRID_TEXT.HEADING}
          </Heading>
          <Content>
            <Text>{NOTIFICATION_GRID_TEXT.DESCRIPTION}</Text>
          </Content>
        </Flex>

        <Divider size="S" marginBottom="size-250" />

        <DataTable
          columns={NOTIFICATION_GRID_COLUMNS}
          data={gridData}
          isProcessing={isProcessing}
          onGridLoad={handleGridLoad}
          maxHeight={'size-6000'}
        />
      </Well>
    </View>
  )
}
