/*
 * <license header>
 */

import { GridActionProps } from '@adobe-commerce/aio-experience-kit'

/**
 * Cache Grid Constants
 *
 * Contains all constant values used in the Cache Grid component,
 * including messages, UI text, columns, and actions.
 *
 * @module cacheGridConstants
 */

/**
 * Toast notification messages
 */
export const CACHE_GRID_MESSAGES = {
  /** Success message for deleting cache */
  DELETE_SUCCESS: 'Cache deleted successfully',
  /** Success message for flushing all caches */
  FLUSH_SUCCESS: 'All caches flushed successfully',
  /** Error message for delete failure */
  DELETE_ERROR: 'Failed to delete cache',
  /** Error message for load failure */
  LOAD_ERROR: 'Failed to load cache entries',
  /** Toast timeout duration in milliseconds */
  TOAST_TIMEOUT: 5000
} as const

/**
 * Confirmation dialog configuration
 */
export const CACHE_GRID_DIALOG = {
  /** Title for delete confirmation dialog */
  DELETE_TITLE: 'Confirm Deletion',
  /** Message for delete confirmation */
  DELETE_MESSAGE: 'Are you sure you want to delete this cache entry? This action cannot be undone.',
  /** Title for flush all caches confirmation dialog */
  FLUSH_TITLE: 'Confirm Flush All Caches',
  /** Message for flush all caches confirmation */
  FLUSH_MESSAGE:
    'Are you sure you want to delete ALL cache entries? This will clear all cached data and cannot be undone.',
  /** Primary button text for delete */
  PRIMARY_BUTTON_TEXT: 'Delete',
  /** Secondary button text for cancel */
  SECONDARY_BUTTON_TEXT: 'Cancel',
  /** Primary button variant */
  PRIMARY_BUTTON_VARIANT: 'negative'
} as const

/**
 * Grid text content
 */
export const CACHE_GRID_TEXT = {
  /** Main heading for the grid */
  HEADING: 'Manage Caches',
  /** Description text */
  DESCRIPTION:
    'View and manage cache entries stored in Adobe I/O Runtime State. You can view cache details including keys, values, and expiration times, or delete cache entries that are no longer needed.'
} as const

/**
 * Grid action keys
 */
export const CACHE_GRID_ACTIONS = {
  /** View action key */
  VIEW: 'view',
  /** Delete action key */
  DELETE: 'delete'
} as const

/**
 * Column definitions for the cache data table
 */
export const CACHE_GRID_COLUMNS = [
  { name: 'Cache', uid: 'id' },
  { name: 'Expiration', uid: 'expiration' },
  { name: 'Actions', uid: 'actions' }
]

/**
 * Grid action definitions for the cache data table
 */
export const CACHE_GRID_ACTION_PROPS: GridActionProps[] = [
  { key: 'view', text: 'View Details' },
  { key: 'delete', text: 'Delete' }
]
