/*
 * <license header>
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Flex,
  ProgressCircle,
  Provider,
  ToastContainer,
  defaultTheme
} from '@adobe/react-spectrum'
import type { MainPageProps } from './types'
import { attach } from '@adobe/uix-guest'
import { EXTENSION_ID } from '@web/types/constants'
import { MainContainer } from '@adobe-commerce/aio-experience-kit'
import {
  getNavigationButtons,
  getNavigationRoutes
} from '@components/MainPage/utils/NavigationProvider'
import type { ActionCallHeaders } from '@components/MainPage/utils/NavigationProvider/types'

/**
 * Top-level SPA shell (plan §5.6). Wires `buttons` and `routes` from NavigationProvider into
 * MainContainer. Per-flow builds contribute additional entries to the NavigationProvider registry.
 */
export const MainPage: React.FC<MainPageProps> = ({ ims }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [actionCallHeaders, setActionCallHeaders] = useState<ActionCallHeaders>({})

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!ims.token) {
        const guestConnection = await attach({ id: EXTENSION_ID })
        ims.token = guestConnection?.sharedContext?.get('imsToken')
        ims.org = guestConnection?.sharedContext?.get('imsOrgId')
      }
      setActionCallHeaders({
        Authorization: `Bearer ${ims.token}`,
        'x-gw-ims-org-id': ims.org
      })
      setIsLoading(false)
    }

    fetchCredentials()
  }, [])

  const renderMainContainer = () => (
    <MainContainer
      buttons={getNavigationButtons(actionCallHeaders)}
      routes={getNavigationRoutes(actionCallHeaders)}
      padding={'size-0'}
      navigationMarginTop={'size-200'}
      navigationMarginBottom={'size-200'}
    />
  )

  return (
    // MainContainer (rendered below) has its own internal Provider, but only around its own
    // children — ToastContainer needs an ancestor Provider of its own to resolve a theme, since
    // it's rendered as a sibling here, not nested inside MainContainer's.
    <Provider theme={defaultTheme} colorScheme="light" width="100%" height="100%">
      <View width="100%" height="100%">
        {isLoading ? (
          <Flex alignItems="center" justifyContent="center" height="100vh">
            <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
          </Flex>
        ) : (
          <View width="100%">{renderMainContainer()}</View>
        )}
        {/* Renders queued ToastQueue.positive()/negative() toasts (e.g. ManageCaches,
            Configurations save feedback) — nothing in MainContainer or DataForm's own
            Provider renders one. */}
        <ToastContainer placement="top end" />
      </View>
    </Provider>
  )
}
