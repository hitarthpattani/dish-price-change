/*
 * <license header>
 */

import React, { useState } from 'react'
import { Flex, Heading } from '@adobe/react-spectrum'
import { DataTable, DataForm, FieldType } from '@adobe-commerce/aio-experience-kit'
import type {
  DataTableColumn,
  DataTableRow,
  FormBuilderGroup
} from '@adobe-commerce/aio-experience-kit'
import type { ActiveMappingProps } from './types'

/**
 * Active Renewal Package Mapping screen (plan §8.4.e, §11 item 8) — feature `PriceChangeConfig`.
 *
 * Lists the active SKU→date mappings (DataTable) and edits them (DataForm: packages MULTISELECT +
 * active-from date). Data source: the `price-change/package-mapping` action (mapping_type=active),
 * called with `actionCallHeaders`.
 */
const columns: DataTableColumn[] = [
  { uid: 'effective_date', name: 'Active From' },
  { uid: 'packages', name: 'Packages' }
]

const groups: FormBuilderGroup[] = [
  {
    code: 'active-mapping',
    label: 'Active Renewal Mapping',
    fields: [
      // NOTE: FieldType has no DATE — the active-from date uses TEXT (ISO string) for now
      // (swap for a react-spectrum DatePicker when implementing). See GENERATOR-DELTA §17.
      {
        label: 'Active From Date',
        code: 'active_from_date',
        db_field: 'effective_date',
        type: FieldType.TEXT,
        required: true,
        disabled: false
      },
      {
        label: 'Packages',
        code: 'packages',
        db_field: 'packages',
        type: FieldType.MULTISELECT,
        required: true,
        disabled: false,
        options: []
      }
    ]
  }
]

export const ActiveMapping: React.FC<ActiveMappingProps> = ({ actionCallHeaders }) => {
  const [rows, setRows] = useState<DataTableRow[]>([])

  const onGridLoad = async (): Promise<void> => {
    // TODO: GET price-change/package-mapping?type=active (forward actionCallHeaders); setRows(response).
    void actionCallHeaders
    setRows([])
  }

  const onFormSubmit = async (_values: Record<string, unknown>): Promise<void> => {
    // TODO: POST price-change/package-mapping with mapping_type=active (forward actionCallHeaders).
  }

  return (
    <Flex direction="column" gap="size-200">
      <Heading level={1}>Active Renewal Package Mapping</Heading>
      <DataTable columns={columns} data={rows} onGridLoad={onGridLoad} />
      <DataForm components={{ groups }} editItem={{}} onFormSubmit={onFormSubmit} />
    </Flex>
  )
}
