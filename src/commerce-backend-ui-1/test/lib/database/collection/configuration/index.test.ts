/*
 * <license header>
 */

import { ConfigurationCollection } from '@lib/database/collection/configuration'

describe('ConfigurationCollection', () => {
  it('should be named configuration', () => {
    const collection = new ConfigurationCollection()

    expect(collection.getName()).toBe('configuration')
  })

  it('should declare all expected columns', () => {
    const collection = new ConfigurationCollection()

    const columnNames = collection.getColumns().map(column => column.getName())

    expect(columnNames).toEqual(['key', 'value', 'scope', 'scope_id'])
  })
})
