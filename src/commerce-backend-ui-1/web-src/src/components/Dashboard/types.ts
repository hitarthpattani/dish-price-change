/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/NavigationProvider/types'

/** Properties required by the application dashboard. */
export interface DashboardProps {
  /** Authentication and organization headers available to dashboard requests. */
  actionCallHeaders: ActionCallHeaders
}
