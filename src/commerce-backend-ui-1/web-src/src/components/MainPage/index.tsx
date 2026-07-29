/*
 * <license header>
 */

import React, { useState, useEffect } from 'react'
import { View, Flex, ProgressCircle } from '@adobe/react-spectrum'
import type { MainPageProps } from './types'
import { attach } from '@adobe/uix-guest'
import { EXTENSION_ID } from '@web/types/constants'
import { MainContainer } from '@adobe-commerce/aio-experience-kit'
import { navigationButtons, navigationRoutes } from '@components/NavigationProvider'

/**
 * Top-level SPA shell (plan §5.6). Wires `buttons` and `routes` from NavigationProvider into
 * MainContainer. Per-flow builds contribute additional entries to the NavigationProvider registry.
 */
export const MainPage: React.FC<MainPageProps> = ({ ims }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!ims.token) {
        const guestConnection = await attach({ id: EXTENSION_ID })
        ims.token = guestConnection?.sharedContext?.get('imsToken')
        ims.org = guestConnection?.sharedContext?.get('imsOrgId')
      }
      setIsLoading(false)
    }

    fetchCredentials()
  }, [])

  const renderMainContainer = () => (
    <MainContainer
      buttons={navigationButtons}
      routes={navigationRoutes}
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
