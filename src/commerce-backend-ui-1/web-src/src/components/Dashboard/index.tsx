/*
 * <license header>
 */

import React from 'react'
import { View, Heading, Flex, Text, Content, Well } from '@adobe/react-spectrum'
import type { DashboardProps } from './types'

/** Landing screen for the Price Change Manager application. */
export const Dashboard: React.FC<DashboardProps> = ({ actionCallHeaders }) => {
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
        <Flex direction="column" gap="size-100" marginTop="size-100" marginBottom="size-300">
          <Heading level={3} marginTop={0} marginBottom="size-50">
            Getting Started
          </Heading>
          <Content>
            <Text>
              This application allows you to manage price changes for your products. You can import
              price change data, view active mappings, and pause mappings as needed.
            </Text>
          </Content>
        </Flex>
      </Well>
    </View>
  )
}
