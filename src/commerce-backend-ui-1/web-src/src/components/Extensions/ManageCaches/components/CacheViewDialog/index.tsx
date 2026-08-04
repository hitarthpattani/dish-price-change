/*
 * <license header>
 */

import React from 'react'
import {
  Dialog,
  DialogContainer,
  Heading,
  Divider,
  Content,
  Text,
  View,
  Flex,
  Button,
  ButtonGroup
} from '@adobe/react-spectrum'
import type { CacheGridItem } from '@components/Extensions/ManageCaches/types'

/**
 * Cache View Dialog Component
 *
 * Displays detailed information about a cache entry in a modal dialog.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {CacheGridItem | null} props.item - Cache item to display
 * @param {Function} props.onClose - Function to call when dialog is closed
 *
 * @example
 * ```tsx
 * <CacheViewDialog
 *   isOpen={true}
 *   item={{ id: 'test', key: 'TEST', value: '...', expiration: '2024-12-31' }}
 *   onClose={() => console.log('closed')}
 * />
 * ```
 */
export const CacheViewDialog: React.FC<{
  isOpen: boolean
  item: CacheGridItem | null
  onClose: () => void
}> = ({ isOpen, item, onClose }) => {
  if (!item) return null

  // Try to parse and format JSON values
  let formattedValue = item.value
  try {
    const parsed = JSON.parse(item.value)
    formattedValue = JSON.stringify(parsed, null, 2)
  } catch {
    // Not JSON or already a string, use as-is
  }

  return (
    <DialogContainer onDismiss={onClose}>
      {isOpen && (
        <Dialog size="L">
          <Heading>Cache Details</Heading>
          <Divider />
          <Content>
            <Flex direction="column" gap="size-200">
              {/* Cache ID */}
              <View>
                <Text UNSAFE_style={{ fontWeight: 'bold', fontSize: '14px' }}>Cache:</Text>
                <Text UNSAFE_style={{ fontSize: '14px', marginTop: '4px' }}>{item.id}</Text>
              </View>

              {/* Expiration */}
              <View>
                <Text UNSAFE_style={{ fontWeight: 'bold', fontSize: '14px' }}>Expiration:</Text>
                <Text UNSAFE_style={{ fontSize: '14px', marginTop: '4px' }}>{item.expiration}</Text>
              </View>

              {/* Value */}
              <View>
                <Text UNSAFE_style={{ fontWeight: 'bold', fontSize: '14px' }}>Value:</Text>
                <View
                  backgroundColor="gray-100"
                  padding="size-150"
                  marginTop="size-100"
                  UNSAFE_style={{
                    borderRadius: '4px',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {formattedValue}
                  </pre>
                </View>
              </View>
            </Flex>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={onClose}>
              Close
            </Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogContainer>
  )
}
