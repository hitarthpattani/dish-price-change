/*
 * <license header>
 */

import React from 'react'
import { View } from '@adobe/react-spectrum'
import { CacheGrid } from './components/CacheGrid'
import { type ManageCachesProps } from './types'

/** Screen for managing Subscription Price Manager caches. */
export const ManageCaches: React.FC<ManageCachesProps> = ({ actionCallHeaders }) => {
  return (
    <View
      margin={'size-0'}
      paddingEnd={'size-100'}
      paddingTop={'size-50'}
      paddingBottom={'size-50'}
    >
      <CacheGrid actionCallHeaders={actionCallHeaders} />
    </View>
  )
}
