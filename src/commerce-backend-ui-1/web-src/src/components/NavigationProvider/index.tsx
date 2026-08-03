/*
 * <license header>
 */

import React, { createContext, useContext } from 'react'
import HomeIcon from '@spectrum-icons/workflow/Home'
import UploadToCloudIcon from '@spectrum-icons/workflow/UploadToCloud'
import CalendarIcon from '@spectrum-icons/workflow/Calendar'
import PauseCircleIcon from '@spectrum-icons/workflow/PauseCircle'
import { ActionCallHeaders, NavigationButton, NavigationRoute } from './types'
import { ManageRenewalNotifications } from '@components/ManageRenewalNotifications'
import { Dashboard } from '@components/Dashboard'
import { ActiveMapping } from '@components/PriceChangeConfig/components/ActiveMapping'
import { PauseMapping } from '@components/PriceChangeConfig/components/PauseMapping'

// Navigation registry (plan §5.6). Foundation seeds a default Home entry so the SPA shell renders;
// per-flow builds (§N.4.e / template 08) append their button + route entries to the arrays below:
//   Flow 2 §7.4.e — CSV Upload      → '/renewal-import'
//   Flow 3 §8.4.e — Active Mapping  → '/active-mapping'
//   Flow 3 §8.4.e — Pause Mapping   → '/pause-mapping'

/** Build the navigation buttons available in the application shell. */
export const getNavigationButtons = (_actionCallHeaders: ActionCallHeaders): NavigationButton[] => [
  {
    label: 'Dashboard',
    path: '/',
    icon: <HomeIcon size={'S'} marginEnd={'size-100'} />
  },
  // Flow 2 §7.4.e — CSV Import
  {
    label: 'Manage Renewal Notifications',
    path: '/manage-renewal-notifications',
    icon: <UploadToCloudIcon size={'S'} marginEnd={'size-100'} />
  },
  // Flow 3 §8.4.e — Active / Pause package mappings
  {
    label: 'Active Renewal',
    path: '/active-mapping',
    icon: <CalendarIcon size={'S'} marginEnd={'size-100'} />
  },
  {
    label: 'Pause Renewal',
    path: '/pause-mapping',
    icon: <PauseCircleIcon size={'S'} marginEnd={'size-100'} />
  }
  // Per-flow button entries appended here (template 08).
]

/** Build application routes and forward authentication headers to their components. */
export const getNavigationRoutes = (actionCallHeaders: ActionCallHeaders): NavigationRoute[] => [
  {
    paths: ['/'],
    component: <Dashboard actionCallHeaders={actionCallHeaders} />
  },
  // Flow 2 §7.4.e — CSV Import
  {
    paths: ['/manage-renewal-notifications'],
    component: <ManageRenewalNotifications actionCallHeaders={actionCallHeaders} />
  },
  // Flow 3 §8.4.e — Active / Pause package mappings
  {
    paths: ['/active-mapping'],
    component: <ActiveMapping actionCallHeaders={actionCallHeaders} />
  },
  {
    paths: ['/pause-mapping'],
    component: <PauseMapping actionCallHeaders={actionCallHeaders} />
  }
  // Per-flow route entries appended here (template 08).
]

const NavigationContext = createContext({
  buttons: getNavigationButtons({}),
  routes: getNavigationRoutes({})
})

/** Provide navigation buttons and routes to descendants that consume the navigation context. */
export const NavigationProvider: React.FC<{
  children: React.ReactNode
  actionCallHeaders?: ActionCallHeaders
}> = ({ children, actionCallHeaders = {} }) => (
  <NavigationContext.Provider
    value={{
      buttons: getNavigationButtons(actionCallHeaders),
      routes: getNavigationRoutes(actionCallHeaders)
    }}
  >
    {children}
  </NavigationContext.Provider>
)

/** Access the current application navigation registry. */
export const useNavigation = () => useContext(NavigationContext)
