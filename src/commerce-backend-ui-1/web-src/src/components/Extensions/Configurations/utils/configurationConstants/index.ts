/*
 * <license header>
 */

/**
 * Configuration Constants
 *
 * Contains all constant values used in the Configurations screen,
 * including messages, UI text, and scope picker defaults.
 *
 * @module configurationConstants
 */

/**
 * Screen text content
 */
export const CONFIGURATION_TEXT = {
  /** Main heading for the screen */
  HEADING: 'Configurations',
  /** Description text */
  DESCRIPTION: 'Manage the configuration settings for the Subscription Price Manager.',
  /** Label for the scope picker */
  SCOPE_LABEL: 'Scope',
  /** Section title for the "Default Config" scope */
  DEFAULT_SECTION_TITLE: 'Default',
  /** Fallback label for the "Default Config" scope */
  DEFAULT_SCOPE_LABEL: 'Default Config'
} as const

/**
 * Toast notification messages
 */
export const CONFIGURATION_MESSAGES = {
  /** Error message for load failure */
  LOAD_ERROR: 'Failed to load configuration scopes',
  /** Success message for configuration form save */
  FORM_SAVE_SUCCESS: 'Configuration settings saved successfully',
  /** Error message for configuration form save failure */
  FORM_SAVE_ERROR: 'Failed to save configuration settings',
  /** Toast timeout duration in milliseconds */
  TOAST_TIMEOUT: 5000
} as const

/** Picker key for the "Default Config" scope, matching `default:0` returned by the backend. */
export const DEFAULT_SCOPE_KEY = 'default:0'
