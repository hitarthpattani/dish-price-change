/*
 * <license header>
 */

import React from 'react'

/** Headers forwarded from the UI shell to authenticated runtime actions. */
export type ActionCallHeaders = Record<string, string>

/** Navigation-button definition consumed by the application shell. */
export interface NavigationButton {
  /** User-facing navigation label. */
  label: string

  /** Client-side route opened by the button. */
  path: string

  /** Optional icon rendered beside the label. */
  icon?: React.ReactNode
}

/** Route definition consumed by the application shell. */
export interface NavigationRoute {
  /** Client-side paths that render the component. */
  paths: string[]

  /** Content rendered when one of the paths matches. */
  component: React.ReactNode
}
