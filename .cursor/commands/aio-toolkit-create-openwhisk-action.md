# AIO Toolkit: Create OpenWhisk Action

**Command Name:** `aio-toolkit-create-openwhisk-action`

**Description:** Creates an OpenWhisk action using @adobe-commerce/aio-toolkit — for action-to-action invocation, orchestration, and sub-action patterns

## Workflow

This command creates actions that are invoked by other actions (not directly by HTTP), and optionally use the `Openwhisk` client to invoke downstream actions.

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

### Step 2: Collect Action Configuration

Ask the user:

1. **Action Name** (required)
   - Example: `process-order`, `validate-product`, `sync-customer`

2. **Action Role**
   - **Sub-action target** — invoked by a consumer/orchestrator; does focused processing, no further action invocation
   - **Orchestrator** — invokes one or more downstream actions using the `Openwhisk` client

3. **Action Location** (auto-detect or ask)
   - Root application (`actions/`)
   - Extension point (`[extension-path]/actions/`)

4. **Package Structure**
   - Simple: `actions/[action-name]/index.[js/ts]`
   - Packaged: `actions/[package]/[action-name]/index.[js/ts]`
   - If packaged, ask for package name

5. **If Orchestrator: Downstream Actions to Invoke**
   - Action names to invoke (e.g., `my-package/validate-order`, `my-package/send-notification`)
   - Invocation mode for each: **Blocking** (wait for result, default) or **Non-blocking** (fire and forget)

6. **Business Logic Description**
   - What should this action do?

### Step 3: Confirm Configuration

Display summary:

```
📋 OpenWhisk Action Configuration

Action Name: [name]
Language: [JavaScript/TypeScript] (auto-detected)
Role: [Sub-action target / Orchestrator]
Location: [Root/Extension]
Package: [package-name or simple]
[If Orchestrator]
  Downstream Actions:
    - [action-name] ([blocking/non-blocking])

Business Logic: [description]

✅ Files to Create:
- actions/[path]/index.[js/ts]
- Update app.config.yaml or ext.config.yaml
[- actions/[package]/actions.config.yaml if packaged]

Should I proceed?
```

### Step 4: Generate OpenWhisk Action

#### Sub-action Template

**JavaScript:**

```javascript
const {
  OpenwhiskAction,
  RuntimeActionResponse,
  HttpStatus,
} = require('@adobe-commerce/aio-toolkit');
const name = '[action-name]';

exports.main = OpenwhiskAction.execute(name, async (params, ctx) => {
  const { logger } = ctx;
  logger.info({ message: `${name}-processing`, params: JSON.stringify(params) });

  try {
    // TODO: Implement business logic
    // params contains everything passed by the calling consumer/orchestrator

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

#### Orchestrator Template (blocking invocations)

**JavaScript:**

```javascript
const {
  OpenwhiskAction,
  Openwhisk,
  RuntimeActionResponse,
  HttpStatus,
} = require('@adobe-commerce/aio-toolkit');
const name = '[action-name]';

exports.main = OpenwhiskAction.execute(name, async (params, ctx) => {
  const { logger } = ctx;

  // API_HOST and API_AUTH must be provided as action inputs
  const openwhisk = new Openwhisk(params.API_HOST, params.API_AUTH);

  logger.info({ message: `${name}-start` });

  try {
    // Blocking invocation — waits for the downstream action to complete
    const result = await openwhisk.execute(
      '[package]/[downstream-action]',
      { /* params to pass */ }
    );

    const body = result?.response?.result?.body;
    const statusCode = result?.response?.result?.statusCode;

    if (statusCode >= 400) {
      return RuntimeActionResponse.error(statusCode, body?.error || 'Downstream action failed');
    }

    logger.info({ message: `${name}-success` });
    return RuntimeActionResponse.success(body);
  } catch (error) {
    logger.error({ message: `${name}-error`, error: error.message, stack: error.stack });
    return RuntimeActionResponse.error(
      HttpStatus.INTERNAL_ERROR,
      `Failed to invoke downstream action: ${error.message}`
    );
  }
});
```

#### Orchestrator Template (mixed blocking / non-blocking)

```javascript
const {
  OpenwhiskAction,
  Openwhisk,
  RuntimeActionResponse,
} = require('@adobe-commerce/aio-toolkit');
const name = '[action-name]';

exports.main = OpenwhiskAction.execute(name, async (params, ctx) => {
  const { logger } = ctx;
  const openwhisk = new Openwhisk(params.API_HOST, params.API_AUTH);

  // Step 1: blocking — must succeed before continuing
  const validation = await openwhisk.execute('[package]/validate', { id: params.id });

  if (!validation.response?.result?.body?.valid) {
    return RuntimeActionResponse.error(400, 'Validation failed');
  }

  // Step 2: non-blocking — fire and forget (parallel)
  const [act1, act2] = await Promise.all([
    openwhisk.execute('[package]/notify', { id: params.id }, { blocking: false }),
    openwhisk.execute('[package]/log-event', { id: params.id }, { blocking: false }),
  ]);

  logger.info({
    message: `${name}-dispatched`,
    notifyActivationId: act1.activationId,
    logActivationId: act2.activationId,
  });

  return RuntimeActionResponse.success({ dispatched: true });
});
```

**TypeScript:** Same with type annotations and `import` syntax

### Step 5: Update Configuration Files

Add action to `app.config.yaml` or `ext.config.yaml`:

**Sub-action (no Openwhisk client):**

```yaml
[action-name]:
  function: actions/[action-name]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    final: true
