# AIO Toolkit: Create Event Consumer Action

**Command Name:** `aio-toolkit-create-event-consumer-action`

**Description:** Creates event consumer actions using @adobe-commerce/aio-toolkit for Adobe I/O Events with InfiniteLoopBreaker support

## Workflow

This command creates event consumer actions that handle Adobe I/O Events with optional infinite loop prevention.

### Step 1: Verify Prerequisites

1. Check if `@adobe-commerce/aio-toolkit` is installed in `package.json`
   - If NOT installed, ask user if they want to install it: `npm install @adobe-commerce/aio-toolkit`
2. Detect project language (TypeScript or JavaScript)
   - Check for `typescript` in dependencies + `tsconfig.json`
   - Check for `.ts` files in `actions/` or `lib/`
   - Default to JavaScript if ambiguous
3. Detect project structure
   - Check for `application:` in `app.config.yaml` (root actions)
   - Check for `extensions:` in `app.config.yaml` (extension point actions)

### Step 2: Collect Configuration

Ask the user:

1. **Action Location & Organization**
   - Root application - direct, existing package, or new package
   - Extension point - direct, existing package, or new package
   - If new package with hyphen (e.g., `commerce-product`), ask:
     - Nested: `actions/commerce/product/` (provider-entity)
     - Flat: `actions/commerce-product/` (single-purpose)

2. **Event Handling Pattern**
   - **Single Event Type**: One action handles one specific event
   - **Multiple Event Types**: Consumer routes events to multiple sub-actions
   - Note: Multiple event types always requires package structure

#### For Single Event Type:

3. **Action Name** (required)
   - If direct: `product-created`, `order-validator`
   - If packaged: `created`, `updated`, `deleted`

4. **Event Type** (required)
   - Example: `com.adobe.commerce.observer.catalog_product_save_commit_after`
   - Full Adobe I/O event type string

5. **Required Parameters** (comma-separated)
   - Note: `type` is always included automatically
   - Additional parameters: `data.value.sku`, `data.value.email`

6. **InfiniteLoopBreaker** (optional, recommended)
   - Enable to prevent infinite event loops
   - If Yes, ask:
     - **Key Function Name**: e.g., `commerce-product-processing-key`
     - **Fingerprint Fields**: e.g., `sku, description`
     - **Event Types to Monitor**: e.g., `["com.adobe.commerce.observer.catalog_product_save_commit_after"]`
     - **TTL (seconds)**: Default 60 seconds

7. **Authentication**
   - Require Adobe authentication (default: Yes)

8. **Business Logic Description**
   - What should this consumer do?

#### For Multiple Event Types:

3. **Consumer Name** (required)
   - Example: `consumer`, `product-consumer`, `order-consumer`
   - Routes events from I/O Events to sub-actions

4. **Sub-actions** (comma-separated)
   - Example: `created, updated, deleted`
   - These are invoked by consumer based on event type

5. **Event Types** (comma-separated)
   - Example: `com.adobe.commerce.observer.catalog_product_save_commit_after, com.adobe.commerce.observer.catalog_product_delete_commit_after`

6. **Required Parameters** (comma-separated)
   - Note: `type` is always included
   - Additional parameters needed for routing/processing

7. **Event Routing Mapping**
   - Map each event type to its sub-action
   - Example: `catalog_product_save_commit_after` → `created`
   - Example: `catalog_product_delete_commit_after` → `deleted`

8. **InfiniteLoopBreaker** (optional)
   - Same sub-questions as single event type

9. **Authentication**
   - Require Adobe authentication (default: Yes)
   - Applies to consumer and all sub-actions

10. **Business Logic**
    - Describe what each sub-action should do

### Step 3: Confirm Configuration

Display summary:

