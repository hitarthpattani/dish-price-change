/**
 * <license header>
 */

/* This file exposes the UserCollection class for user collection functionality */

import { AbdbCollection, AbdbColumnType } from '@adobe-commerce/aio-toolkit'

/**
 * ABDB collection definition for the `user` table.
 */
export class UserCollection extends AbdbCollection {
  /**
   * Registers the `user` table and its column definitions with ABDB.
   */
  constructor() {
    super('user', collection => {
      collection
        .addColumn('first_name', AbdbColumnType.STRING, 'First Name', true)
        .addColumn('last_name', AbdbColumnType.STRING, 'Last Name', true)
        .addColumn('email', AbdbColumnType.STRING, 'Email', true)
    })
  }
}
