/*
 * <license header>
 */

import React from 'react'
import { ActionButton, Flex, Form, ProgressCircle, Text, Divider } from '@adobe/react-spectrum'

import SaveFloppy from '@spectrum-icons/workflow/SaveFloppy'
import Back from '@spectrum-icons/workflow/Back'

import { FileUpload } from '@adobe-commerce/aio-experience-kit'

import { useNotificationUploadForm } from '@components/Extensions/ManageRenewalNotifications/hooks/useNotificationUploadForm'
import { NOTIFICATION_UPLOAD_TEXT } from '@components/Extensions/ManageRenewalNotifications/utils/notificationGridConstants'

/**
 * Renewal Notifications Upload Form Component
 *
 * A presentational component for uploading renewal notifications via CSV file.
 * All business logic is delegated to the useNotificationUploadForm custom hook. The
 * heading/description are owned by the parent screen, matching the
 * Configurations/ConfigurationsForm split.
 */
export const UploadForm: React.FC<{
  actionCallHeaders: Record<string, string>
  onUploadSuccess?: () => void
}> = ({ actionCallHeaders, onUploadSuccess }) => {
  const { isSubmitting, fileUploadRef, onFormSubmit, onFileSelect, onCancel } =
    useNotificationUploadForm(actionCallHeaders, onUploadSuccess)

  return (
    <Form isRequired isDisabled={isSubmitting} validationBehavior="native" onSubmit={onFormSubmit}>
      <Flex direction="column" gap="size-100" marginBottom="size-300">
        <FileUpload
          acceptedFileTypes={['text/csv']}
          ref={fileUploadRef}
          allowsMultiple={false}
          label={'Renewals CSV File'}
          isRequired={true}
          isDisabled={isSubmitting}
          onSelect={onFileSelect}
        />
        <Text UNSAFE_style={{ fontSize: '13px', color: '#6E6E6E', marginTop: '4px' }}>
          {NOTIFICATION_UPLOAD_TEXT.HELP_TEXT}
        </Text>
      </Flex>

      <Divider size="S" marginBottom="size-250" />

      <Flex width="100%" alignItems="center" gap="size-100">
        {isSubmitting && (
          <ProgressCircle
            size="M"
            aria-label={NOTIFICATION_UPLOAD_TEXT.LOADING_LABEL}
            isIndeterminate
          />
        )}

        <ActionButton type="submit" isDisabled={isSubmitting} staticColor="black">
          <SaveFloppy size={'M'} />
          <Text>{NOTIFICATION_UPLOAD_TEXT.UPLOAD_BUTTON}</Text>
        </ActionButton>

        <ActionButton
          type="button"
          staticColor="black"
          isDisabled={isSubmitting}
          onPress={onCancel}
        >
          <Back size={'M'} />
          <Text>{NOTIFICATION_UPLOAD_TEXT.CANCEL_BUTTON}</Text>
        </ActionButton>
      </Flex>
    </Form>
  )
}
