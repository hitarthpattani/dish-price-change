/*
 * <license header>
 */

/* Custom error types — plan §5.5. Consumed by all flows. */

/** Base error for all Subscription Price Manager failures. */
export class PriceChangeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PriceChangeError'
  }
}

/** Raised when a downstream call fails in a way the retry engine should re-attempt. */
export class RetryableError extends PriceChangeError {
  public readonly code: string | number

  constructor(message: string, code: string | number) {
    super(message)
    this.name = 'RetryableError'
    this.code = code
  }
}

/** Raised when required configuration (businessConfig / env) is missing or invalid. */
export class ConfigurationError extends PriceChangeError {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}
