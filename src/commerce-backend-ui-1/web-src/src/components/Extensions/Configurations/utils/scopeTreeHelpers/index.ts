/*
 * <license header>
 */

import { DEFAULT_SCOPE_KEY, CONFIGURATION_TEXT } from '../configurationConstants'
import type {
  ScopeTreeNode,
  WebsiteScopeTreeNode,
  ScopePickerItem,
  ScopePickerSection
} from '../../types'

/**
 * Scope Tree Helpers
 *
 * Flattens the backend Default Config -> Website -> Store Group -> Store View
 * tree into the shape the Scope Picker renders. `Picker` only supports one
 * level of Section > Item nesting, so store groups are folded into the
 * store view item labels rather than rendered as their own section.
 */

const scopeKey = (scope: string, scopeId: number): string => `${scope}:${scopeId}`

/** Website id of Commerce's built-in "Admin" website, excluded from the Scope Picker. */
const ADMIN_WEBSITE_ID = 0

const isWebsiteNode = (node: ScopeTreeNode): node is WebsiteScopeTreeNode =>
  node.scope === 'website' && node.scopeId !== ADMIN_WEBSITE_ID

/**
 * Builds a single website's Picker section, listing the website itself
 * followed by its store views (disambiguated by store group when a website
 * has more than one group).
 */
const toWebsiteSection = (website: WebsiteScopeTreeNode): ScopePickerSection => {
  const hasMultipleGroups = website.children.length > 1

  const storeViewItems = website.children.flatMap(storeGroup =>
    storeGroup.children.map(storeView => ({
      key: scopeKey(storeView.scope, storeView.scopeId),
      label: hasMultipleGroups ? `${storeGroup.label}: ${storeView.label}` : storeView.label
    }))
  )

  return {
    // Prefixed so this Section's key never collides with its own "All Store Views" Item key below
    // (react-aria's collection builder keys Sections and Items in the same flat map).
    key: `section-${scopeKey(website.scope, website.scopeId)}`,
    title: website.label,
    items: [
      {
        key: scopeKey(website.scope, website.scopeId),
        label: `All Store Views (${website.label})`
      },
      ...storeViewItems
    ]
  }
}

/**
 * Converts the backend scope tree into one Picker section per website.
 *
 * @param scopeTree - Scope tree returned by the configuration/load action
 * @returns One `ScopePickerSection` per website in the tree
 */
export const toScopePickerSections = (scopeTree: ScopeTreeNode[]): ScopePickerSection[] =>
  scopeTree.filter(isWebsiteNode).map(toWebsiteSection)

/**
 * Extracts the "Default Config" entry as a Picker item, falling back to
 * `default:0` if the backend tree is missing it.
 *
 * @param scopeTree - Scope tree returned by the configuration/load action
 * @returns The "Default Config" Picker item
 */
export const toDefaultScopeItem = (scopeTree: ScopeTreeNode[]): ScopePickerItem => {
  const defaultNode = scopeTree.find(node => node.scope === 'default')
  return defaultNode
    ? { key: scopeKey(defaultNode.scope, defaultNode.scopeId), label: defaultNode.label }
    : { key: DEFAULT_SCOPE_KEY, label: CONFIGURATION_TEXT.DEFAULT_SCOPE_LABEL }
}
