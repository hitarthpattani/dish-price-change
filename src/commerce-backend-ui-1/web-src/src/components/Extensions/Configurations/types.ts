/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/MainPage/utils/NavigationProvider/types'

/** Properties required by the configuration screen. */
export interface ConfigurationsProps {
  /** Authentication and organization headers forwarded to backend actions. */
  actionCallHeaders: ActionCallHeaders
}

/** Root "Default Config" scope entry returned by the configuration/load action. */
export interface DefaultScopeTreeNode {
  scope: 'default'
  scopeId: number
  label: string
}

/** Selectable store view scope, nested under a store group. */
export interface StoreViewScopeTreeNode {
  scope: 'store'
  scopeId: number
  code: string
  label: string
}

/** Non-selectable store group grouping node. */
export interface StoreGroupTreeNode {
  code: string
  label: string
  children: StoreViewScopeTreeNode[]
}

/** Selectable website scope, nesting its store groups. */
export interface WebsiteScopeTreeNode {
  scope: 'website'
  scopeId: number
  code: string
  label: string
  children: StoreGroupTreeNode[]
}

/** Full scope tree returned by the configuration/load action. */
export type ScopeTreeNode = DefaultScopeTreeNode | WebsiteScopeTreeNode

/** Response payload from the configuration/load action. */
export interface ConfigurationLoadResponse {
  configuration: Record<string, string>
  scope: string
  scopeId: number
  scopeTree: ScopeTreeNode[]
}

/** Response payload from the configuration/save action. */
export interface ConfigurationSaveResponse {
  configuration: Record<string, string>
  scope: string
  scopeId: number
}

/** A single selectable scope, formatted for the Scope Picker. */
export interface ScopePickerItem {
  key: string
  label: string
}

/** A Picker section grouping the scopes that belong to one website. */
export interface ScopePickerSection {
  key: string
  title: string
  items: ScopePickerItem[]
}
