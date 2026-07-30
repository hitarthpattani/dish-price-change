/*
 * <license header>
 */

import React from 'react'

export type ActionCallHeaders = Record<string, string>

export interface NavigationButton {
  label: string
  path: string
  icon?: React.ReactNode
}

export interface NavigationRoute {
  paths: string[]
  component: React.ReactNode
}
