/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/NavigationProvider/types'

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
