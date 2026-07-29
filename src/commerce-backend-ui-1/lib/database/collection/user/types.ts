/**
 * <license header>
 */

/* This file defines types for the User Collection */

import type { AbdbRecord } from '@adobe-commerce/aio-toolkit'

/**
 * A record representing a user entry in the `user` ABDB collection.
 *
 * Extends {@link AbdbRecord} so instances are directly assignable to
 * `Partial<AbdbRecord>` as required by `AbdbRepository.insert`.
 */
export interface UserRecord extends AbdbRecord {
  /**
   * First name of the user
   */
  first_name: string

  /**
   * Last name of the user
   */
  last_name: string

  /**
   * Email address of the user
   */
  email: string
}
