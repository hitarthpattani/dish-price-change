/*
 * <license header>
 */

// Adobe Experience Cloud Integration Types

/**
 * Identity Management Service (IMS) properties
 * Used across the application for authentication and authorization
 */
export interface IMSProps {
  /** Authentication token for Adobe services */
  token?: string
  /** Organization ID for Adobe services */
  org?: string
}

/**
 * Adobe I/O Runtime properties
 * Handles runtime events and configuration changes
 */
export interface RuntimeProps {
  /** Event handler for runtime events (configuration, history, etc.) */
  on: (event: string, callback: (data: unknown) => void) => void
}

/**
 * Configuration data received from runtime events
 * Typically received when user switches organization or locale
 */
export interface ConfigurationData {
  /** IMS Organization ID */
  imsOrg: string
  /** IMS Authentication token */
  imsToken: string
  /** Current locale/language setting */
  locale: string
}

/**
 * History data received from runtime navigation events
 * Tracks navigation changes within the Adobe Experience Cloud shell
 */
export interface HistoryData {
  /** Type of navigation change */
  type: string
  /** New path/route */
  path: string
}

/**
 * Common props for components that integrate with Adobe services
 * Combines IMS and Runtime properties for full Adobe integration
 */
export interface AdobeIntegrationProps {
  /** Runtime event system */
  runtime: RuntimeProps
  /** Identity Management Service */
  ims: IMSProps
}
