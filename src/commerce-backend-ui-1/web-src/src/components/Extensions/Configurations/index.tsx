/*
 * <license header>
 */

import React from 'react'
import {
  Content,
  Divider,
  Flex,
  Heading,
  ProgressCircle,
  Text,
  View,
  Well
} from '@adobe/react-spectrum'
import { ScopeSelector } from './components/ScopeSelector'
import { ConfigurationsForm } from './components/ConfigurationsForm'
import { useConfigurationScope } from './hooks/useConfigurationScope'
import { CONFIGURATION_TEXT } from './utils/configurationConstants'
import type { ConfigurationsProps } from './types'

/** Screen for managing Subscription Price Manager configuration settings. */
export const Configurations: React.FC<ConfigurationsProps> = ({ actionCallHeaders }) => {
  // Scope is shared between the Scope Picker and the configuration form below it —
  // owned here so both can react to the same selected scope.
  const {
    isLoading,
    defaultItem,
    sections,
    selectedScopeKey,
    scope,
    scopeId,
    configuration,
    handleScopeChange
  } = useConfigurationScope(actionCallHeaders)

  return (
    <View
      margin={'size-0'}
      paddingEnd={'size-100'}
      paddingTop={'size-50'}
      paddingBottom={'size-50'}
    >
      <Well>
        <Flex direction="column" gap="size-100" marginTop={'size-100'} marginBottom="size-250">
          <Heading level={3} marginTop={0} marginBottom="size-50">
            {CONFIGURATION_TEXT.HEADING}
          </Heading>
          <Content>
            <Text>{CONFIGURATION_TEXT.DESCRIPTION}</Text>
          </Content>
        </Flex>

        <Divider size="S" marginBottom="size-150" />

        <ScopeSelector
          isLoading={isLoading}
          defaultItem={defaultItem}
          sections={sections}
          selectedScopeKey={selectedScopeKey}
          onScopeChange={handleScopeChange}
        />

        <Divider size="S" marginBottom="size-250" />

        {isLoading ? (
          <ProgressCircle size={'L'} aria-label="Loading configuration…" isIndeterminate />
        ) : (
          <ConfigurationsForm
            // Only rendered once the scope's configuration has actually finished loading, and
            // remounted (via key) whenever the selected scope changes — DataForm's fields are
            // uncontrolled and only read editItem once, on mount, so mounting it early (before
            // data arrives) or leaving it mounted across a scope change (a plain re-render)
            // would both leave stale/blank values on screen.
            key={`${scope}:${scopeId}`}
            actionCallHeaders={actionCallHeaders}
            scope={scope}
            scopeId={scopeId}
            configuration={configuration}
          />
        )}
      </Well>
    </View>
  )
}
