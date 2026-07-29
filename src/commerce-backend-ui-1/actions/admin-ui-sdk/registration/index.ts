/*
 * <license header>
 */

import { EXTENSION_ID, APP_SLUG, APP_NAME } from '@actions/constants'
import { RuntimeAction, HttpMethod, RuntimeActionResponse } from '@adobe-commerce/aio-toolkit'

/**
 * Admin UI SDK registration action (plan §5.6).
 *
 * Returns the fixed 2-level menu: a top-level section plus a single "Application" entry that
 * renders the SPA. All internal navigation (CSV upload, Active/Pause mapping grids) happens
 * inside the SPA via NavigationProvider routes — never as additional menuItems.
 */
export const main = RuntimeAction.execute(
  'admin-ui-sdk-registration-action',
  [HttpMethod.POST],
  [],
  [],
  async () => {
    return RuntimeActionResponse.success({
      registration: {
        menuItems: [
          {
            id: `${EXTENSION_ID}::${APP_SLUG}`,
            title: APP_NAME,
            isSection: true
          },
          {
            id: `${EXTENSION_ID}::${APP_SLUG}::app`,
            title: 'Application',
            parent: `${EXTENSION_ID}::${APP_SLUG}`,
            sandbox: 'allow-downloads allow-modals allow-popups'
          }
        ],
        page: {
          title: APP_NAME
        }
        // Non-menu extension points (grid columns, mass actions, view buttons, banners, custom fees):
        // none — this module's admin UI is entirely SPA-internal screens (§5.6). Per-flow builds
        // (§N.4.e / template 09) would add them here if a future flow contributes any.
      }
    })
  }
)
