/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { UserRepository } from '@lib/database/repository/user'
import { main as exampleAction } from '../../../actions/example/generic/index'

type ActionParams = Record<string, unknown>

const mockFindByEmail = jest.fn()
const mockGenerateAccessToken = jest.fn()

jest.mock('@lib/database/repository/user', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: mockFindByEmail
  }))
}))

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    AuthClient: {
      generateAccessToken: (...args: unknown[]) => mockGenerateAccessToken(...args)
    },
    Logger: jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    }))
  }
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGenerateAccessToken.mockResolvedValue({ access_token: 'test-token' })
})

const baseParams: ActionParams = {
  __ow_headers: {},
  __ow_method: 'post'
}

describe('example/generic action', () => {
  it('should be defined', () => {
    expect(exampleAction).toBeInstanceOf(Function)
  })

  it('should return success response with user first name', async () => {
    mockFindByEmail.mockResolvedValue({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com'
    })

    const response = (await exampleAction({
      ...baseParams,
      email: 'john@example.com'
    })) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.message).toBe('Hello, John!')
    expect(mockFindByEmail).toHaveBeenCalledWith('john@example.com')
    expect(UserRepository).toHaveBeenCalledWith('test-token')
  })

  it('should default to Guest when user is not found', async () => {
    mockFindByEmail.mockResolvedValue(null)

    const response = (await exampleAction(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body.message).toBe('Hello, Guest!')
    expect(mockFindByEmail).toHaveBeenCalledWith('')
  })

  it('should use empty access token when generateAccessToken returns no token', async () => {
    mockGenerateAccessToken.mockResolvedValue({})
    mockFindByEmail.mockResolvedValue(null)

    await exampleAction(baseParams)

    expect(UserRepository).toHaveBeenCalledWith('')
  })

  it('should return 405 for unsupported HTTP method', async () => {
    const response = await exampleAction({
      ...baseParams,
      __ow_method: 'delete'
    })

    expect(response).toHaveProperty('error')
    const errorResponse = response as { error: { statusCode: number; body: { error: string } } }
    expect(errorResponse.error.statusCode).toBe(405)
    expect(errorResponse.error.body.error).toContain('Invalid HTTP method')
  })

  it('should return 500 when unexpected error occurs', async () => {
    mockFindByEmail.mockRejectedValue(new Error('Database connection failed'))

    const response = (await exampleAction(baseParams)) as ErrorResponse

    expect(response).toEqual({
      error: {
        statusCode: 500,
        body: {
          error: 'server error'
        }
      }
    })
  })

  it('should handle non-Error exceptions', async () => {
    mockFindByEmail.mockRejectedValue('String error')

    const response = (await exampleAction(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toBe('server error')
  })
})
