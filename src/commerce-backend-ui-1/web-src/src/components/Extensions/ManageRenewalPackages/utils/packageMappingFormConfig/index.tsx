/*
 * <license header>
 */

import { FieldType } from '@adobe-commerce/aio-experience-kit'
import type { FormBuilderComponents } from '@adobe-commerce/aio-experience-kit'

/**
 * Package Mapping Form Field Configuration
 *
 * Generates the `DataForm` field/group schema for the Active/Pause renewal package mapping
 * add/edit screen. `effective_date` is disabled once a mapping exists (edit mode) because the
 * backend `save` action upserts by `mapping_type` + `effective_date` — changing the date on an
 * existing row would create a new row instead of updating it.
 *
 * @module packageMappingFormConfig
 */

/**
 * Generates the form field configuration for the package mapping add/edit screen
 *
 * @param {boolean} isEditing - Whether an existing mapping is being edited
 * @returns {FormBuilderComponents} Form field configuration
 */
export const getPackageMappingFormFields = (isEditing: boolean): FormBuilderComponents => ({
  groups: [
    {
      code: 'package_mapping',
      label: 'Package Mapping',
      fields: [
        {
          label: 'Effective Date',
          code: 'effective_date',
          db_field: 'effective_date',
          type: FieldType.DATE,
          required: true,
          disabled: isEditing
        },
        {
          label: 'Package SKUs',
          code: 'packages',
          db_field: 'packages',
          type: FieldType.TEXT,
          required: true,
          disabled: false
        }
      ]
    }
  ]
})