```
📋 Event Consumer Action Configuration

Pattern: [Single Event Type / Multiple Event Types]
Language: [JavaScript/TypeScript] (auto-detected)
Location: [Root/Extension]
Package: [package-name or direct]

[If Single Event Type]
Action Name: [action-name]
Event Type: [event-type]
Required Parameters: [params]
InfiniteLoopBreaker: [Enabled/Disabled]
[If enabled]
  Key Function: [key-name]
  Fingerprint Fields: [fields]
  Monitored Events: [event-types]
  TTL: [seconds]s

[If Multiple Event Types]
Package: [package-name]
Consumer: [consumer-name]
Sub-actions: [action1, action2, action3]
Event Types: [event-types]
Event Routing:
  - [event-type-1] → [sub-action-1]
  - [event-type-2] → [sub-action-2]
InfiniteLoopBreaker: [Enabled/Disabled]

Authentication: [Required/Not Required]
Web Access: No (always for event consumers)
Business Logic: [description]

✅ Files to Create:
[If Single Event Type]
- actions/[path]/[action-name]/index.[js/ts]
[- actions/[package]/actions.config.yaml if packaged]
- Update app.config.yaml or ext.config.yaml

[If Multiple Event Types]
- actions/[package]/[consumer-name]/index.[js/ts]
- actions/[package]/[sub-action1]/index.[js/ts]
- actions/[package]/[sub-action2]/index.[js/ts]
- actions/[package]/actions.config.yaml
- Update app.config.yaml or ext.config.yaml

Should I proceed?
```

### Step 4: Generate Event Consumer Action

**Directory Structures:**

**Single Event Type - No Package:**
```
actions/
└── [action-name]/
    └── index.[js/ts]
```

**Single Event Type - With Package:**
```
actions/
└── [package]/
    ├── actions.config.yaml
    └── [action-name]/
        └── index.[js/ts]
```

**Multiple Event Types:**
```
actions/
└── [package]/
    ├── actions.config.yaml
    ├── [consumer-name]/
    │   └── index.[js/ts]
    ├── [sub-action1]/
    │   └── index.[js/ts]
    └── [sub-action2]/
        └── index.[js/ts]
```

#### Single Event Type Consumer Template

**JavaScript:**

```javascript
const {
  EventConsumerAction,
  RuntimeActionResponse,
  HttpStatus,
  InfiniteLoopBreaker, // If enabled
} = require('@adobe-commerce/aio-toolkit');
const name = '[action-name]';

exports.main = EventConsumerAction.execute(
  name,
  ['type' /* , other required params */],
  [],
  async (params, ctx) => {
    const { logger } = ctx;
    logger.info({ message: `${name}-received`, params: JSON.stringify(params) });

    // InfiniteLoopBreaker check (if enabled)
    const isLoop = await InfiniteLoopBreaker.isInfiniteLoop({
      keyFn: '[key-function-name]',
      fingerprintFn: () => ({ sku: params.data.value.sku /* fingerprint fields */ }),
      eventTypes: ['[event-type]'],
      event: params.type,
    });
    if (isLoop) {
      logger.info(`Infinite loop detected for event ${params.type}`);
      return RuntimeActionResponse.success(
        `event discarded to prevent infinite loop(${params.type})`
      );
    }

    try {
      // TODO: Implement business logic
      
      logger.info({ message: `${name}-success` });

      // Store fingerprint (if InfiniteLoopBreaker enabled)
      await InfiniteLoopBreaker.storeFingerPrint(
        '[key-function-name]',
        () => ({ sku: params.data.value.sku /* fingerprint fields */ }),
        60 // TTL in seconds
      );

      return RuntimeActionResponse.success({
        success: true,
        message: 'Event consumed successfully',
      });
    } catch (error) {
      logger.error({ message: `${name}-error`, error: error.message, stack: error.stack });
      return RuntimeActionResponse.error(
        HttpStatus.INTERNAL_ERROR,
        `Failed to process event: ${error.message}`
      );
    }
  }
);
```

**TypeScript:** Same with type annotations and `import` syntax

#### Multiple Event Types Templates

**Consumer (JavaScript):**

