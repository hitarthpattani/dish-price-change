/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/MainPage/utils/NavigationProvider/types'

/** Renewal package groups supported by the management screen. */
export enum RenewalPackageType {
  ACTIVE = 'active',
  PAUSE = 'pause'
}

/** Properties required by the renewal-package management screen. */
export interface ManageRenewalPackagesProps {
  /** Authentication and organization headers forwarded to backend actions. */
  actionCallHeaders: ActionCallHeaders

  /** Package group displayed and managed by this component instance. */
  packageType: RenewalPackageType
}

/** A single `renewal_package_mapping` record as returned by the `list` action. */
export interface PackageMappingItem {
  _id?: string
  mapping_type: RenewalPackageType
  effective_date: string
  packages: string
  [key: string]: unknown
}

/** Response shape returned by the `renewal-package/list` action. */
export interface PackageMappingListResponse {
  mappings: PackageMappingItem[]
  count: number
}

/** Grid-formatted package mapping for DataTable display. */
export interface PackageMappingGridItem {
  id: string
  effective_date: string
  packages: string
}

/** Response shape returned by the `renewal-package/get` action. */
export interface PackageMappingGetResponse {
  mapping: PackageMappingItem
}

/** Response shape returned by the `renewal-package/save` action. */
export interface PackageMappingSaveResponse {
  mapping: PackageMappingItem
}

/** Values edited by the `DataForm` on the add/edit screen; `packages` is the selected SKU values. */
export interface PackageMappingFormItem {
  effective_date: string
  packages: string[]
}
