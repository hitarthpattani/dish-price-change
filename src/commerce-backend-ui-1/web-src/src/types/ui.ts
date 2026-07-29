/*
 * <license header>
 */

// UI Component Types
import type React from 'react'

/**
 * Error boundary state tracking
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary component props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean
  message?: string
}