```javascript
const {
  EventConsumerAction,
  RuntimeActionResponse,
  Openwhisk,
  HttpStatus,
  InfiniteLoopBreaker, // If enabled
} = require('@adobe-commerce/aio-toolkit');
const name = '[package-name]-[consumer-name]';

exports.main = EventConsumerAction.execute(
  name,
  ['type' /* , other required params */],
  [],
  async (params, ctx) => {
    const { logger } = ctx;
    const openwhisk = new Openwhisk(params.API_HOST, params.API_AUTH);
    logger.info(`Event type received: ${params.type}`);

    // InfiniteLoopBreaker check (if enabled)
    const isLoop = await InfiniteLoopBreaker.isInfiniteLoop({
      keyFn: '[key-function-name]',
      fingerprintFn: () => ({ /* fingerprint fields */ }),
      eventTypes: ['[event-type-1]', '[event-type-2]'],
      event: params.type,
    });
    if (isLoop) {
      return RuntimeActionResponse.success('event discarded to prevent infinite loop');
    }

    let response, statusCode;

    // Route to sub-action based on event type
    switch (params.type) {
      case '[event-type-1]':
        logger.info('Invoking [sub-action-1]');
        const res1 = await openwhisk.execute(
          '[package-name]/[sub-action-1]',
          params.data.value
        );
        response = res1?.response?.result?.body;
        statusCode = res1?.response?.result?.statusCode;
        break;
      
      case '[event-type-2]':
        logger.info('Invoking [sub-action-2]');
        const res2 = await openwhisk.execute(
          '[package-name]/[sub-action-2]',
          params.data.value
        );
        response = res2?.response?.result?.body;
        statusCode = res2?.response?.result?.statusCode;
        break;
      
      default:
        return RuntimeActionResponse.error(
          HttpStatus.BAD_REQUEST,
          `Unsupported event type: ${params.type}`
        );
    }

    if (!response.success) {
      return RuntimeActionResponse.error(statusCode, response.error);
    }

    // Store fingerprint (if InfiniteLoopBreaker enabled)
    await InfiniteLoopBreaker.storeFingerPrint(
      '[key-function-name]',
      () => ({ /* fingerprint fields */ }),
      60 // TTL
    );

    return RuntimeActionResponse.success(response);
  }
);
```

**Sub-action (JavaScript):**

```javascript
const {
  OpenwhiskAction,
  RuntimeActionResponse,
  HttpStatus,
} = require('@adobe-commerce/aio-toolkit');
const name = '[sub-action-name]';

exports.main = OpenwhiskAction.execute(name, async (params, ctx) => {
  const { logger } = ctx;
  logger.info({ message: `${name}-processing`, params: JSON.stringify(params) });

  try {
    // TODO: Implement sub-action business logic
    
    logger.info({ message: `${name}-success` });
    return RuntimeActionResponse.success({
      success: true,
      message: 'Processed successfully',
    });
  } catch (error) {
    logger.error({ message: `${name}-error`, error: error.message, stack: error.stack });
    return RuntimeActionResponse.error(
      HttpStatus.INTERNAL_ERROR,
      `Failed to process: ${error.message}`
    );
  }
});
```

**TypeScript:** Same with type annotations and `import` syntax

### Step 5: Update Configuration Files

#### Action Configuration

**Single Event Type - Direct in config:**

```yaml
[action-name]:
  function: actions/[action-name]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    require-adobe-auth: [true/false]
    final: true
```

**Single Event Type - Packaged:**

Create `actions/[package]/actions.config.yaml`:
```yaml
[action-name]:
  function: [action-name]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    require-adobe-auth: [true/false]
    final: true
```

Reference in `app.config.yaml` or `ext.config.yaml`:
```yaml
runtimeManifest:
  packages:
    [package-name]:
      license: Apache-2.0
      actions:
        $include: ./actions/[package]/actions.config.yaml
```

**Multiple Event Types:**

Create `actions/[package]/actions.config.yaml`:
```yaml
[consumer-name]:
  function: [consumer-name]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    require-adobe-auth: [true/false]
    final: true

[sub-action-1]:
  function: [sub-action-1]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    require-adobe-auth: [true/false]
    final: true

[sub-action-2]:
  function: [sub-action-2]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    require-adobe-auth: [true/false]
    final: true
```

### Step 6: Completion

Display:

```
✅ Event Consumer Action Created Successfully!

📁 Files Created:
[If Single Event Type]
- actions/[path]/index.[js/ts]
[- actions/[package]/actions.config.yaml if packaged]

[If Multiple Event Types]
- actions/[package]/[consumer-name]/index.[js/ts]
- actions/[package]/[sub-action1]/index.[js/ts]
- actions/[package]/[sub-action2]/index.[js/ts]
- actions/[package]/actions.config.yaml

📝 Configuration Updated:
- app.config.yaml or ext.config.yaml

🚀 Next Steps:
1. Implement business logic in consumer/sub-actions
2. Register action with Adobe I/O Events in Adobe Developer Console
3. Set up event providers and subscriptions
4. Test locally: aio app dev
5. Deploy: aio app deploy
6. Test with real events from Adobe I/O

📖 Documentation:
- EventConsumerAction: @adobe-commerce/aio-toolkit
- Adobe I/O Events: https://developer.adobe.com/events/

⚙️ Event Registration:
[If Single Event Type]
- Register: [action-name] with Adobe I/O Events
- Event Type: [event-type]

[If Multiple Event Types]
- Register: [consumer-name] only (not sub-actions)
- Event Types: [all event types]
- Consumer routes to sub-actions internally

🔁 InfiniteLoopBreaker:
[If enabled]
- Prevents infinite event loops
- Key Function: [key-function-name]
- Fingerprint: [fingerprint-fields]
- TTL: [ttl] seconds
- Monitors: [event-types]
```

