/*
 * <license header>
 */

import React from 'react'
import { Flex, Item, Picker, Section } from '@adobe/react-spectrum'
import type { Key } from '@adobe/react-spectrum'
import { CONFIGURATION_TEXT } from '@components/Extensions/Configurations/utils/configurationConstants'
import type {
  ScopePickerItem,
  ScopePickerSection
} from '@components/Extensions/Configurations/types'

/**
 * Scope Selector Component
 *
 * A presentational component for picking the Commerce configuration scope
 * (Default Config, a website, or one of its store views). All business logic
 * (loading the scope tree, tracking the selected scope) lives in the parent
 * `Configurations` component via the `useConfigurationScope` hook, since the
 * selected scope is also consumed by sibling components (e.g. the
 * configuration form).
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether the scope tree is currently loading
 * @param {ScopePickerItem} props.defaultItem - The "Default Config" picker item
 * @param {ScopePickerSection[]} props.sections - One Picker section per website
 * @param {string} props.selectedScopeKey - Currently selected Picker key (`scope:scopeId`)
 * @param {(key: string) => void} props.onScopeChange - Called when the user selects a different scope
 *
 * @example
 * ```tsx
 * <ScopeSelector
 *   isLoading={isLoading}
 *   defaultItem={defaultItem}
 *   sections={sections}
 *   selectedScopeKey={selectedScopeKey}
 *   onScopeChange={handleScopeChange}
 * />
 * ```
 */
export const ScopeSelector: React.FC<{
  isLoading: boolean
  defaultItem: ScopePickerItem
  sections: ScopePickerSection[]
  selectedScopeKey: string
  onScopeChange: (key: string) => void
}> = ({ isLoading, defaultItem, sections, selectedScopeKey, onScopeChange }) => {
  return (
    <Flex direction="column" gap="size-100" marginTop="size-100" marginBottom="size-250">
      <Picker
        label={CONFIGURATION_TEXT.SCOPE_LABEL}
        isLoading={isLoading}
        selectedKey={selectedScopeKey}
        onSelectionChange={(key: Key | null) => {
          if (key !== null) {
            onScopeChange(String(key))
          }
        }}
      >
        {[
          <Section key="default-section" title={CONFIGURATION_TEXT.DEFAULT_SECTION_TITLE}>
            <Item key={defaultItem.key}>{defaultItem.label}</Item>
          </Section>,
          ...sections.map(section => (
            <Section key={section.key} title={section.title}>
              {section.items.map(item => (
                <Item key={item.key}>{item.label}</Item>
              ))}
            </Section>
          ))
        ]}
      </Picker>
    </Flex>
  )
}
