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
import type { PauseMappingProps } from './types'

/**
 * Pause Renewal Package Mapping screen (plan §8.4.e, §11 item 8) — feature `PriceChangeConfig`.
 *
 * Same shape as Active Renewal Mapping but with a `from_date`. Data source: the
 * `price-change/package-mapping` action (mapping_type=pause), called with `actionCallHeaders`.
 */
const columns: DataTableColumn[] = [
  { uid: 'effective_date', name: 'From' },
  { uid: 'packages', name: 'Packages' }
]

const groups: FormBuilderGroup[] = [
  {
    code: 'pause-mapping',
    label: 'Pause Renewal Mapping',
    fields: [
      // NOTE: FieldType has no DATE — the from date uses TEXT (ISO string) for now. See GENERATOR-DELTA §17.
      {
        label: 'From Date',
        code: 'from_date',
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

export const PauseMapping: React.FC<PauseMappingProps> = ({ actionCallHeaders }) => {
  const [rows, setRows] = useState<DataTableRow[]>([])

  const onGridLoad = async (): Promise<void> => {
    // TODO: GET price-change/package-mapping?type=pause (forward actionCallHeaders); setRows(response).
    void actionCallHeaders
    setRows([])
  }

  const onFormSubmit = async (_values: Record<string, unknown>): Promise<void> => {
    // TODO: POST price-change/package-mapping with mapping_type=pause (forward actionCallHeaders).
  }

  return (
    <Flex direction="column" gap="size-200">
      <Heading level={1}>Pause Renewal Package Mapping</Heading>
      <DataTable columns={columns} data={rows} onGridLoad={onGridLoad} />
      <DataForm components={{ groups }} editItem={{}} onFormSubmit={onFormSubmit} />
    </Flex>
  )
}
