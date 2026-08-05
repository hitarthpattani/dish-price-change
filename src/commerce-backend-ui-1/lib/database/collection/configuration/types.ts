/*
 * <license header>
 */

/* This file defines types for the Configuration Collection */

import type { AbdbRecord } from '@adobe-commerce/aio-toolkit'

/**
 * A record representing a configuration entry in the `configuration` ABDB collection.
 */
export interface ConfigurationRecord extends AbdbRecord {
  key: string
  value: string
  scope: string
  scope_id: number
}
