/*
 * <license header>
 */

/* This file exposes the ConfigurationCollection class */

import { AbdbCollection, AbdbColumnType } from '@adobe-commerce/aio-toolkit'

/**
 * ABDB collection definition for the `configuration` table.
 *
 * Stores generic key-value configuration entries.
 */
export class ConfigurationCollection extends AbdbCollection {
  constructor() {
    super('configuration', collection => {
      collection
        .addColumn('key', AbdbColumnType.STRING, 'Key', true)
        .addColumn('value', AbdbColumnType.STRING, 'Value', true)
        .addColumn('scope', AbdbColumnType.STRING, 'Scope (default|website|store)', true)
        .addColumn('scope_id', AbdbColumnType.NUMBER, 'Scope Id', true)
    })
  }
}
