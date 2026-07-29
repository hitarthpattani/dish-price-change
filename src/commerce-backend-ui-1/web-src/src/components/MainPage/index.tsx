/*
 * <license header>
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Flex,
  ProgressCircle,
  Text,
  Provider,
  lightTheme,
  Heading
} from '@adobe/react-spectrum'
import type { MainPageProps } from './types'
import { attach } from '@adobe/uix-guest'
import { EXTENSION_ID } from '@web/types/constants'
import { MainContainer } from '@adobe-commerce/aio-experience-kit'
import HomeIcon from '@spectrum-icons/workflow/Home'
import ShoppingCartIcon from '@spectrum-icons/workflow/ShoppingCart'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ActionsForm from '../ActionsForm'

export const MainPage: React.FC<MainPageProps> = ({ runtime: runtime, ims }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!ims.token) {
        const guestConnection = await attach({ id: EXTENSION_ID })
        ims.token = guestConnection?.sharedContext?.get('imsToken')
        ims.org = guestConnection?.sharedContext?.get('imsOrgId')
        console.log('ims object', ims)
      }
      setIsLoading(false)
    }

    fetchCredentials()
  }, [])

  const navigationButtons = [
    {
      label: 'Home',
      path: '/',
      icon: <HomeIcon size={'S'} gridArea="Home" marginEnd={'size-100'} />
    },
    {
      label: 'Actions',
      path: '/actions',
      icon: <ShoppingCartIcon size={'S'} gridArea="Products" marginEnd={'size-100'} />
    }
  ]
  const appRoutes = [
    {
      paths: ['/'],
      component: (
        <View>
          <Heading level={1}>Home</Heading>
          <Text>Welcome to the Home page</Text>
        </View>
      )
    },
    {
      paths: ['/actions'],
      component: <ActionsForm ims={ims} runtime={runtime} />
    }
  ]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderActionsForm = () => (
    <HashRouter>
      <Provider theme={lightTheme} colorScheme={'light'}>
        <Routes>
          <Route index element={<ActionsForm ims={ims} runtime={runtime} />} />
        </Routes>
      </Provider>
    </HashRouter>
  )

  const renderMainContainer = () => (
    <MainContainer
      buttons={navigationButtons}
      routes={appRoutes}
      padding={'size-0'}
      navigationMarginTop={'size-200'}
      navigationMarginBottom={'size-200'}
    />
  )

  return (
    <View>
      {isLoading ? (
        <Flex alignItems="center" justifyContent="center" height="100vh">
          <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
        </Flex>
      ) : (
        <View width="size-6000">{renderMainContainer()}</View>
      )}
    </View>
  )
}
