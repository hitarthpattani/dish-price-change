/*
 * <license header>
 */

import React, { Component } from 'react'
import { ExtensionRegistration } from '@components/ExtensionRegistration'
import type { AppProps } from './types'
import type { ConfigurationData, HistoryData } from '@web/types'
import type { ErrorBoundaryState, ErrorBoundaryProps } from '@web/types/ui'

// Error Boundary Component
class CustomErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <React.Fragment>
          <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Something went wrong :(</h1>
          <pre>{this.state.error?.message || 'Unknown error'}</pre>
        </React.Fragment>
      )
    }

    return this.props.children
  }
}

// Main App Component
const App: React.FC<AppProps> = props => {
  console.log('runtime object:', props.runtime)
  console.log('ims object:', props.ims)

  // use exc runtime event handlers
  // respond to configuration change events (e.g. user switches org)
  props.runtime.on('configuration', (data: unknown) => {
    const { imsOrg, imsToken, locale } = data as ConfigurationData
    console.log('configuration change', { imsOrg, imsToken, locale })
  })

  // respond to history change events
  props.runtime.on('history', (data: unknown) => {
    const { type, path } = data as HistoryData
    console.log('history change', { type, path })
  })

  return (
    <CustomErrorBoundary>
      <ExtensionRegistration runtime={props.runtime} ims={props.ims} />
    </CustomErrorBoundary>
  )
}

export default App
