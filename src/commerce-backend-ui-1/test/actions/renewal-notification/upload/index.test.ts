/*
 * <license header>
 */

import type { SuccessResponse, ErrorResponse } from '@adobe-commerce/aio-toolkit'
import { main as upload } from '@actions/renewal-notification/upload'
import { GenerateAccessToken } from '@lib/utils/generate-access-token'
import { PrerenewalNotificationsRepository } from '@lib/database/repository/prerenewal-notifications'

jest.mock('@lib/utils/generate-access-token')
jest.mock('@lib/database/repository/prerenewal-notifications')

type ActionParams = Record<string, unknown>

describe('upload', () => {
  let mockParseCsvContent: jest.Mock
  let mockInsertMany: jest.Mock

  const baseParams: ActionParams = {
    __ow_headers: { authorization: 'Bearer token', 'x-gw-ims-org-id': 'org-id' },
    __ow_method: 'post',
    content: 'uuid,renewal_date\nuuid-1,2026-03-19T08:35:00.000Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(GenerateAccessToken.execute as jest.Mock).mockResolvedValue('a-valid-token')

    mockParseCsvContent = jest
      .fn()
      .mockReturnValue([{ uuid: 'uuid-1', renewal_date: '2026-03-19T08:35:00.000Z' }])
    mockInsertMany = jest.fn().mockResolvedValue(1)
    ;(PrerenewalNotificationsRepository as unknown as jest.Mock).mockImplementation(() => ({
      parseCsvContent: mockParseCsvContent,
      insertMany: mockInsertMany
    }))
  })

  it('imports valid rows and returns a summary', async () => {
    const response = (await upload(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(response.statusCode).toBe(200)
    expect(body).toEqual({ imported: 1, skipped: 0, errors: [] })

    expect(GenerateAccessToken.execute).toHaveBeenCalledWith(baseParams)
    expect(PrerenewalNotificationsRepository).toHaveBeenCalledWith('a-valid-token')
    expect(mockParseCsvContent).toHaveBeenCalledWith(baseParams.content)
    expect(mockInsertMany).toHaveBeenCalledWith([
      {
        uuid: 'uuid-1',
        renewal_date: '2026-03-19T08:35:00.000Z',
        event_type: 'renewal.scheduled'
      }
    ])
  })

  it('skips rows missing uuid or renewal_date and reports them as errors', async () => {
    mockParseCsvContent.mockReturnValue([
      { uuid: 'uuid-1', renewal_date: '2026-03-19T08:35:00.000Z' },
      { uuid: '', renewal_date: '2026-03-19T06:34:00.000Z' },
      { uuid: 'uuid-3', renewal_date: '' }
    ])
    mockInsertMany.mockResolvedValue(1)

    const response = (await upload(baseParams)) as SuccessResponse
    const body = response.body as Record<string, unknown>

    expect(body).toEqual({
      imported: 1,
      skipped: 2,
      errors: ['Row 3: missing uuid or renewal_date', 'Row 4: missing uuid or renewal_date']
    })
    expect(mockInsertMany).toHaveBeenCalledWith([
      {
        uuid: 'uuid-1',
        renewal_date: '2026-03-19T08:35:00.000Z',
        event_type: 'renewal.scheduled'
      }
    ])
  })

  it('returns 500 when the CSV cannot be parsed', async () => {
    mockParseCsvContent.mockImplementation(() => {
      throw new Error('CSV must contain at least a header row and one data row')
    })

    const response = (await upload(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain(
      'CSV must contain at least a header row and one data row'
    )
  })

  it('returns 500 when the insert fails', async () => {
    mockInsertMany.mockRejectedValue(new Error('abdb unavailable'))

    const response = (await upload(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('abdb unavailable')
  })

  it('returns 500 with a generic message for non-Error failures', async () => {
    mockInsertMany.mockRejectedValue('insert failure')

    const response = (await upload(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('insert failure')
  })

  it('returns 500 when access token generation fails', async () => {
    ;(GenerateAccessToken.execute as jest.Mock).mockRejectedValue(new Error('token failure'))

    const response = (await upload(baseParams)) as ErrorResponse

    expect(response.error.statusCode).toBe(500)
    expect(response.error.body.error).toContain('token failure')
  })

  it('should reject an unsupported HTTP method', async () => {
    const response = await upload({ ...baseParams, __ow_method: 'get' })
    const errorResponse = response as { error: { statusCode: number } }

    expect(response).toHaveProperty('error')
    expect(errorResponse.error.statusCode).toBe(405)
  })
})
