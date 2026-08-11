/*
 * <license header>
 */

import { GridActionProps } from '@adobe-commerce/aio-experience-kit'

/**
 * Package Mapping Grid Constants
 *
 * Contains all constant values used in the renewal package mapping screen,
 * including messages, columns, and actions.
 *
 * @module packageMappingGridConstants
 */

/**
 * Toast notification messages
 */
export const PACKAGE_MAPPING_MESSAGES = {
  /** Error message for load failure */
  LOAD_ERROR: 'Failed to load renewal package mappings',
  /** Error message for a single mapping load failure (edit form) */
  GET_ERROR: 'Failed to load the renewal package mapping',
  /** Success message for saving a mapping */
  SAVE_SUCCESS: 'Renewal package mapping saved successfully',
  /** Error message for save failure */
  SAVE_ERROR: 'Failed to save renewal package mapping',
  /** Success message for deleting a mapping */
  DELETE_SUCCESS: 'Renewal package mapping deleted successfully',
  /** Error message for delete failure */
  DELETE_ERROR: 'Failed to delete renewal package mapping',
  /** Toast timeout duration in milliseconds */
  TOAST_TIMEOUT: 5000
} as const

/**
 * Confirmation dialog configuration
 */
export const PACKAGE_MAPPING_DIALOG = {
  /** Title for delete confirmation dialog */
  DELETE_TITLE: 'Confirm Deletion',
  /** Message for delete confirmation */
  DELETE_MESSAGE:
    'Are you sure you want to delete this renewal package mapping? This action cannot be undone.',
  /** Primary button text for delete */
  PRIMARY_BUTTON_TEXT: 'Delete',
  /** Secondary button text for cancel */
  SECONDARY_BUTTON_TEXT: 'Cancel',
  /** Primary button variant */
  PRIMARY_BUTTON_VARIANT: 'negative'
} as const

/**
 * Grid action keys
 */
export const PACKAGE_MAPPING_GRID_ACTIONS = {
  /** Edit action key */
  EDIT: 'edit',
  /** Delete action key */
  DELETE: 'delete'
} as const

/**
 * Column definitions for the package mapping data table
 */
export const PACKAGE_MAPPING_GRID_COLUMNS = [
  { name: 'Package SKUs', uid: 'packages' },
  { name: 'Effective Date', uid: 'effective_date' }
]

/**
 * Grid action definitions for the package mapping data table
 */
export const PACKAGE_MAPPING_GRID_ACTION_PROPS: GridActionProps[] = [
  { key: 'edit', text: 'Edit' },
  { key: 'delete', text: 'Delete' }
]
