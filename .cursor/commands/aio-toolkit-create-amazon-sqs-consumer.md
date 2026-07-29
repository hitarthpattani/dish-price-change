# AIO Toolkit: Create Amazon SQS Consumer

**Command Name:** `aio-toolkit-create-amazon-sqs-consumer`

**Description:** Creates a complete Amazon SQS fan-out consumer pattern using @adobe-commerce/aio-toolkit — a scheduler action (cron trigger) and a worker action (pulls and processes messages), wired together via Openwhisk.

## Workflow

This command creates two dedicated action files that work together to process messages from an Amazon SQS queue at scale within App Builder's 60-second action time limit:

- **Scheduler** (`RuntimeAction`, `web: 'no'`) — triggered on a cron schedule; spawns N worker activations in parallel via `Openwhisk.execute()` (non-blocking) and returns immediately
- **Worker** (`OpenwhiskAction`, `web: 'no'`) — spawned by the scheduler; pulls up to `batchSize` messages from SQS, processes each one, and deletes successfully handled messages

### Step 1: Verify Prerequisites

1. Check if `@adobe-commerce/aio-toolkit` is installed in `package.json`
   - If NOT installed: `npm install @adobe-commerce/aio-toolkit`
2. Check if `@aws-sdk/client-sqs` is installed (peer dependency — required)
   - If NOT installed: `npm install @aws-sdk/client-sqs`
3. Detect project language (TypeScript or JavaScript)
   - Check for `typescript` in dependencies + `tsconfig.json`
   - Check for `.ts` files in `actions/` or `lib/`
   - Default to JavaScript if ambiguous
4. Detect project structure
   - Check for `application:` in `app.config.yaml` (root actions)
   - Check for `extensions:` in `app.config.yaml` (extension point actions)

### Step 2: Collect Consumer Configuration

Ask the user:

1. **Scheduler Action Name** (default: `amazon-sqs-scheduler`)
   - Example: `order-queue-scheduler`, `product-sync-scheduler`

2. **Worker Action Name** (default: `amazon-sqs-worker`)
   - Example: `order-queue-worker`, `product-sync-worker`

3. **Action Location**
   - Root application (`actions/`)
   - Extension point (`[extension-path]/actions/`)

4. **Package Structure**
   - Simple: `actions/[action-name]/index.[js/ts]`
   - Packaged: `actions/[package]/[action-name]/index.[js/ts]`
   - If packaged, ask for package name (e.g., `crons`, `queues`, `workers`)

5. **Worker Thread Count** (default: `5`)
   - Number of worker activations spawned in parallel per scheduler run
   - Each worker processes `batchSize` messages independently

6. **Batch Size per Worker** (default: `100`)
   - Maximum number of SQS messages each worker pulls per invocation
   - Rule of thumb: `total expected queue depth ÷ worker thread count`

7. **Visibility Timeout** (default: `60` seconds)
   - How long a pulled message is hidden from other consumers while being processed
   - Set this to comfortably exceed your expected per-message processing time
   - If a worker times out before finishing, messages become visible again and are retried

8. **Message Payload Structure** — what does each message body contain?
   - Example: `{ type: 'order.created', data: { orderId, ... } }`
   - Used to generate the `JSON.parse(body)` destructuring in the worker handler

9. **What does the worker do with each message?**
   - Brief description, e.g.: "persist to ABDB", "call Commerce API", "forward to another action"
   - Used to scaffold the handler body with a TODO comment

10. **Does the worker need IMS credentials?** (e.g., to call Core.AuthClient.generateAccessToken or ABDB)
    - If yes: add `include-ims-credentials: true` to worker config

11. **FIFO queue?** — does the queue URL end in `.fifo`?
    - If yes: ask for a `messageGroupId` (default `'default'`) — only relevant if this project also publishes

### Step 3: Confirm Configuration

Display summary:

```
📋 Amazon SQS Consumer Configuration

Scheduler Action: [scheduler-name]
Worker Action: [worker-name]
Language: [JavaScript/TypeScript] (auto-detected)
Location: [Root/Extension]
Package: [package-name or simple]

Worker Threads: [N] (spawned in parallel per scheduler run)
Batch Size per Worker: [N] messages per worker activation
Visibility Timeout: [N]s

Message Payload: [structure description]
Worker Logic: [description]
IMS Credentials: [Yes/No]

✅ Files to Create:
- actions/[scheduler-path]/index.[js/ts]
- actions/[worker-path]/index.[js/ts]
- Update app.config.yaml or ext.config.yaml

Should I proceed?
```

