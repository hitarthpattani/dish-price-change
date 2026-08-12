/*
 * <license header>
 */

import allActions from '@web/config.json'
import actionWebInvoke from '@web/utils'
import type {
  PackageMappingListResponse,
  PackageMappingGetResponse,
  PackageMappingSaveResponse,
  RenewalPackageType
} from '@components/Extensions/ManageRenewalPackages/types'

const actions = allActions as Record<string, string>

/**
 * Package Mapping Service
 *
 * Service layer for interacting with the `renewal-package` backend actions.
 * Provides methods for listing, loading, saving, and deleting Active/Pause
 * SKU→date package mappings.
 */

/**
 * Creates a package mapping service instance with authentication headers
 *
 * @param {Record<string, string>} actionCallHeaders - Authentication headers for API calls
 * @returns {Object} Service object with package mapping methods
 */
export const createPackageMappingService = (actionCallHeaders: Record<string, string>) => {
  /**
   * Lists package mappings for a given mapping group
   *
   * @param {RenewalPackageType} type - Mapping group to retrieve (active or pause)
   * @returns {Promise<PackageMappingListResponse>} Response containing mapping records
   */
  const listMappings = async (type: RenewalPackageType): Promise<PackageMappingListResponse> => {
    try {
      const response = await actionWebInvoke(
        actions['renewal-package/list'],
        actionCallHeaders,
        { type },
        { method: 'GET' }
      )
      return response as PackageMappingListResponse
    } catch (error) {
      console.error('Error listing renewal package mappings:', error)
      throw error
    }
  }

  /**
   * Loads a single package mapping by its ABDB record id
   *
   * @param {string} id - Record id to load
   * @returns {Promise<PackageMappingGetResponse>} Response containing the mapping record
   */
  const getMapping = async (id: string): Promise<PackageMappingGetResponse> => {
    try {
      const response = await actionWebInvoke(
        actions['renewal-package/get'],
        actionCallHeaders,
        { id },
        { method: 'GET' }
      )
      return response as PackageMappingGetResponse
    } catch (error) {
      console.error('Error loading renewal package mapping:', error)
      throw error
    }
  }

  /**
   * Creates or replaces a package mapping (upsert by mapping_type + effective_date)
   *
   * @param {Object} payload - Mapping fields to save
   * @param {RenewalPackageType} payload.mapping_type - Mapping group (active or pause)
   * @param {string} payload.effective_date - ISO-8601 effective date
   * @param {string} payload.packages - Comma-separated list of package SKUs
   * @returns {Promise<PackageMappingSaveResponse>} Response containing the saved mapping record
   */
  const saveMapping = async (payload: {
    mapping_type: RenewalPackageType
    effective_date: string
    packages: string
  }): Promise<PackageMappingSaveResponse> => {
    try {
      const response = await actionWebInvoke(
        actions['renewal-package/save'],
        actionCallHeaders,
        payload
      )
      return response as PackageMappingSaveResponse
    } catch (error) {
      console.error('Error saving renewal package mapping:', error)
      throw error
    }
  }

  /**
   * Deletes package mappings by their ABDB record ids
   *
   * @param {string[]} ids - Record ids to delete
   */
  const deleteMappings = async (ids: string[]): Promise<void> => {
    try {
      await actionWebInvoke(actions['renewal-package/delete'], actionCallHeaders, { ids })
    } catch (error) {
      console.error('Error deleting renewal package mappings:', error)
      throw error
    }
  }

  return {
    listMappings,
    getMapping,
    saveMapping,
    deleteMappings
  }
}
