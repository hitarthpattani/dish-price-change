/*
 * <license header>
 */

import React from 'react'
import { Content, Flex, Heading, View, Well, Text } from '@adobe/react-spectrum'
import type { ConfigurationsProps } from './types'

/** Screen for managing Price Change Manager configuration settings. */
export const Configurations: React.FC<ConfigurationsProps> = ({ actionCallHeaders }) => {
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
            {'Configurations'}
          </Heading>
          <Content>
            <Text>{'Manage the configuration settings for the Price Change Manager.'}</Text>
          </Content>
        </Flex>
      </Well>
    </View>
  )
}