```

**Orchestrator (uses Openwhisk client — requires API_HOST and API_AUTH):**

```yaml
[action-name]:
  function: actions/[action-name]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
    API_HOST: $API_HOST
    API_AUTH: $API_AUTH
  annotations:
    final: true
```

> `API_HOST` and `API_AUTH` are NOT injected automatically — they must be declared as action inputs so OpenWhisk passes them to `params`.

**Packaged structure:**

Create `actions/[package]/actions.config.yaml` and reference in main config.

### Step 6: Completion

Display:

```
✅ OpenWhisk Action Created Successfully!

📁 Files Created:
- actions/[path]/index.[js/ts]

📝 Configuration Updated:
- app.config.yaml or ext.config.yaml
[- actions/[package]/actions.config.yaml if packaged]

🚀 Next Steps:
1. Implement business logic in the action
2. [If sub-action] Reference action name in the consuming consumer/orchestrator
3. Test locally: aio app dev
4. Deploy: aio app deploy

📖 Documentation:
- OpenwhiskAction / Openwhisk: @adobe-commerce/aio-toolkit
```

### Key Features

- **No HTTP concerns**: No method validation, no required params/headers — the action receives whatever the caller passes
- **Lightweight**: Provides logging, telemetry, and error handling only
- **Two roles**: Sub-action target (process and return) or Orchestrator (invoke and coordinate)
- **Openwhisk client**: `new Openwhisk(params.API_HOST, params.API_AUTH)` — must be in action inputs
- **Blocking vs non-blocking**: `blocking: true` (default) waits for result; `blocking: false` returns activation ID immediately
- **Parallel dispatch**: Use `Promise.all()` with `blocking: false` to fire multiple actions concurrently
- **Best Practices**: Structured logging, error handling, telemetry-ready

### Action Classes

**OpenwhiskAction.execute(name, actionFn)**
- No HTTP method or parameter validation
- Same `ctx` shape as all other action types: `{ logger, headers, telemetry }`
- `action_type` is always `'openwhisk-action'`
- Span prefix: `openwhisk.action.*`
- Unhandled throws → `RuntimeActionResponse.error(500, 'server error')`

**Openwhisk Class** (for orchestrators only)
- Constructor: `new Openwhisk(params.API_HOST, params.API_AUTH)`
- Method: `execute(actionName, params, config?)`
  - `actionName`: fully qualified (e.g., `'my-package/my-action'`) or bare name
  - `params`: object passed to the invoked action
  - `config.blocking`: `true` (default) — wait for result; `false` — return activation ID immediately
- Returns: full activation result when blocking; partial activation with only ID when non-blocking
- Errors are **not caught internally** — wrap in try/catch in your calling code

### Difference from RuntimeAction

| Aspect | `OpenwhiskAction` | `RuntimeAction` |
|---|---|---|
| HTTP method validation | None | Configurable |
| Required params/headers | None | Configurable |
| `action_type` | `'openwhisk-action'` | `'runtime-action'` |
| Span prefix | `openwhisk.action.*` | `runtime.action.*` |
| Intended trigger | Action-to-action | HTTP requests |
| `web:` in config | Usually `'no'` | Usually `'yes'` |

### Openwhisk Client vs RuntimeApiGatewayService

Both let one action call another — choose based on the target:

| | `Openwhisk` client | `RuntimeApiGatewayService` |
|---|---|---|
| Protocol | OpenWhisk API (internal) | HTTP via API Gateway |
| Target must be `web: 'yes'` | No | Yes |
| Auth | `API_HOST` + `API_AUTH` (action inputs) | IMS Bearer token (via `AdobeAuth`) |
| Returns | Full activation result | Raw `node-fetch` Response |
| Blocking / non-blocking | Configurable | Always async HTTP |
| Token management | None needed | Must generate + optionally cache |
| Best for | `web: 'no'` sub-actions, fan-out | `web: 'yes'` actions, HTTP-level control |

**Use `Openwhisk` client** (this command) when the target is `web: 'no'` or you need blocking/non-blocking control.
**Use `RuntimeApiGatewayService`** (see Related Rules) when the target is `web: 'yes'` and you need HTTP response-level control.

### Related Rules

- **Setting up New Relic Telemetry**: Add observability to your OpenWhisk action
- **Using PublishEvent**: Publish CloudEvents to Adobe I/O Events from your OpenWhisk action
- **Using RuntimeApiGatewayService**: Call a `web: 'yes'` action via API Gateway (alternative to the Openwhisk client for web-exposed targets)
- **Using FileRepository**: Persist and retrieve records using Adobe I/O Files storage from your OpenWhisk action
- **Using AbdbCollection**: Add MongoDB-backed App Builder Data storage with schema validation to your OpenWhisk action
- **Using AbdbRepository**: Add full CRUD operations (insert, find, update, delete, pagination) on top of an AbdbCollection in your OpenWhisk action
- **Using Amazon SQS — Publish**: Publish messages to an Amazon SQS queue from your OpenWhisk action
- **Create Amazon SQS Consumer**: The SQS worker is an OpenwhiskAction — use this command to create the full scheduler + worker consumer pattern
