/*
 * <license header>
 */

/* This file exposes the ConfigurationRepository class */

import { AbdbRepository } from '@adobe-commerce/aio-toolkit'
import type { AbdbRepositoryFilter } from '@adobe-commerce/aio-toolkit'
import { ConfigurationCollection } from '@lib/database/collection/configuration'
import type { ConfigurationRecord } from '@lib/database/collection/configuration/types'
import { ConfigurationScopeChain } from '@lib/utils/configuration-scope-chain'
import type { ScopeTreeNode } from '@lib/utils/store-scope-tree/types'

/**
 * Repository for the `configuration` ABDB collection.
 *
 * Provides a simple key-value API on top of the underlying ABDB CRUD operations:
 * - {@link get} — retrieve a single value, inheriting down a `default` -> `website` -> `store`
 *   scope chain
 * - {@link set} — upsert one or more key-value pairs for one exact scope (writes never inherit)
 * - {@link all} — return the full configuration map, merged across a scope chain
 *
 * `get`/`all` take a single `scope`/`scopeId`, and internally resolve the `default` -> `website`
 * -> `store` inheritance chain (via `ConfigurationScopeChain`) using the scope tree passed to the
 * constructor. Each layer is read independently and merged broadest to narrowest, so a narrower
 * layer's value only overrides a broader one where it actually has one — matching Adobe
 * Commerce's own configuration fallback model. `set` has no such concept: a save always targets
 * one exact scope.
 */
export class ConfigurationRepository extends AbdbRepository<ConfigurationRecord> {
  /** Default configuration data */
  private static readonly DEFAULT_CONFIG: Record<string, string> = {
    price_change_enable: '0'
  }

  /** Scope applied when the caller does not specify one. */
  private static readonly DEFAULT_SCOPE = 'default'

  /** Scope id applied when the caller does not specify one. */
  private static readonly DEFAULT_SCOPE_ID = 0

  /** Commerce scope tree used to resolve the scope inheritance chain for `get`/`all`. */
  private readonly scopeTree: ScopeTreeNode[]

  /**
   * @param token - A valid IMS access token used to authenticate ABDB requests.
   * @param scopeTree - Commerce scope tree (see `StoreScopeTree.build()`), used to resolve the
   *   `default` -> `website` -> `store` inheritance chain for `get`/`all`.
   */
  constructor(token: string, scopeTree: ScopeTreeNode[]) {
    super(new ConfigurationCollection(), token)
    this.scopeTree = scopeTree
  }

  /**
   * Wraps `findOne`, treating the "Document not found" error the underlying ABDB
   * client throws on a miss as a `null` result — matching `findOne`'s own documented
   * return type (`Promise<T | null>`), which its actual runtime behavior violates.
   * Any other error is rethrown unchanged.
   *
   * @param filter - Query filter passed through to `findOne`.
   * @returns The matched record, or `null` if none was found.
   */
  private async findOneOrNull(filter: AbdbRepositoryFilter): Promise<ConfigurationRecord | null> {
    try {
      return await this.findOne(filter)
    } catch (error) {
      if (error instanceof Error && /document not found/i.test(error.message)) {
        return null
      }
      throw error
    }
  }

  /**
   * Retrieves a configuration value, inheriting down the `default` -> `website` -> `store`
   * scope chain.
   *
   * Starts from `DEFAULT_CONFIG`'s fallback (if any), then applies each layer of the scope
   * chain resolved for `scope`/`scopeId` in order (broadest to narrowest) — a layer only
   * overrides the running value where it has a non-empty value of its own, so a narrower
   * scope with no override for this key falls through to whatever a broader one resolved to.
   *
   * @param key - Configuration key to retrieve.
   * @param scope - Configuration scope to read from (e.g. `default`, `website`, `store`).
   *   Defaults to `default`.
   * @param scopeId - Identifier of the scope entity to read from. Defaults to `0`.
   * @returns Configuration value or null if not found.
   */
  public async get(
    key: string,
    scope: string = ConfigurationRepository.DEFAULT_SCOPE,
    scopeId: number = ConfigurationRepository.DEFAULT_SCOPE_ID
  ): Promise<string | null> {
    const scopeChain = ConfigurationScopeChain.resolve(this.scopeTree, scope, scopeId)
    const records = await Promise.all(
      scopeChain.map(entry =>
        this.findOneOrNull({ key, scope: entry.scope, scope_id: entry.scopeId })
      )
    )

    let value: string | null = Object.prototype.hasOwnProperty.call(
      ConfigurationRepository.DEFAULT_CONFIG,
      key
    )
      ? ConfigurationRepository.DEFAULT_CONFIG[key]!
      : null

    for (const record of records) {
      if (record?.value) {
        value = record.value
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
        const existing = await this.findOneOrNull(filter)
        if (existing) {
          await this.updateOne({ value }, filter)
        } else {
          await this.insertOne({ key, value, scope, scope_id: scopeId })
        }
      })
    )
  }

  /**
   * Retrieves all configuration data for the `default` -> `website` -> `store` scope chain
   * resolved for `scope`/`scopeId`.
   *
   * Fetches every layer of the resolved chain independently and merges them in order
   * (broadest to narrowest) over `DEFAULT_CONFIG`, so a narrower scope's stored keys override
   * a broader scope's, but any key a narrower scope doesn't have falls through to the broader
   * one.
   *
   * @param scope - Configuration scope to read from (e.g. `default`, `website`, `store`).
   *   Defaults to `default`.
   * @param scopeId - Identifier of the scope entity to read from. Defaults to `0`.
   * @returns All configuration data as key-value pairs.
   */
  public async all(
    scope: string = ConfigurationRepository.DEFAULT_SCOPE,
    scopeId: number = ConfigurationRepository.DEFAULT_SCOPE_ID
  ): Promise<Record<string, string>> {
    const scopeChain = ConfigurationScopeChain.resolve(this.scopeTree, scope, scopeId)
    const layers = await Promise.all(
      scopeChain.map(entry => this.find({ scope: entry.scope, scope_id: entry.scopeId }))
    )

    const data = layers.reduce<Record<string, string>>((acc, records) => {
      for (const record of records) {
        acc[record.key] = record.value
      }
      return acc
    }, {})

    return { ...ConfigurationRepository.DEFAULT_CONFIG, ...data }
  }
}
