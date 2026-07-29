/*
 * <license header>
 */

// ActionsForm component specific types

import type { AdobeIntegrationProps } from '../../types'

// ActionsForm component props extend the common Adobe integration props
// Using type alias since no additional properties are needed
export type ActionsFormProps = AdobeIntegrationProps

// Define types for the component state
export interface ActionsFormState {
  actionSelected: string | null
  actionResponse: unknown
  actionResponseError: string | null
  actionHeaders: Record<string, unknown> | null
  actionHeadersValid: 'valid' | 'invalid' | null
  actionParams: Record<string, unknown> | null
  actionParamsValid: 'valid' | 'invalid' | null
  actionInvokeInProgress: boolean
  actionResult: string
}

// Define type for actions config
export type ActionsConfig = Record<string, string>
