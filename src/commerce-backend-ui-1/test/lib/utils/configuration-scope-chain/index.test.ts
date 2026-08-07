/*
 * <license header>
 */

import { ConfigurationScopeChain } from '@lib/utils/configuration-scope-chain'
import type { ScopeTreeNode } from '@lib/utils/store-scope-tree/types'

describe('ConfigurationScopeChain', () => {
  const scopeTree: ScopeTreeNode[] = [
    { scope: 'default', scopeId: 0, label: 'Default Config' },
    {
      scope: 'website',
      scopeId: 5,
      code: 'arcteryx',
      label: 'Arc`teryx',
      children: [
        {
          code: 'arcteryx',
          label: 'Arc`teryx',
          children: [
            { scope: 'store', scopeId: 23, code: 'arcteryx_en', label: 'Arc`teryx English' },
            { scope: 'store', scopeId: 26, code: 'arcteryx_zh', label: 'Arc`teryx Chinese' }
          ]
        }
      ]
    },
    {
      scope: 'website',
      scopeId: 2,
      code: 'outlet',
      label: 'Outlet',
      children: [
        {
          code: 'outlet',
          label: 'Outlet',
          children: [{ scope: 'store', scopeId: 2, code: 'outlet_en', label: 'Outlet English' }]
        }
      ]
    }
  ]

  it('resolves the default scope to just [default]', () => {
    expect(ConfigurationScopeChain.resolve(scopeTree, 'default', 0)).toEqual([
      { scope: 'default', scopeId: 0 }
    ])
  })

  it('resolves a website scope to [default, website]', () => {
    expect(ConfigurationScopeChain.resolve(scopeTree, 'website', 5)).toEqual([
      { scope: 'default', scopeId: 0 },
      { scope: 'website', scopeId: 5 }
    ])
  })

  it('resolves a store scope to [default, website, store], finding the owning website', () => {
    expect(ConfigurationScopeChain.resolve(scopeTree, 'store', 26)).toEqual([
      { scope: 'default', scopeId: 0 },
      { scope: 'website', scopeId: 5 },
      { scope: 'store', scopeId: 26 }
    ])
  })

  it('resolves a store scope belonging to a different website', () => {
    expect(ConfigurationScopeChain.resolve(scopeTree, 'store', 2)).toEqual([
      { scope: 'default', scopeId: 0 },
      { scope: 'website', scopeId: 2 },
      { scope: 'store', scopeId: 2 }
    ])
  })

  it('skips the website layer when the store view is not found in the tree', () => {
    expect(ConfigurationScopeChain.resolve(scopeTree, 'store', 999)).toEqual([
      { scope: 'default', scopeId: 0 },
      { scope: 'store', scopeId: 999 }
    ])
  })

  it('resolves an unrecognized scope to a single-entry chain', () => {
    expect(ConfigurationScopeChain.resolve(scopeTree, 'group', 1)).toEqual([
      { scope: 'group', scopeId: 1 }
    ])
  })
})
