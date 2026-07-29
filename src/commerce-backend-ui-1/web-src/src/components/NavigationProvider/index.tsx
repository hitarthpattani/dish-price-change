/*
 * <license header>
 */

import React, { createContext, useContext } from 'react'
import { View, Heading, Text } from '@adobe/react-spectrum'
import HomeIcon from '@spectrum-icons/workflow/Home'
import { NavigationButton, NavigationRoute } from './types'

// Navigation registry (plan §5.6). Foundation seeds a default Home entry so the SPA shell renders;
// per-flow builds (§N.4.e / template 08) append their button + route entries to the arrays below:
//   Flow 2 §7.4.e — CSV Upload      → '/renewal-import'
//   Flow 3 §8.4.e — Active Mapping  → '/active-mapping'
//   Flow 3 §8.4.e — Pause Mapping   → '/pause-mapping'

export const navigationButtons: NavigationButton[] = [
  {
    label: 'Home',
    path: '/',
    icon: <HomeIcon size={'S'} marginEnd={'size-100'} />
  }
  // Per-flow button entries appended here (template 08).
]

export const navigationRoutes: NavigationRoute[] = [
  {
    paths: ['/'],
    component: (
      <View>
        <Heading level={1}>Price Change Manager</Heading>
        <Text>Use the navigation to manage renewal imports and price-change package mappings.</Text>
      </View>
    )
  }
  // Per-flow route entries appended here (template 08).
]

const NavigationContext = createContext({
  buttons: navigationButtons,
  routes: navigationRoutes
})

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NavigationContext.Provider value={{ buttons: navigationButtons, routes: navigationRoutes }}>
    {children}
  </NavigationContext.Provider>
)

export const useNavigation = () => useContext(NavigationContext)
