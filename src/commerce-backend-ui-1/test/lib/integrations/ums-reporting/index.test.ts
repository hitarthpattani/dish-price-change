/*
 * <license header>
 */

import { UmsReportingClient } from '@lib/integrations/ums-reporting'

describe('UmsReportingClient', () => {
  const createClient = () =>
    new UmsReportingClient({
      reporting_endpoint_url: 'https://ums.example.com/report'
    })

  it('should construct without params', () => {
    expect(() => new UmsReportingClient({})).not.toThrow()
  })

  describe('sendReport', () => {
    it('should throw TODO error', async () => {
      await expect(createClient().sendReport([])).rejects.toThrow('TODO: implement sendReport')
    })
  })
})
