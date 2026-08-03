/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/NavigationProvider/types'

/** Properties required by the configuration screen. */
export interface ConfigurationsProps {
  /** Authentication and organization headers forwarded to backend actions. */
  actionCallHeaders: ActionCallHeaders
}
