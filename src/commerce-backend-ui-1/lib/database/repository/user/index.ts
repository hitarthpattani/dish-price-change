/**
 * <license header>
 */

/* This file exposes the UserRepository class for user repository functionality */

import { AbdbRepository } from '@adobe-commerce/aio-toolkit'
import { UserCollection } from '@lib/database/collection/user'
import { UserRecord } from '@lib/database/collection/user/types'

/**
 * Repository for interacting with the `user` ABDB collection.
 */
export class UserRepository extends AbdbRepository<UserRecord> {
  /**
   * Creates a new `UserRepository` instance.
   *
   * @param token - A valid IMS access token used to authenticate ABDB requests.
   */
  constructor(token: string) {
    super(new UserCollection(), token)
  }

  /**
   * Find a user by email address.
   *
   * @param email - The email address of the user to find.
   * @returns The user record if found, otherwise null.
   */
  public async findByEmail(email: string): Promise<UserRecord | null> {
    return await this.findOne({ email })
  }
}