### Step 4: Generate Scheduler Action

Create `actions/[scheduler-name]/index.[js|ts]`.

The scheduler fires all workers in parallel (non-blocking) and returns immediately with the activation IDs. It does not process any messages itself.

**JavaScript:**
```javascript
/*
 * <license header>
 */

const {
  RuntimeAction,
  RuntimeActionResponse,
  HttpStatus,
  Openwhisk,
} = require('@adobe-commerce/aio-toolkit');

const DEFAULT_WORKER_THREADS = [worker-thread-count];
const name = '[scheduler-name]';

exports.main = RuntimeAction.execute(
  name,
  [],
  ['LOG_LEVEL'],
  [],
  async (params, ctx) => {
    const { logger } = ctx;

    const rawThreads = Number(params.AWS_SQS_WORKER_THREADS);
    const threads =
      Number.isFinite(rawThreads) && rawThreads > 0
        ? Math.floor(rawThreads)
        : DEFAULT_WORKER_THREADS;

    logger.info({ message: `${name}-start`, threads });

    const openwhisk = new Openwhisk(params.API_HOST, params.API_AUTH);

    // Fire all workers in parallel — non-blocking (blocking: false)
    const activations = await Promise.all(
      Array.from({ length: threads }, (_, workerIndex) =>
        openwhisk.execute(
          '[package/][worker-name]',  // full action path: package/action-name or just action-name
          { workerIndex },
          { blocking: false }
        )
      )
    );

    const activationIds = activations.map((a) => a.activationId);

    logger.info({ message: `${name}-dispatched`, threads, activation_ids: activationIds });

    return RuntimeActionResponse.success({
      success: true,
      message: `Spawned ${threads} workers`,
      threads,
      activation_ids: activationIds,
    });
  }
);
```

**TypeScript:** Same structure with `import` syntax and type annotations.

### Step 5: Generate Worker Action

Create `actions/[worker-name]/index.[js|ts]`.

The worker pulls `batchSize` messages from SQS, processes each one concurrently via the handler, and deletes successfully handled messages. Failed messages remain in the queue until `visibilityTimeout` expires.

**JavaScript:**
```javascript
/*
 * <license header>
 */

const {
  AmazonSQSClient,
  OpenwhiskAction,
  RuntimeActionResponse,
  HttpStatus,
} = require('@adobe-commerce/aio-toolkit');

const DEFAULT_BATCH_SIZE = [batch-size];
const name = '[worker-name]';

exports.main = OpenwhiskAction.execute(
  name,
  async (params, ctx) => {
    const { logger } = ctx;

    const workerIndex = params.workerIndex ?? 0;

    if (!params.AWS_SQS_URL) {
      logger.error({ message: `${name}-missing-queue-url`, workerIndex });
      return RuntimeActionResponse.error(HttpStatus.BAD_REQUEST, 'AWS_SQS_URL is required');
    }

    const batchSize = Number(params.AWS_SQS_BATCH_SIZE) > 0
      ? Math.floor(Number(params.AWS_SQS_BATCH_SIZE))
      : DEFAULT_BATCH_SIZE;

    logger.info({ message: `${name}-start`, workerIndex, batchSize, queueUrl: params.AWS_SQS_URL });

    const sqs = new AmazonSQSClient({
      region: params.AWS_REGION,
      accessKeyId: params.AWS_ACCESS_KEY_ID,
      secretAccessKey: params.AWS_SECRET_ACCESS_KEY,
      queueUrl: params.AWS_SQS_URL,
      visibilityTimeout: Number(params.AWS_SQS_VISIBILITY_TIMEOUT) || [visibility-timeout],
    });

    const consumeStart = Date.now();

    // Handler: called concurrently for each received message
    // Throw to signal failure — message stays in queue until visibilityTimeout
    const stats = await sqs.consume(batchSize, async (messageId, body) => {
      const payload = JSON.parse(body);

      // TODO: implement message processing logic
      // payload contains: [describe expected fields]
      logger.info({ message: `${name}-processing`, workerIndex, messageId, type: payload.type });

      // Example: persist, call an API, forward to another action
      // throw new Error('processing failed') ← leaves message in queue for retry
    });

    const consumeDurationSec = +((Date.now() - consumeStart) / 1000).toFixed(2);

    // Log handler-level failures (message stays in queue — will be retried)
    for (const { messageId, error } of stats.errors) {
      logger.error({
        message: `${name}-handler-error`,
        workerIndex,
        messageId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    logger.info({
      message: `${name}-complete`,
      workerIndex,
      consumeDurationSec,
      received: stats.received,
      processed: stats.processed,
      deleted: stats.deleted,
      failed: stats.failed,
    });

    return RuntimeActionResponse.success({
      success: true,
      workerIndex,
      stats: {
        consumeDurationSec,
        received: stats.received,
        processed: stats.processed,
        deleted: stats.deleted,
        failed: stats.failed,
      },
    });
  }
);
```

