/*
 * <license header>
 */

import React from 'react'
import { useRouteParams } from '@adobe-commerce/aio-experience-kit'
import { ManageRenewalPackagesProps } from './types'
import { PackageMappingGrid } from './components/PackageMappingGrid'
import { PackageMappingForm } from './components/PackageMappingForm'

/**
 * Active/Pause Renewal Package Mappings screen (plan §8.4.e) — feature `ManageRenewalPackages`.
 *
 * Switches between a grid listing the SKU→date package mappings for the given `packageType`
 * (`renewal-package/list?type=active|pause`) and an add/edit form (`renewal-package/load`/`save`),
 * based on the `:component`/`:id` route segments — mirroring the
 * `/active-renewal-packages(/:component(/:id))` style routing already used for other screens.
 *
 * `ManageRenewalPackages` itself is the same component instance for both the Active and Pause
 * routes (React Router updates its `packageType` prop in place rather than unmounting it when
 * navigating between them), so the grid/form below are keyed on `packageType` to force a remount
 * — otherwise `DataTable`'s load-once-on-mount effect and `PackageMappingGrid`'s hook state would
 * keep showing the previous package type's data after switching.
 */
export const ManageRenewalPackages: React.FC<ManageRenewalPackagesProps> = ({
  actionCallHeaders,
  packageType
}) => {
  const { getParam } = useRouteParams()
  const component = getParam('component')
  const id = getParam('id')

  return component === 'form' ? (
    <PackageMappingForm
      key={packageType}
      actionCallHeaders={actionCallHeaders}
      packageType={packageType}
      id={id}
    />
  ) : (
    <PackageMappingGrid
      key={packageType}
      actionCallHeaders={actionCallHeaders}
      packageType={packageType}
    />
  )
}
