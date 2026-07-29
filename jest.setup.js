/*
 * <license header>
 */

jest.setTimeout(10000)

// Suppress console logs during tests (winston logger output)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for actual test failures
  error: console.error,
}

beforeEach(() => {})
afterEach(() => {})
