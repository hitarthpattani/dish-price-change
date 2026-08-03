/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/NavigationProvider/types'

/** Properties required by the renewal-notification management screen. */
export interface ManageRenewalNotificationsProps {
  /** Authentication and organization headers forwarded to backend actions. */
  actionCallHeaders: ActionCallHeaders
}
