/*
 * <license header>
 */

/* Structured logging + step-code catalog — plan §5.5. Consumed by all flows. */

/** Flow code (replaces the source LogManager flow code). */
export const FLOW_CODE = 'PRICECHANGE'

/**
 * Step-code catalog replacing the source file/NewRelic/LogManager sinks and codes
 * `PRICECHANGE_001`–`012` (plan §5.5).
 */
export enum StepCode {
  PRICECHANGE_001 = 'PRICECHANGE_001',
  PRICECHANGE_002 = 'PRICECHANGE_002',
  PRICECHANGE_003 = 'PRICECHANGE_003',
  PRICECHANGE_004 = 'PRICECHANGE_004',
  PRICECHANGE_005 = 'PRICECHANGE_005',
  PRICECHANGE_006 = 'PRICECHANGE_006',
  PRICECHANGE_007 = 'PRICECHANGE_007',
  PRICECHANGE_008 = 'PRICECHANGE_008',
  PRICECHANGE_009 = 'PRICECHANGE_009',
  PRICECHANGE_010 = 'PRICECHANGE_010',
  PRICECHANGE_011 = 'PRICECHANGE_011',
  PRICECHANGE_012 = 'PRICECHANGE_012'
}

/** Minimal structured logger surface (compatible with the aio-sdk Core logger). */
export interface Logger {
  info(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

/**
 * Create a structured logger for the given action name and params (plan §5.5).
 */
export function createLogger(_name: string, _params: Record<string, unknown>): Logger {
  // TODO: Implement per migration plan §5.5 "lib/logger"
  // Purpose: build a structured logger (replaces file/NewRelic/LogManager sinks).
  throw new Error('TODO: implement createLogger')
}

/**
 * Emit a catalogued step-code log line with contextual data (plan §5.5).
 */
export function logStep(_logger: Logger, _code: StepCode, _ctx: Record<string, unknown>): void {
  // TODO: Implement per migration plan §5.5 "lib/logger"
  // Purpose: log a step with its PRICECHANGE_### code + context.
  throw new Error('TODO: implement logStep')
}