**TypeScript:** Same structure with `import` syntax, typed payload interface, and `AmazonSQSConsumeStats` type.

### Step 6: Update Configuration Files

Add both actions to `app.config.yaml` or `ext.config.yaml`.

```yaml
# Scheduler — cron trigger, spawns workers
[scheduler-name]:
  function: actions/[scheduler-path]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
    API_HOST: $API_HOST
    API_AUTH: $API_AUTH
    AWS_SQS_WORKER_THREADS: [worker-thread-count]
  annotations:
    final: true

# Worker — spawned by scheduler, not directly web-invokable
[worker-name]:
  function: actions/[worker-path]/index.[js/ts]
  web: 'no'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
    AWS_REGION: $AWS_REGION
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    AWS_SQS_URL: $AWS_SQS_URL
    AWS_SQS_BATCH_SIZE: [batch-size]
    AWS_SQS_VISIBILITY_TIMEOUT: [visibility-timeout]
  annotations:
    final: true
    # include-ims-credentials: true   # uncomment if worker needs Core.AuthClient.generateAccessToken
```

> **Note on `API_HOST` and `API_AUTH`**: The scheduler uses `Openwhisk.execute()` to spawn workers. These are auto-injected by the App Builder runtime — add `API_HOST: $API_HOST` and `API_AUTH: $API_AUTH` to the scheduler's `inputs` to make them available as `params`.

> **Note on cron trigger**: App Builder cron triggers are configured separately in `app.config.yaml` under `triggers` / `rules`. Example:
> ```yaml
> triggers:
>   every-5-min:
>     feed: /whisk.system/alarms/alarm
>     trigger:
>       cron: '*/5 * * * *'
> rules:
>   sqs-scheduler-rule:
>     trigger: every-5-min
>     action: [scheduler-name]
> ```

### Step 7: Add Environment Variables

```bash
# Amazon SQS — shared by scheduler (thread count) and worker (credentials + queue)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SQS_URL=https://sqs.us-east-1.amazonaws.com/123456789012/your-queue-name
# For FIFO: https://sqs.us-east-1.amazonaws.com/123456789012/your-queue.fifo
```

**IAM permissions required on the worker's IAM user:**
- `sqs:ReceiveMessage`
- `sqs:DeleteMessage`
- `sqs:DeleteMessageBatch`

### Step 8: Completion

Display:

```
✅ Amazon SQS Consumer Created Successfully!

📁 Files Created:
- actions/[scheduler-path]/index.[js/ts]   ← scheduler (cron trigger, spawns workers)
- actions/[worker-path]/index.[js/ts]      ← worker (pulls + processes messages)

📝 Configuration Updated:
- app.config.yaml or ext.config.yaml

🚀 Next Steps:
1. Implement the message processing logic in the worker's handler (marked with TODO)
2. Add a cron trigger rule in app.config.yaml to schedule the scheduler action
3. Ensure the SQS queue exists in AWS (queue URL: [queue-url])
4. Verify IAM user has sqs:ReceiveMessage, sqs:DeleteMessage, sqs:DeleteMessageBatch
5. Test locally: aio app dev
6. Deploy: aio app deploy

⚙️  Tuning:
- Worker threads: [N] × Batch size: [N] = [N×N] messages per scheduler run
- Increase AWS_SQS_WORKER_THREADS (scheduler input) to drain the queue faster
- Increase AWS_SQS_BATCH_SIZE (worker input) to process more per activation
- Set AWS_SQS_VISIBILITY_TIMEOUT > expected worker processing time to prevent re-delivery

📖 Documentation:
- AmazonSQSClient: @adobe-commerce/aio-toolkit
- Openwhisk.execute(): @adobe-commerce/aio-toolkit

💡 To also PUBLISH messages to this queue, use the "Using Amazon SQS — Publish" rule
   to integrate AmazonSQSClient.publish() into any of your existing actions.
```

