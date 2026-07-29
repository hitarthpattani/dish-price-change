/*
 * <license header>
 */

import React, { useEffect } from 'react'
import { MainPage } from '@components/MainPage'
import type { ExtensionRegistrationProps } from './types'
import { register } from '@adobe/uix-guest'
import { EXTENSION_ID } from '@web/types/constants'

export const ExtensionRegistration: React.FC<ExtensionRegistrationProps> = ({ runtime, ims }) => {
  useEffect(() => {
    const init = async () => {
      await register({
        id: EXTENSION_ID,
        methods: {}
      })
    }
    init()
  }, [])

  return <MainPage runtime={runtime} ims={ims} />
}
