/*
 * <license header>
 */

import { FieldType } from '@adobe-commerce/aio-experience-kit'
import type { FormBuilderComponents, FormBuilderOption } from '@adobe-commerce/aio-experience-kit'

/**
 * Package Mapping Form Field Configuration
 *
 * Generates the `DataForm` field/group schema for the Active/Pause renewal package mapping
 * add/edit screen.
 *
 * @module packageMappingFormConfig
 */

/**
 * Generates the form field configuration for the package mapping add/edit screen
 *
 * @param {FormBuilderOption[]} skuOptions - SKU options for the `packages` field, sourced from
 *   `renewal-package/skus` (Adobe Commerce's enabled product catalog)
 * @returns {FormBuilderComponents} Form field configuration
 */
export const getPackageMappingFormFields = (
  skuOptions: FormBuilderOption[]
): FormBuilderComponents => ({
  groups: [
    {
      code: 'package_mapping',
      label: 'Package Mapping',
      fields: [
        {
          label: 'Package SKUs',
          code: 'packages',
          db_field: 'packages',
          type: FieldType.MULTISELECT_SEARCH,
          options: skuOptions,
          required: true,
          disabled: false
        },
        {
          label: 'Effective Date',
          code: 'effective_date',
          db_field: 'effective_date',
          type: FieldType.DATE,
          required: true,
          disabled: false
        }
      ]
    }
  ]
})
