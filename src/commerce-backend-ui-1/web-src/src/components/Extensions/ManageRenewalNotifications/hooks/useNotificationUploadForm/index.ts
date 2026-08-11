/*
 * <license header>
 */

import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouteParams } from '@adobe-commerce/aio-experience-kit'
import type { FileInfo, FileUploadHandle } from '@adobe-commerce/aio-experience-kit'
import { createNotificationService } from '@components/Extensions/ManageRenewalNotifications/utils/notificationService'
import { NOTIFICATION_MESSAGES } from '@components/Extensions/ManageRenewalNotifications/utils/notificationGridConstants'
import { useNotificationGridNotifications } from '@components/Extensions/ManageRenewalNotifications/hooks/useNotificationGridNotifications'

/**
 * Custom hook for managing the renewal notifications CSV upload form
 *
 * Encapsulates file selection, submission, and result reporting for the
 * `renewal-notification/upload` action.
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @param {Function} [onUploadSuccess] - Optional callback executed after a successful upload
 * @returns {Object} Form state and handlers
 */
export const useNotificationUploadForm = (
  actionCallHeaders: Record<string, string>,
  onUploadSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([])
  const fileUploadRef = useRef<FileUploadHandle>(null)

  const notificationService = useMemo(
    () => createNotificationService(actionCallHeaders),
    [actionCallHeaders]
  )

  const { showUploadSuccess, showUploadError, showValidationError } =
    useNotificationGridNotifications()

  const service = useRouteParams()
  const navigate = service.getNavigate()

  /** Store the file selection until the form is submitted */
  const onFileSelect = useCallback((files: FileInfo[]) => {
    setSelectedFiles(files)
  }, [])

  /**
   * Handles submission of the selected renewal-notification CSV file
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   */
  const onFormSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()

      if (selectedFiles.length === 0) {
        showValidationError()
        return
      }

      setIsSubmitting(true)

      try {
        const content = selectedFiles[0]?.content || ''
        const response = await notificationService.uploadNotifications(content)

        const message = `Imported ${response.imported} notification(s), skipped ${response.skipped}.`
        showUploadSuccess(message)

        setSelectedFiles([])
        fileUploadRef.current?.reset()
        onUploadSuccess?.()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : NOTIFICATION_MESSAGES.UPLOAD_ERROR
        showUploadError(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      selectedFiles,
      notificationService,
      showUploadSuccess,
      showUploadError,
      showValidationError,
      onUploadSuccess
    ]
  )

  /** Navigate back to the dashboard without submitting the form */
  const onCancel = useCallback((): void => {
    navigate('/')
  }, [navigate])

  return {
    isSubmitting,
    selectedFiles,
    fileUploadRef,
    onFormSubmit,
    onFileSelect,
    onCancel
  }
}
