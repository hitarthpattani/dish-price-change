/*
 * <license header>
 */

/* This file exposes the ConfigurationRepository class */

import { AbdbRepository } from '@adobe-commerce/aio-toolkit'
import { ConfigurationCollection } from '@lib/database/collection/configuration'
import type { ConfigurationRecord } from '@lib/database/collection/configuration/types'

/**
 * Repository for the `configuration` ABDB collection.
 *
 * Provides a simple key-value API on top of the underlying ABDB CRUD operations:
 * - {@link get} — retrieve a single value with optional environment override
 * - {@link set} — upsert one or more key-value pairs
 * - {@link all} — return the full configuration map
 */
export class ConfigurationRepository extends AbdbRepository<ConfigurationRecord> {
  /** Default configuration data */
  private static readonly DEFAULT_CONFIG: Record<string, string> = {}

  /** Scope applied when the caller does not specify one. */
  private static readonly DEFAULT_SCOPE = 'default'

  /** Scope id applied when the caller does not specify one. */
  private static readonly DEFAULT_SCOPE_ID = 0

  /**
   * @param token - A valid IMS access token used to authenticate ABDB requests.
   */
  constructor(token: string) {
    super(new ConfigurationCollection(), token)
  }

  /**
   * Retrieves a configuration value with optional environment override.
   *
   * Returns the environment-specific value if a `key-env` record exists and the
   * matching environment parameter is provided, otherwise returns the stored or
   * default value.
   *
   * @param key - Configuration key to retrieve.
   * @param params - Environment parameters for override values.
   * @param scope - Configuration scope to read from (e.g. `default`, `website`, `store`).
   * @param scopeId - Identifier of the scope entity to read from.
   * @returns Configuration value or null if not found.
   */
  public async get(
    key: string,
    params: Record<string, string> = {},
    scope: string = ConfigurationRepository.DEFAULT_SCOPE,
    scopeId: number = ConfigurationRepository.DEFAULT_SCOPE_ID
  ): Promise<string | null> {
    let value: string | null = null

    const record = await this.findOne({ key, scope, scope_id: scopeId })

    if (record !== null) {
      value =
        record.value && record.value !== ''
          ? record.value
          : (ConfigurationRepository.DEFAULT_CONFIG[key] ?? null)
    } else if (Object.prototype.hasOwnProperty.call(ConfigurationRepository.DEFAULT_CONFIG, key)) {
      value = ConfigurationRepository.DEFAULT_CONFIG[key]!
    }

    const envRecord = await this.findOne({ key: `${key}-env`, scope, scope_id: scopeId })
    if (envRecord?.value) {
      const environmentKey = envRecord.value
      if (params[environmentKey] !== undefined) {
        value = params[environmentKey] ?? null
      }
    }

    return value
  }

  /**
   * Saves configuration by upserting each key-value pair.
   *
   * For every entry in `records`, updates the existing row if the key is already
   * stored for the given scope, or inserts a new row otherwise.
   *
   * @param records - Key-value pairs to save.
   * @param scope - Configuration scope to write to (e.g. `default`, `website`, `store`).
   * @param scopeId - Identifier of the scope entity to write to.
   * @throws Error When `records` is not a plain object.
   */
  public async set(
    records: Record<string, string>,
    scope: string = ConfigurationRepository.DEFAULT_SCOPE,
    scopeId: number = ConfigurationRepository.DEFAULT_SCOPE_ID
  ): Promise<void> {
    if (!records || typeof records !== 'object' || Array.isArray(records)) {
      throw new Error('Records must be a valid object')
    }

    await Promise.all(
      Object.entries(records).map(async ([key, value]) => {
        const filter = { key, scope, scope_id: scopeId }
        const existing = await this.findOne(filter)
        if (existing) {
          await this.updateOne({ value }, filter)
        } else {
          await this.insertOne({ key, value, scope, scope_id: scopeId })
        }
      })
    )
  }

  /**
   * Retrieves all configuration data for a scope.
   *
   * Returns all stored key-value pairs merged with the default configuration,
   * where stored values take precedence over defaults.
   *
   * @param scope - Configuration scope to read from (e.g. `default`, `website`, `store`).
   * @param scopeId - Identifier of the scope entity to read from.
   * @returns All configuration data as key-value pairs.
   */
  public async all(
    scope: string = ConfigurationRepository.DEFAULT_SCOPE,
    scopeId: number = ConfigurationRepository.DEFAULT_SCOPE_ID
  ): Promise<Record<string, string>> {
    const records = await this.find({ scope, scope_id: scopeId })

    const data = records.reduce<Record<string, string>>((acc, record) => {
      acc[record.key] = record.value
      return acc
    }, {})

    return { ...ConfigurationRepository.DEFAULT_CONFIG, ...data }
  }
}
