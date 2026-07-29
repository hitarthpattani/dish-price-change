import { defineConfig } from '@adobe/aio-commerce-lib-app/config'

export default defineConfig({
  metadata: {
    id: 'adobe-commerce-app-builder-starter-kit',
    displayName: 'Adobe Commerce App Builder Starter Kit',
    version: '1.0.0',
    description: 'A custom Adobe Commerce application. Fill description for your app.'
  },
  businessConfig: {
    schema: [
      {
        type: 'list',
        name: 'sampleList',
        label: 'Sample List',
        selectionMode: 'multiple',
        default: ['a'],
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' }
        ]
      },
      {
        type: 'text',
        name: 'sampleText',
        label: 'Sample Text',
        default: 'Hello, world!'
      }
    ]
  },
  eventing: {
    commerce: [
      {
        provider: {
          label: 'Commerce Events',
          description: 'A description for your Commerce Events.'
        },
        events: [
          {
            name: 'observer.checkout_submit_all_after',
            label: 'Checkout Submit All After',
            fields: [{ name: 'order' }],
            runtimeActions: ['commerce-events/checkout-submit-consumer'],
            description: 'Triggered when a checkout is submitted'
          }
        ]
      }
    ]
  }
})
