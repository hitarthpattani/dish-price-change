/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/NavigationProvider/types'

/** Properties required by the cache-management screen. */
export interface ManageCachesProps {
  /** Authentication and organization headers forwarded to backend actions. */
  actionCallHeaders: ActionCallHeaders
}
