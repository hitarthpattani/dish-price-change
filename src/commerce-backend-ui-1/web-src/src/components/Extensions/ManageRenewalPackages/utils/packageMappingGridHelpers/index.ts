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
 * Formats the JSON-encoded package SKU array for display (and for editing in the form)
 *
 * @param {string} packages - JSON array of package SKUs
 * @returns {string} Comma-separated SKU list, or the raw value if it isn't valid JSON
 */
export const formatPackages = (packages: string): string => {
  try {
    const parsed: unknown = JSON.parse(packages)
    return Array.isArray(parsed) ? parsed.join(', ') : packages
  } catch {
    return packages
  }
}

/**
 * Serializes a comma-separated SKU list (as entered in the form) back into the JSON array
 * string the `renewal-package/save` action expects
 *
 * @param {string} packages - Comma-separated SKU list
 * @returns {string} JSON-encoded array of trimmed, non-empty SKUs
 */
export const serializePackages = (packages: string): string =>
  JSON.stringify(
    packages
      .split(',')
      .map(sku => sku.trim())
      .filter(Boolean)
  )

/**
 * Builds the base route for a mapping group's screen (grid/add/edit share this prefix)
 *
 * @param {RenewalPackageType} packageType - Mapping group (active or pause)
 * @returns {string} Base route, e.g. `/active-renewal-packages`
 */
export const getRouteBase = (packageType: RenewalPackageType): string =>
  packageType === RenewalPackageType.ACTIVE ? '/active-renewal-packages' : '/pause-renewal-packages'
