/*
 * <license header>
 */

import React from 'react'
import { FieldType } from '@adobe-commerce/aio-experience-kit'
import type {
  FormBuilderComponents,
  FormBuilderField,
  FormBuilderGroup
} from '@adobe-commerce/aio-experience-kit'
import { Content, ContextualHelp, Heading, Text } from '@adobe/react-spectrum'

/**
 * Configurations Form Field Configuration
 *
 * Generates the `DataForm` field/group schema for the Subscription Price Manager
 * business configuration. Every field maps to a flat key in the scoped
 * `configuration` ABDB collection (see `lib/database/repository/configuration`).
 *
 * @module configurationsFormConfig
 */

/** Configuration scopes a field can be restricted to. */
export type ConfigurationFieldScope = 'default' | 'website' | 'store'

/** A `FormBuilderField` restricted to the scopes it should be editable at. */
interface ConfigurationFieldConfig extends FormBuilderField {
  /** Scopes this field is shown for; the field is filtered out at any other scope. */
  scope: ConfigurationFieldScope[]
}

/** A `FormBuilderGroup` made up of scope-restricted fields. */
interface ConfigurationGroupConfig extends Omit<FormBuilderGroup, 'fields'> {
  fields: ConfigurationFieldConfig[]
}

const helpText = (text: string): React.ReactElement => (
  <ContextualHelp variant="info">
    <Heading>What's this field?</Heading>
    <Content>
      <Text>{text}</Text>
    </Content>
  </ContextualHelp>
)

/** All configuration groups/fields, before filtering down to the current scope. */
const CONFIGURATION_FORM_GROUPS: ConfigurationGroupConfig[] = [
  {
    code: 'price_change',
    label: 'Price Change',
    fields: [
      {
        label: 'Enable Price Change',
        code: 'price_change_enable',
        db_field: 'price_change_enable',
        type: FieldType.TOGGLE,
        required: false,
        disabled: false,
        scope: ['default'],
        contextualHelp: helpText(
          'Master switch for the price-change feature. When off, renewal notification and price-change processing is skipped.'
        )
      }
    ]
  }
]

/**
 * Generates the form field configuration for the Subscription Price Manager
 * business configuration screen, filtered down to the fields (and non-empty
 * groups) available at the given scope.
 *
 * @param {string} scope - Currently selected configuration scope (`default`, `website`, `store`)
 * @returns {FormBuilderComponents} Form field configuration for this scope, with groups that
 *   have no fields left for this scope removed entirely
 */
export const getConfigurationsFormFields = (scope: string): FormBuilderComponents => ({
  groups: CONFIGURATION_FORM_GROUPS.map(group => ({
    ...group,
    fields: group.fields
      .filter(field => field.scope.includes(scope as ConfigurationFieldScope))
      .map(({ scope: _scope, ...field }) => field)
  })).filter(group => group.fields.length > 0)
})
