/*
 * <license header>
 */

import { FieldType } from '@adobe-commerce/aio-experience-kit'
import type { FormBuilderComponents, FormBuilderOption } from '@adobe-commerce/aio-experience-kit'

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
 * Default SKU options offered by the `packages` field's `MULTISELECT_SEARCH` — placeholder until
 * a real SKU catalog source is wired in.
 */
const DEFAULT_SKU_OPTIONS: FormBuilderOption[] = [
  { value: 'sku-001', label: 'SKU-001' },
  { value: 'sku-002', label: 'SKU-002' },
  { value: 'sku-003', label: 'SKU-003' },
  { value: 'sku-004', label: 'SKU-004' },
  { value: 'sku-005', label: 'SKU-005' },
  { value: 'sku-006', label: 'SKU-006' },
  { value: 'sku-007', label: 'SKU-007' },
  { value: 'sku-008', label: 'SKU-008' },
  { value: 'sku-009', label: 'SKU-009' },
  { value: 'sku-010', label: 'SKU-010' },
  { value: 'sku-011', label: 'SKU-011' },
  { value: 'sku-012', label: 'SKU-012' },
  { value: 'sku-013', label: 'SKU-013' },
  { value: 'sku-014', label: 'SKU-014' },
  { value: 'sku-015', label: 'SKU-015' }
]

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
          type: FieldType.MULTISELECT_SEARCH,
          options: DEFAULT_SKU_OPTIONS,
          required: true,
          disabled: false
        }
      ]
    }
  ]
})