### Key Features

- **Auto-detection**: Language (TS/JS) and project structure
- **Two Patterns**: Single event type (simple) or multiple event types (consumer + sub-actions)
- **InfiniteLoopBreaker**: Prevents infinite event loops with fingerprint-based detection
- **Package Organization**: Flat or nested structures (e.g., `commerce-product` → `commerce/product/`)
- **Event Routing**: Consumer uses Openwhisk to invoke sub-actions based on event type
- **Web Access**: Always `web: 'no'` (internal only, not web-accessible)
- **Best Practices**: Structured logging, error handling, telemetry-ready

### Action Classes

**EventConsumerAction.execute(name, requiredParams, requiredHeaders, actionFn)**
- Used for all consumers (single and multi-event)
- Receives events from Adobe I/O Events
- Provides validation, logging, telemetry, error handling
- Required params always include `"type"`

**OpenwhiskAction.execute(name, actionFn)**
- Used for sub-actions in multiple event type pattern
- Invoked by consumer, not directly by I/O Events
- Provides logging, telemetry, error handling
- No HTTP method or parameter validation

**Openwhisk Class**
- Constructor: `new Openwhisk(params.API_HOST, params.API_AUTH)`
- Method: `execute(actionName, params)` - Invokes another action
- Returns: `{ response: { result: { statusCode, body } } }`
- Used by consumer to route events to sub-actions

**InfiniteLoopBreaker Class**
- `isInfiniteLoop(config)` - Checks if event is part of infinite loop
  - `keyFn`: Unique key function name for this loop detection
  - `fingerprintFn`: Function returning fingerprint object (e.g., `{ sku, description }`)
  - `eventTypes`: Array of event types to monitor
  - `event`: Current event type from params.type
  - Returns: `true` if loop detected, `false` otherwise
- `storeFingerPrint(keyFn, fingerprintFn, ttl)` - Stores fingerprint after successful processing
  - `keyFn`: Same key function name used in isInfiniteLoop
  - `fingerprintFn`: Same fingerprint function
  - `ttl`: Time-to-live in seconds (default: 60)

### Package Organization

**Flat Structure** (single-purpose):
- `order-management` → `actions/order-management/`
- Simple, all actions related to one entity

**Nested Structure** (provider-entity):
- `commerce-product` → `actions/commerce/product/`
- `sap-order` → `actions/sap/order/`
- Clear separation of provider and entity

### Important Notes

1. **Web Access**: Event consumers are ALWAYS `web: 'no'` (not web-accessible)
2. **Required Parameters**: Always include `"type"` for event type identification
3. **Event Registration**: 
   - Single event type: Register the action itself
   - Multiple event types: Register only consumer (not sub-actions)
4. **InfiniteLoopBreaker**: Essential when action might trigger the same event it's consuming
5. **Error Handling**: Return success even for expected errors to avoid retries
6. **Routing**: Consumer is lightweight, only routes; sub-actions do the heavy processing
7. **Sub-action Reusability**: Sub-actions can be reused by different consumers

### Related Rules

- **Setting up New Relic Telemetry**: Add observability to your event consumer
- **Using PublishEvent**: Publish CloudEvents to Adobe I/O Events from your consumer (fan-out pattern)
- **Using RuntimeApiGatewayService**: Call a web-exposed Runtime action via API Gateway from your consumer
- **Using FileRepository**: Persist and retrieve records using Adobe I/O Files storage from your consumer action
- **Using AbdbCollection**: Add MongoDB-backed App Builder Data storage with schema validation to your consumer action
- **Using AbdbRepository**: Add full CRUD operations (insert, find, update, delete, pagination) on top of an AbdbCollection in your consumer action
- **Using Amazon SQS — Publish**: Publish messages to an Amazon SQS queue from your consumer action (fan-out to SQS after processing an I/O Event)

