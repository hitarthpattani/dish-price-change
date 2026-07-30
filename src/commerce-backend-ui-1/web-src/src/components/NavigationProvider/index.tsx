/*
 * <license header>
 */

import React, { createContext, useContext } from 'react'
import { View, Heading, Text } from '@adobe/react-spectrum'
import HomeIcon from '@spectrum-icons/workflow/Home'
import UploadToCloudIcon from '@spectrum-icons/workflow/UploadToCloud'
import CalendarIcon from '@spectrum-icons/workflow/Calendar'
import PauseCircleIcon from '@spectrum-icons/workflow/PauseCircle'
import { ActionCallHeaders, NavigationButton, NavigationRoute } from './types'
import { RenewalImport } from '@components/RenewalImport'
import { ActiveMapping } from '@components/PriceChangeConfig/components/ActiveMapping'
import { PauseMapping } from '@components/PriceChangeConfig/components/PauseMapping'

// Navigation registry (plan §5.6). Foundation seeds a default Home entry so the SPA shell renders;
// per-flow builds (§N.4.e / template 08) append their button + route entries to the arrays below:
//   Flow 2 §7.4.e — CSV Upload      → '/renewal-import'
//   Flow 3 §8.4.e — Active Mapping  → '/active-mapping'
//   Flow 3 §8.4.e — Pause Mapping   → '/pause-mapping'

// actionCallHeaders kept in the signature for parity with getNavigationRoutes, in case a future
// button entry needs to gate on auth state (e.g. role-based visibility).
export const getNavigationButtons = (_actionCallHeaders: ActionCallHeaders): NavigationButton[] => [
  {
    label: 'Home',
    path: '/',
    icon: <HomeIcon size={'S'} marginEnd={'size-100'} />
  },
  // Flow 2 §7.4.e — CSV Import
  {
    label: 'CSV Import',
    path: '/renewal-import',
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

// actionCallHeaders (Authorization / IMS org) are forwarded to route components that call
// backend actions directly, e.g. RenewalCsvUpload → `renewal/csv-import` (§7.4.a).
export const getNavigationRoutes = (actionCallHeaders: ActionCallHeaders): NavigationRoute[] => [
  {
    paths: ['/'],
    component: (
      <View>
        <Heading level={1}>Price Change Manager</Heading>
        <Text>Use the navigation to manage renewal imports and price-change package mappings.</Text>
      </View>
    )
  },
  // Flow 2 §7.4.e — CSV Import
  {
    paths: ['/renewal-import'],
    component: <RenewalImport actionCallHeaders={actionCallHeaders} />
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

export const useNavigation = () => useContext(NavigationContext)
