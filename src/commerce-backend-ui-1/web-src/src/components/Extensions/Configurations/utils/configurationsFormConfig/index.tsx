/*
 * <license header>
 */

import React from 'react'
import { FieldType } from '@adobe-commerce/aio-experience-kit'
import type { FormBuilderComponents } from '@adobe-commerce/aio-experience-kit'
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

const helpText = (text: string): React.ReactElement => (
  <ContextualHelp variant="info">
    <Heading>What's this field?</Heading>
    <Content>
      <Text>{text}</Text>
    </Content>
  </ContextualHelp>
)

/**
 * Generates the form field configuration for the Subscription Price Manager
 * business configuration screen.
 *
 * @returns {FormBuilderComponents} Complete form field configuration
 */
export const getConfigurationsFormFields = (): FormBuilderComponents => ({
  groups: [
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
          contextualHelp: helpText(
            'Master switch for the price-change feature. When off, renewal notification and price-change processing is skipped.'
          )
        }
      ]
    }
  ]
})
