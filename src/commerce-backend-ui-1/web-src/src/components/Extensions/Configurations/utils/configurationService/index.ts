/*
 * <license header>
 */

import allActions from '@web/config.json'
import actionWebInvoke from '@web/utils'
import type { ConfigurationLoadResponse, ConfigurationSaveResponse } from '../../types'

const actions = allActions as Record<string, string>

/**
 * Configuration Service
 *
 * Service layer for interacting with the configuration backend actions.
 * Provides methods for loading the stored configuration (with the effective
 * scope and scope tree) and for saving updated configuration values, both
 * scoped to a given `scope`/`scopeId`.
 */

/**
 * Creates a configuration service instance with authentication headers
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @returns {Object} Service object with configuration methods
 */
export const createConfigurationService = (actionCallHeaders: Record<string, string>) => {
  /**
   * Loads the stored configuration for a scope, along with the effective
   * scope/scopeId and the full Commerce scope tree.
   *
   * @param {string} [scope] - Configuration scope (e.g. `default`, `website`, `store`)
   * @param {number} [scopeId] - Identifier of the scope entity
   * @returns {Promise<ConfigurationLoadResponse>} Response containing configuration and scope tree
   */
  const loadConfiguration = async (
    scope?: string,
    scopeId?: number
  ): Promise<ConfigurationLoadResponse> => {
    try {
      const params: Record<string, string> = {}
      if (scope !== undefined) {
        params.scope = scope
      }
      if (scopeId !== undefined) {
        params.scope_id = String(scopeId)
      }

      const response = await actionWebInvoke(
        actions['configuration/load'],
        actionCallHeaders,
        params,
        { method: 'GET' }
      )
      return response as ConfigurationLoadResponse
    } catch (error) {
      console.error('Error loading configuration:', error)
      throw error
    }
  }

  /**
   * Saves configuration values for a scope
   *
   * @param {string} scope - Configuration scope (e.g. `default`, `website`, `store`)
   * @param {number} scopeId - Identifier of the scope entity
   * @param {Record<string, string>} configuration - Key-value pairs to save
   * @returns {Promise<ConfigurationSaveResponse>} Response containing the saved configuration
   */
  const saveConfiguration = async (
    scope: string,
    scopeId: number,
    configuration: Record<string, string>
  ): Promise<ConfigurationSaveResponse> => {
    try {
      const response = await actionWebInvoke(
        actions['configuration/save'],
        actionCallHeaders,
        { configuration, scope, scope_id: String(scopeId) },
        { method: 'POST' }
      )
      return response as ConfigurationSaveResponse
    } catch (error) {
      console.error('Error saving configuration:', error)
      throw error
    }
  }

  return {
    loadConfiguration,
    saveConfiguration
  }
}
