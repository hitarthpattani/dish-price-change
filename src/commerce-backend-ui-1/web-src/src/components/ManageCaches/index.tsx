/*
 * <license header>
 */

import React from 'react'
import { Content, Flex, Heading, View, Well, Text } from '@adobe/react-spectrum'
import type { ManageCachesProps } from './types'

/** Screen for managing Price Change Manager caches. */
export const ManageCaches: React.FC<ManageCachesProps> = ({ actionCallHeaders }) => {
  void actionCallHeaders

  return (
    <View
      margin={'size-0'}
      paddingEnd={'size-100'}
      paddingTop={'size-50'}
      paddingBottom={'size-50'}
    >
      <Well>
        {/* Header Section */}
        <Flex direction="column" gap="size-100" marginTop="size-100">
          <Heading level={3} marginTop={0} marginBottom="size-50">
            {'Manage Caches'}
          </Heading>
          <Content>
            <Text>{'Manage caches used by the Price Change Manager.'}</Text>
          </Content>
        </Flex>
      </Well>
    </View>
  )
}
