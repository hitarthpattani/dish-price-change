/*
 * <license header>
 */

import { UserRepository } from '@lib/database/repository/user'

const mockFindOne = jest.fn()

jest.mock('@adobe-commerce/aio-toolkit', () => ({
  AbdbRepository: class MockAbdbRepository {
    findOne = mockFindOne

    constructor(_collection: unknown, _token: string) {
      // Mock parent constructor
    }
  }
}))

jest.mock('@lib/database/collection/user', () => ({
  UserCollection: jest.fn()
}))

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should find a user by email', async () => {
    const user = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com'
    }
    mockFindOne.mockResolvedValue(user)

    const repository = new UserRepository('test-token')
    const result = await repository.findByEmail('john@example.com')

    expect(mockFindOne).toHaveBeenCalledWith({ email: 'john@example.com' })
    expect(result).toEqual(user)
  })

  it('should return null when user is not found', async () => {
    mockFindOne.mockResolvedValue(null)

    const repository = new UserRepository('test-token')
    const result = await repository.findByEmail('missing@example.com')

    expect(result).toBeNull()
  })
})