---

### Key Features

- **Auto-detection**: Language (TS/JS) and project structure
- **Fan-out pattern**: Scheduler spawns N workers in parallel (non-blocking) — stays well within the 60-second action time limit
- **Concurrent message processing**: Worker processes all received messages via `Promise.all()` inside `consume()`
- **Automatic delete**: Successfully handled messages deleted; failed messages stay in queue for retry via `visibilityTimeout`
- **Configurable threads**: `AWS_SQS_WORKER_THREADS` in scheduler inputs — no redeploy needed to scale
- **Configurable batch size**: `AWS_SQS_BATCH_SIZE` in worker inputs — no redeploy needed to tune
- **FIFO support**: Automatic — just use a `.fifo` queue URL

---

### AmazonSQSClient Key Components

```javascript
// Constructor
new AmazonSQSClient({
  region,            // AWS region — e.g. 'us-east-1'
  accessKeyId,       // IAM access key ID
  secretAccessKey,   // IAM secret access key
  queueUrl,          // full SQS queue URL
  visibilityTimeout, // seconds message stays hidden while processing (default: 30)
  waitTimeSeconds,   // long polling on first receive call (default: 0 — use 0 for cron workers)
  messageGroupId,    // FIFO MessageGroupId (default: 'default')
})

// Consume
async consume(batchSize, handler): Promise<ConsumeStats>
// batchSize: max messages to pull per invocation
// handler:   async (messageId, body) => void
//            resolve → message deleted | throw → message stays in queue

// ConsumeStats shape:
{
  received: number,   // messages pulled from SQS
  processed: number,  // messages passed to handler
  deleted: number,    // handlers that resolved (deleted)
  failed: number,     // handlers that threw (left in queue)
  errors: [{ messageId: string, error: Error }, ...]
}
```

> **`consume()` throws on SQS transport errors** (ReceiveMessage or DeleteMessageBatch failures). Wrap in try/catch if you want to handle these in the worker rather than letting the activation fail.

```javascript
// Openwhisk — for spawning workers from the scheduler
new Openwhisk(params.API_HOST, params.API_AUTH)
openwhisk.execute(actionName, params, { blocking: false })
// blocking: false → fire-and-forget, returns { activationId } immediately
```

---

### Tuning Guidance

| Parameter | Config key | Guidance |
|---|---|---|
| `visibilityTimeout` | `AWS_SQS_VISIBILITY_TIMEOUT` | Must exceed expected per-message processing time + overhead. If a worker times out or crashes, unfinished messages re-appear after this interval |
| `batchSize` | `AWS_SQS_BATCH_SIZE` | `total queue depth ÷ worker thread count`. Keep low enough that a single worker finishes within the action time limit |
| Worker threads | `AWS_SQS_WORKER_THREADS` | Each thread is a separate OpenWhisk activation — scale up without redeployment by changing this input |
| `waitTimeSeconds` | Constructor | Leave at `0` for cron-based workers. Use `1–20` only when workers are triggered by queue events rather than a fixed schedule |

---

### Related Rules

- **"Using Amazon SQS — Publish"** (`aio-toolkit-use-amazon-sqs-publish.mdc`) — integrate `AmazonSQSClient.publish()` into any action to write messages to the queue this consumer reads from
- **"Creating Openwhisk Action"** (`aio-toolkit-create-openwhisk-action.md`) — the worker is an `OpenwhiskAction`; see that command for the full OpenwhiskAction reference
- **"Setting up New Relic Telemetry"** (`aio-toolkit-setup-new-relic-telemetry.mdc`) — add observability to the scheduler and worker actions
