/*
 * <license header>
 */

import React, { useCallback, useState } from 'react'
import {
  ActionButton,
  Flex,
  Form,
  Heading,
  ProgressCircle,
  View,
  Text,
  Content,
  Well,
  Divider
} from '@adobe/react-spectrum'

import SaveFloppy from '@spectrum-icons/workflow/SaveFloppy'
import Back from '@spectrum-icons/workflow/Back'

import { FileUpload, DataTable, useRouteParams } from '@adobe-commerce/aio-experience-kit'
import type { FileInfo, DataTableColumn, DataTableRow } from '@adobe-commerce/aio-experience-kit'
import type { ManageRenewalNotificationsProps } from './types'

/**
 * Renewal CSV Upload screen (plan §7.4.e) — feature `ManageRenewalNotifications`.
 *
 * A Form with a single-file CSV FileUpload plus a DataTable summarising the import result
 * (imported / skipped / errors). Data source: the `renewal-notification/csv-import` action (§7.4.a).
 */
const resultColumns: DataTableColumn[] = [
  { uid: 'uuid', name: 'UUID' },
  { uid: 'status', name: 'Status' },
  { uid: 'message', name: 'Message' }
]

export const ManageRenewalNotifications: React.FC<ManageRenewalNotificationsProps> = ({
  actionCallHeaders
}) => {
  const service = useRouteParams()
  const navigate = service.getNavigate()
  const [results, setResults] = useState<DataTableRow[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([])

  // State for tracking form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  /** Store the file selection until the form is submitted or cancelled. */
  const onSelect = async (files: FileInfo[]): Promise<void> => {
    setSelectedFiles(files)
  }

  /**
   * Handle submission of the selected renewal-notification CSV file.
   *
   * @param event - Form submission event.
   */
  const onFormSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()
      setIsSubmitting(true)

      try {
        // TODO: Implement per migration plan §7.4.e "Renewal CSV Upload" (+ §7.4.a "csv-import")
        //   - POST the selected CSV to the `renewal-notification/csv-import` action (base64 content from
        //     FileInfo), forwarding `actionCallHeaders` (Authorization / IMS org).
        //   - Map { imported, skipped, errors[] } into result-summary rows.
        void actionCallHeaders
        void selectedFiles
        setResults([])
      } finally {
        setIsSubmitting(false)
      }
    },
    [actionCallHeaders, selectedFiles]
  )

  /** Navigate back to the dashboard without submitting the form. */
  const onCancel = useCallback((): void => {
    navigate('/')
  }, [navigate])

  return (
    <View
      margin={'size-0'}
      paddingEnd={'size-100'}
      paddingTop={'size-50'}
      paddingBottom={'size-50'}
    >
      <Well>
        <Form
          isRequired
          isDisabled={isSubmitting}
          validationBehavior="native"
          onSubmit={onFormSubmit}
        >
          {/* Header Section */}
          <Flex direction="column" gap="size-100" marginTop="size-100" marginBottom="size-300">
            <Heading level={3} marginTop={0} marginBottom="size-50">
              Upload Renewal Notifications
            </Heading>
            <Content>
              <Text>
                Upload a CSV file containing subscription renewals. The file must include columns
                for the subscription UUID and renewal date.
              </Text>
            </Content>
          </Flex>
          <Divider size="S" marginBottom="size-300" />
          {/* File Upload Section */}
          <Flex direction="column" gap="size-100" marginBottom="size-300">
            <FileUpload
              acceptedFileTypes={['text/csv']}
              allowsMultiple={false}
              label={'Renewals CSV File'}
              isRequired={true}
              isDisabled={isSubmitting}
              onSelect={onSelect}
            />
            <Text UNSAFE_style={{ fontSize: '13px', color: '#6E6E6E', marginTop: '4px' }}>
              Select a CSV file to upload. This will add more renewal details.
            </Text>
          </Flex>
          <Divider size="S" marginBottom="size-250" />
          {/* Action buttons section with loading indicator */}
          <Flex width="100%" alignItems="center" gap="size-100">
            {/* Show progress circle during submission */}
            {isSubmitting && (
              <ProgressCircle
                size="M"
                aria-label={'Uploading renewal notifications...'}
                isIndeterminate
              />
            )}

            {/* Upload button */}
            <ActionButton type="submit" isDisabled={isSubmitting} staticColor="black">
              <SaveFloppy size={'M'} />
              <Text>{'Upload Renewals'}</Text>
            </ActionButton>

            {/* Back/Cancel button */}
            <ActionButton
              type="button"
              staticColor="black"
              isDisabled={isSubmitting}
              onPress={onCancel}
            >
              <Back size={'M'} />
              <Text>{'Cancel'}</Text>
            </ActionButton>
          </Flex>
        </Form>
      </Well>
      <Well>
        {/* Header Section */}
        <Flex direction="column" gap="size-100" marginTop="size-100">
          <Heading level={3} marginTop={0} marginBottom="size-50">
            Manage Renewal Notifications
          </Heading>
          <Content>
            <Text>
              This section allows you to manage renewal notifications by uploading a CSV file
              containing subscription renewals. The file must include columns for the subscription
              UUID and renewal date. After uploading, you can view the results in the table below.
            </Text>
          </Content>
        </Flex>
        <DataTable columns={resultColumns} data={results} />
      </Well>
    </View>
  )
}
