/*
 * <license header>
 */

import { GridActionProps, MassActionProps } from '@adobe-commerce/aio-experience-kit'

/**
 * Notification Grid Constants
 *
 * Contains all constant values used in the renewal notifications screen,
 * including messages, UI text, columns, and actions.
 *
 * @module notificationGridConstants
 */

/**
 * Toast notification messages
 */
export const NOTIFICATION_MESSAGES = {
  /** Error message for load failure */
  LOAD_ERROR: 'Failed to load renewal notifications',
  /** Error message shown when no file was selected before submitting */
  NO_FILE_SELECTED: 'Please select a CSV file to upload',
  /** Fallback error message for upload failures */
  UPLOAD_ERROR: 'Failed to upload renewal notifications',
  /** Success message for deleting notifications */
  DELETE_SUCCESS: 'Renewal notification(s) deleted successfully',
  /** Error message for delete failure */
  DELETE_ERROR: 'Failed to delete renewal notification(s)',
  /** Toast timeout duration in milliseconds */
  TOAST_TIMEOUT: 5000
} as const

/**
 * Upload form text content
 */
export const NOTIFICATION_UPLOAD_TEXT = {
  HEADING: 'Upload Renewal Notifications',
  DESCRIPTION:
    'Upload a CSV file containing subscription renewals. The file must include columns for the subscription UUID and renewal date.',
  HELP_TEXT: 'Select a CSV file to upload. This will queue more renewal notifications.',
  LOADING_LABEL: 'Uploading renewal notifications...',
  UPLOAD_BUTTON: 'Upload Renewals',
  CANCEL_BUTTON: 'Cancel'
} as const

/**
 * Grid text content
 */
export const NOTIFICATION_GRID_TEXT = {
  HEADING: 'Manage Renewal Notifications',
  DESCRIPTION:
    'View renewal notifications queued for price-change processing. Upload a CSV file above to queue more.'
} as const

/**
 * Confirmation dialog configuration
 */
export const NOTIFICATION_GRID_DIALOG = {
  /** Title for delete confirmation dialog */
  DELETE_TITLE: 'Confirm Deletion',
  /** Message for delete confirmation */
  DELETE_MESSAGE:
    'Are you sure you want to delete the selected renewal notification(s)? This action cannot be undone.',
  /** Primary button text for delete */
  PRIMARY_BUTTON_TEXT: 'Delete',
  /** Secondary button text for cancel */
  SECONDARY_BUTTON_TEXT: 'Cancel',
  /** Primary button variant */
  PRIMARY_BUTTON_VARIANT: 'negative'
} as const

/**
 * Lifecycle status labels, keyed by the numeric `PrerenewalNotificationStatus` value.
 */
export const NOTIFICATION_STATUS_LABELS: Record<number, string> = {
  0: 'New',
  1: 'Complete',
  2: 'Retry'
}

/**
 * Grid action keys
 */
export const NOTIFICATION_GRID_ACTIONS = {
  /** Delete action key */
  DELETE: 'delete'
} as const

/**
 * Column definitions for the renewal notifications data table
 */
export const NOTIFICATION_GRID_COLUMNS = [
  { name: 'UUID', uid: 'uuid' },
  { name: 'Renewal Date', uid: 'renewal_date' },
  { name: 'Event Type', uid: 'event_type' },
  { name: 'Status', uid: 'status' },
  { name: 'Actions', uid: 'actions' }
]

/**
 * Grid action definitions for the renewal notifications data table
 */
export const NOTIFICATION_GRID_ACTION_PROPS: GridActionProps[] = [{ key: 'delete', text: 'Delete' }]

/**
 * Mass action definitions for the renewal notifications data table
 */
export const NOTIFICATION_GRID_MASS_ACTIONS: MassActionProps[] = [{ key: 'delete', text: 'Delete' }]
