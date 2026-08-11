/*
 * <license header>
 */

import React, { createContext, useContext } from 'react'
import HomeIcon from '@spectrum-icons/workflow/Home'
import UploadToCloudIcon from '@spectrum-icons/workflow/UploadToCloud'
import CalendarIcon from '@spectrum-icons/workflow/Calendar'
import PauseCircleIcon from '@spectrum-icons/workflow/PauseCircle'
import DataRefreshIcon from '@spectrum-icons/workflow/DataRefresh'
import SettingsIcon from '@spectrum-icons/workflow/Settings'
import { ActionCallHeaders, NavigationButton, NavigationRoute } from './types'
import { ManageRenewalNotifications } from '@components/Extensions/ManageRenewalNotifications'
import { Dashboard } from '@components/Extensions/Dashboard'
import { Configurations } from '@components/Extensions/Configurations'
import { ManageCaches } from '@components/Extensions/ManageCaches'
import { ManageRenewalPackages } from '@components/Extensions/ManageRenewalPackages'
import { RenewalPackageType } from '@components/Extensions/ManageRenewalPackages/types'

// Navigation registry (plan §5.6). Foundation seeds a default Home entry so the SPA shell renders;
// per-flow builds (§N.4.e / template 08) append their button + route entries to the arrays below:
//   Flow 2 §7.4.e — CSV Upload      → '/manage-renewal-notifications'
//   Flow 3 §8.4.e — Active Mapping  → '/active-renewal-packages'
//   Flow 3 §8.4.e — Pause Mapping   → '/pause-renewal-packages'

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
    label: 'Active Renewal Packages',
    path: '/active-renewal-packages',
    icon: <CalendarIcon size={'S'} marginEnd={'size-100'} />
  },
  {
    label: 'Pause Renewal Packages',
    path: '/pause-renewal-packages',
    icon: <PauseCircleIcon size={'S'} marginEnd={'size-100'} />
  },
  // Per-flow button entries appended here (template 08).
  {
    label: 'Manage Caches',
    path: '/manage-caches',
    icon: <DataRefreshIcon size={'S'} marginEnd={'size-100'} />
  },
  {
    label: 'Configurations',
    path: '/configurations',
    icon: <SettingsIcon size={'S'} marginEnd={'size-100'} />
  }
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
    paths: [
      '/active-renewal-packages',
      '/active-renewal-packages/:component',
      '/active-renewal-packages/:component/:id'
    ],
    component: (
      <ManageRenewalPackages
        actionCallHeaders={actionCallHeaders}
        packageType={RenewalPackageType.ACTIVE}
      />
    )
  },
  {
    paths: [
      '/pause-renewal-packages',
      '/pause-renewal-packages/:component',
      '/pause-renewal-packages/:component/:id'
    ],
    component: (
      <ManageRenewalPackages
        actionCallHeaders={actionCallHeaders}
        packageType={RenewalPackageType.PAUSE}
      />
    )
  },
  // Per-flow route entries appended here (template 08).
  {
    paths: ['/manage-caches'],
    component: <ManageCaches actionCallHeaders={actionCallHeaders} />
  },
  {
    paths: ['/configurations'],
    component: <Configurations actionCallHeaders={actionCallHeaders} />
  }
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
