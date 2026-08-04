/*
 * <license header>
 */

/**
 * A stored state entry: the raw (string) value plus its expiration timestamp.
 */
export interface AioStateEntry {
  value: string
  expiration: string
}

/**
 * Adobe I/O State interface
 * Represents the state object returned by State.init()
 */
export interface AioState {
  get(key: string): Promise<AioStateEntry | undefined>
  put(key: string, value: string, options?: { ttl?: number }): Promise<string>
  delete(key: string): Promise<string | null>
  list(options?: { match?: string }): AsyncGenerator<{ keys: string[] }>
}
