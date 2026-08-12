/*
 * <license header>
 */

import {
  RenewalPackageType,
  type PackageMappingItem,
  type PackageMappingListResponse,
  type PackageMappingGridItem
} from '@components/Extensions/ManageRenewalPackages/types'

/**
 * Converts API response to array format suitable for DataTable
 *
 * @param {PackageMappingListResponse | null | undefined} response - API response containing mappings
 * @returns {PackageMappingGridItem[]} Array of mappings formatted for DataTable
 */
export const toPackageMappingsArray = (
  response: PackageMappingListResponse | null | undefined
): PackageMappingGridItem[] => {
  if (!response?.mappings || !Array.isArray(response.mappings)) {
    return []
  }

  return response.mappings.map(
    (item: PackageMappingItem): PackageMappingGridItem => ({
      id: item._id || `${item.mapping_type}:${item.effective_date}`,
      effective_date: item.effective_date,
      packages: formatPackages(item.packages)
    })
  )
}

/**
 * Formats the comma-separated package SKU list for display, normalizing the spacing
 *
 * @param {string} packages - Comma-separated SKU list, as stored
 * @returns {string} Comma-and-space-separated SKU list
 */
export const formatPackages = (packages: string): string => parsePackages(packages).join(', ')

/**
 * Parses the comma-separated package SKU list into the string array the `packages` field's
 * `MULTISELECT_SEARCH` expects as its `value`
 *
 * @param {string} packages - Comma-separated SKU list, as stored
 * @returns {string[]} Trimmed, non-empty SKU values
 */
export const parsePackages = (packages: string): string[] =>
  packages
    .split(',')
    .map(sku => sku.trim())
    .filter(Boolean)

/**
 * Serializes the SKU values selected in the form back into the comma-separated string the
 * `renewal-package/save` action expects
 *
 * @param {string[]} packages - Selected SKU values
 * @returns {string} Comma-separated SKU list
 */
export const serializePackages = (packages: string[]): string => packages.join(',')

/**
 * Normalizes an ISO-8601 value down to the plain `YYYY-MM-DD` form the `DATE` form field's
 * `DatePicker` requires — `@internationalized/date`'s `parseDate` rejects a full timestamp
 * (e.g. `2026-01-01T00:00:00.000Z`).
 *
 * @param {string} effectiveDate - Stored effective date, date-only or full ISO-8601 timestamp
 * @returns {string} Date-only (`YYYY-MM-DD`) string
 */
export const toDateOnly = (effectiveDate: string): string => effectiveDate.slice(0, 10)

/**
 * Builds the base route for a mapping group's screen (grid/add/edit share this prefix)
 *
 * @param {RenewalPackageType} packageType - Mapping group (active or pause)
 * @returns {string} Base route, e.g. `/active-renewal-packages`
 */
export const getRouteBase = (packageType: RenewalPackageType): string =>
  packageType === RenewalPackageType.ACTIVE ? '/active-renewal-packages' : '/pause-renewal-packages'
