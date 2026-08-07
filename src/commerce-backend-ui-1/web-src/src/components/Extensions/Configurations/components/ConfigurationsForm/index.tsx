/*
 * <license header>
 */

import React from 'react'
import { DataForm } from '@adobe-commerce/aio-experience-kit'
import { useConfigurationsForm } from '@components/Extensions/Configurations/hooks/useConfigurationsForm'

/**
 * Configurations Form Component
 *
 * A presentational component rendering the Subscription Price Manager business
 * configuration as a dynamic form, scoped to whichever scope is currently
 * selected in the Scope Picker. All business logic is delegated to the
 * useConfigurationsForm custom hook.
 *
 * `configuration` is already loaded by the parent (via `useConfigurationScope`,
 * from the same `configuration/load` response that builds the scope tree) —
 * this component does not issue its own load call. The parent must only
 * render this component once that load has actually finished, and must
 * remount it (e.g. via `key={`${scope}:${scopeId}`}`) whenever the scope
 * changes: `DataForm`'s fields are uncontrolled — they only read `editItem`
 * once, on mount — so mounting this component early (before data arrives) or
 * leaving it mounted across a scope change (a plain re-render) both leave
 * stale or blank values on screen.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Record<string, string>} props.actionCallHeaders - Authentication headers for runtime actions
 * @param {string} props.scope - Currently selected configuration scope
 * @param {number} props.scopeId - Currently selected configuration scope id
 * @param {Record<string, string>} props.configuration - Configuration already loaded for this scope
 *
 * @example
 * ```tsx
 * <ConfigurationsForm
 *   key={`${scope}:${scopeId}`}
 *   actionCallHeaders={headers}
 *   scope={scope}
 *   scopeId={scopeId}
 *   configuration={configuration}
 * />
 * ```
 */
export const ConfigurationsForm: React.FC<{
  actionCallHeaders: Record<string, string>
  scope: string
  scopeId: number
  configuration: Record<string, string>
}> = ({ actionCallHeaders, scope, scopeId, configuration }) => {
  // Use custom hook to manage form state and logic
  const { formFields, editItem, isSaving, onFormSubmit, onFormDismiss } = useConfigurationsForm(
    actionCallHeaders,
    scope,
    scopeId,
    configuration
  )

  return (
    <DataForm
      components={formFields}
      editItem={editItem}
      isProcessing={isSaving}
      onFormSubmit={onFormSubmit}
      onBackPress={onFormDismiss}
    />
  )
}
