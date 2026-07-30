/*
 * <license header>
 */

import React, { useState } from 'react'
import { Flex, Heading, Form } from '@adobe/react-spectrum'
import { FileUpload, DataTable } from '@adobe-commerce/aio-experience-kit'
import type { FileInfo, DataTableColumn, DataTableRow } from '@adobe-commerce/aio-experience-kit'
import type { RenewalImportProps } from './types'

/**
 * Renewal CSV Upload screen (plan §7.4.e) — feature `RenewalImport`.
 *
 * A Form with a single-file CSV FileUpload plus a DataTable summarising the import result
 * (imported / skipped / errors). Data source: the `renewal/csv-import` action (§7.4.a).
 */
const resultColumns: DataTableColumn[] = [
  { uid: 'uuid', name: 'UUID' },
  { uid: 'status', name: 'Status' },
  { uid: 'message', name: 'Message' }
]

export const RenewalImport: React.FC<RenewalImportProps> = ({ actionCallHeaders }) => {
  const [results, setResults] = useState<DataTableRow[]>([])

  const onSelect = async (_files: FileInfo[]): Promise<void> => {
    // TODO: Implement per migration plan §7.4.e "Renewal CSV Upload" (+ §7.4.a "csv-import")
    //   - POST the selected CSV to the `renewal/csv-import` action (base64 content from FileInfo),
    //     forwarding `actionCallHeaders` (Authorization / IMS org) on the request.
    //   - Map the response { imported, skipped, errors[] } into the result-summary rows below
    //     (one row per skipped/errored line: { id, uuid, status, message }).
    void actionCallHeaders
    setResults([])
  }

  return (
    <Flex direction="column" gap="size-200">
      <Heading level={1}>Renewal CSV Import</Heading>
      <Form>
        <FileUpload
          label="Renewal CSV file"
          acceptedFileTypes={['.csv']}
          allowsMultiple={false}
          onSelect={onSelect}
        />
      </Form>
      <DataTable columns={resultColumns} data={results} />
    </Flex>
  )
}
