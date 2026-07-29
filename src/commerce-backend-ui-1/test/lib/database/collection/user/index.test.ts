/*
 * <license header>
 */

import { UserCollection } from '@lib/database/collection/user'

const mockAddColumn = jest.fn().mockReturnThis()

jest.mock('@adobe-commerce/aio-toolkit', () => ({
  AbdbColumnType: {
    STRING: 'string'
  },
  AbdbCollection: jest
    .fn()
    .mockImplementation(
      (_name: string, callback: (collection: { addColumn: jest.Mock }) => void) => {
        callback({
          addColumn: mockAddColumn
        })
      }
    )
}))

describe('UserCollection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register user collection with columns', () => {
    new UserCollection()

    expect(mockAddColumn).toHaveBeenCalledTimes(3)
    expect(mockAddColumn).toHaveBeenCalledWith('first_name', 'string', 'First Name', true)
    expect(mockAddColumn).toHaveBeenCalledWith('last_name', 'string', 'Last Name', true)
    expect(mockAddColumn).toHaveBeenCalledWith('email', 'string', 'Email', true)
  })
})
