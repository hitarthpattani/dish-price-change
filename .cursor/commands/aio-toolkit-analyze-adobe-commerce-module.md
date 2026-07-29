# aio-toolkit-analyze-adobe-commerce-module

Analyze an Adobe Commerce module and generate a comprehensive requirements document at `requirements/{Vendor_Module}.md` in the project root. Follow the four phases below **in strict order**.

---

## Phase 1 — Prerequisites

### 1a. Detect Project Context

Check whether the current workspace is an Adobe Commerce project root:
- Look for an `app/code/` directory
- Look for `composer.json` containing `magento/framework` in its `require` block
- Look for `app/etc/` directory

**If this IS an Adobe Commerce project root:**
- Recursively scan `app/code/` for all `{Vendor}/{Module}` two-level directory structures
- Present a numbered list of all discovered modules
- Ask: *"Which module would you like to analyze? Enter the Vendor/Module name (e.g. Magento/Catalog)."*
- Resolve the full module path: `{project_root}/app/code/{Vendor}/{Module}`

**If this is NOT an Adobe Commerce project root:**
- Ask: *"Please provide the full absolute path to the Adobe Commerce module directory."*
- Accept the path and proceed to 1b

### 1b. Validate the Module Path

Confirm the provided path is a valid Adobe Commerce module by checking:
- `registration.php` exists — required Magento registration file
- `etc/module.xml` exists — required module declaration

If either file is missing, stop and report: *"The provided path does not appear to be a valid Adobe Commerce module. Missing: {file}. Please verify the path and try again."*

If both files exist:
- Read `etc/module.xml` → extract the full module name (e.g. `Magento_Catalog`) and schema version
- Read `registration.php` → confirm namespace registration matches `etc/module.xml`
- Read `composer.json` (if present) → extract description, version, and PHP constraint

### 1c. Additional Prerequisites

Run these checks before deep analysis begins:

1. **Resolve project root** — walk up from the module path to locate the directory containing `app/code/`. This is the Adobe Commerce project root used for output.
2. **Read declared dependencies** — parse `<sequence>` entries in `etc/module.xml` to identify internal module dependencies.
3. **Inventory config files** — check which of the following exist (record presence only, do not read contents yet):

| Config File | Drives Section |
|---|---|
| `etc/db_schema.xml` | Database Schema |
| `etc/webapi.xml` | REST API Endpoint |
| `etc/communication.xml`, `etc/queue_topology.xml`, `etc/queue_publisher.xml`, `etc/queue_consumer.xml` | RabbitMQ |
| `etc/adminhtml/system.xml`, `etc/config.xml` | Admin Configuration |
| `etc/crontab.xml` | Cron Jobs |
| `etc/cache.xml` | Cache System |
| `etc/import.xml`, `etc/export.xml` | Import / Export |
| `etc/extension_attributes.xml` | Extension Attributes |
| `etc/io_events.xml` | Adobe I/O Events |
| `etc/webapi_async.xml` | Async / Bulk REST API |
| `etc/schema.graphqls` | GraphQL Schema |
| `etc/email_templates.xml` | Email Templates |
| `etc/payment.xml` | Payment Method *(only if new method declared)* |
| `etc/di.xml`, `etc/adminhtml/di.xml`, `etc/frontend/di.xml`, `etc/graphql/di.xml`, `etc/webapi_rest/di.xml`, `etc/crontab/di.xml` | Dependency Injection |
| `etc/events.xml`, `etc/adminhtml/events.xml`, `etc/frontend/events.xml`, `etc/graphql/events.xml`, `etc/webapi_rest/events.xml`, `etc/crontab/events.xml` | Events (Observers) |

4. **Inventory PHP directories** — check for presence of `Model/`, `Helper/`, `Http/`, `Block/` directories.
5. **Check for Admin UI** — glob `view/adminhtml/ui_component/` for any `*.xml` files containing a `<listing>` (grid) or `<form>`. Only flag this section if such files exist.
6. **Check for existing documentation** — note if `README.md`, `REQUIREMENTS.md`, or `docs/` exists (for reference only; do not re-use old content).

---

## App Builder Reference Mapping

Use this mapping throughout analysis and especially when writing the Summary section. For every Commerce module component found, cite the correct App Builder equivalent, the specific class from the custom libraries, and include the documentation link in the generated document.

### Architectural Principles (always apply in the Summary)

**1. Never expose raw Runtime action URLs externally.**
- **Commerce → App Builder**: Always use Commerce's Webhook system. Register the webhook in Commerce pointing to a `WebhookAction` handler. Commerce handles auth, retry, and structured payload delivery. Do not have Commerce call a raw `*.adobeioruntime.net` URL directly.
- **Third-party → App Builder**: Always create a proper API layer in front of the Runtime action — a Commerce REST endpoint (`webapi.xml`), an API Mesh route, or an App Builder web API route. Third parties call the API layer, not the Runtime action URL directly. This provides versioning, access control, and a stable public contract.

**2. Always recommend both `AbdbCollection` and `AbdbRepository` together.**
- `AbdbCollection` defines the typed schema (columns, types, validation rules).
- `AbdbRepository` wraps the collection and provides the full CRUD interface (`save`, `find`, `findById`, `deleteById`, `insert`, `update`, `delete` with pagination and sorting).
- Never recommend one without the other. When describing a persistence requirement, always say: "Define the schema with `AbdbCollection`, then use `AbdbRepository` for all read/write operations."

### Custom Libraries

Two custom libraries are available for App Builder development on this project. When describing implementation targets in the Summary, always reference the specific class or component from these libraries rather than generic Adobe SDK names.

**`@adobe-commerce/aio-toolkit`** (backend — TypeScript, Node.js actions)
NPM: https://www.npmjs.com/package/@adobe-commerce/aio-toolkit

| Class / Component | Purpose |
|---|---|
| `RuntimeAction` | HTTP-triggered I/O Runtime action — handles inbound REST requests |
| `EventConsumerAction` | I/O Event-triggered action — processes Adobe I/O Events from Commerce |
| `WebhookAction` | Commerce Webhook-triggered action — with built-in signature verification |
| `PublishEvent` | Publishes events to Adobe I/O Event Bus (CloudEvents format) |
| `GraphQlAction` | Runs a GraphQL server inside an I/O Runtime action |
| `OpenWhisk` / `OpenWhiskAction` | Invokes other Runtime actions from within an action |
| `AdobeCommerceClient` | HTTP client for Commerce REST API — supports OAuth 1.0a and IMS auth |
| `AdobeAuth` | Adobe IMS token generation (OAuth 2.0 service-to-service) |
| `BearerToken` | Token introspection and validation |
| `FileRepository` | File-based persistence using Adobe I/O Files |
| `AbdbCollection` + `AbdbRepository` | Typed schema + CRUD persistence using Adobe App Builder Database (ABDB) |
| `RuntimeApiGatewayService` | Calls other Runtime actions via the API Gateway |
| `Telemetry` | OpenTelemetry + New Relic observability, auto-integrated in all action classes |

**`@adobe-commerce/aio-experience-kit`** (frontend — React, Admin UI extensions)
NPM: https://www.npmjs.com/package/@adobe-commerce/aio-experience-kit

| Class / Component | Purpose |
|---|---|
| `MainContainer` | App layout with navigation, routing, and responsive design |
| `DataTable` | Admin grid — sortable columns, row/bulk actions, search, virtual scroll |
| `DataForm` | Dynamic form builder — field types: TEXT, EMAIL, NUMBER, SELECT, MULTISELECT, TOGGLE, LABEL; conditional field visibility via `dependsOn` |

### Commerce → App Builder Component Mapping

| Commerce Module Component | App Builder Equivalent | Library Class | Documentation |
|---|---|---|---|
| Inbound call from Commerce (webhook) | Commerce Webhook → `WebhookAction` (**never** a raw Runtime URL) | `WebhookAction` (signature verification built-in) | https://developer.adobe.com/commerce/extensibility/webhooks/ |
| Inbound call from third-party system | Web API layer → `RuntimeAction` (**never** expose raw Runtime URL; create Commerce webapi.xml endpoint, API Mesh route, or App Builder web API route as the public contract) | `RuntimeAction` behind API layer | https://developer.adobe.com/runtime/docs/ |
| Commerce REST API calls from App Builder | Commerce REST client | `AdobeCommerceClient` | https://developer.adobe.com/commerce/webapi/rest/ |
| GraphQL schema (queries + mutations) | GraphQL Runtime action | `GraphQlAction` | https://developer.adobe.com/graphql-mesh-gateway/ |
| `etc/io_events.xml` registered events | I/O Event-triggered action | `EventConsumerAction` | https://developer.adobe.com/commerce/extensibility/events/ |
| RabbitMQ consumer | I/O Event-triggered action | `EventConsumerAction` | https://developer.adobe.com/commerce/extensibility/starter-kit/ |
| Publishing events to external systems | I/O Events publisher | `PublishEvent` | https://developer.adobe.com/commerce/extensibility/events/ |
| Admin grids | Admin UI extension grid screen | `DataTable` + `MainContainer` | https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/ |
| Admin forms | Admin UI extension form screen | `DataForm` + `MainContainer` | https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/ |
| Admin menu entries | Admin UI extension menu | `MainContainer` (navigation config) | https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/ |
| Admin configuration (`system.xml`) | App Builder configuration panel | `DataForm` (config screen) | https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/ |
| Cron jobs | Scheduled Runtime action (alarms) | `RuntimeAction` | https://developer.adobe.com/runtime/docs/guides/using/creating_actions/ |
| Custom shipping method / carrier | App Builder Shipping Integration | `RuntimeAction` | https://developer.adobe.com/commerce/extensibility/ |
| Custom payment method | App Builder Payment Integration | `RuntimeAction` | https://developer.adobe.com/commerce/extensibility/ |
| Email templates | Transactional email Runtime action | `RuntimeAction` + email provider | https://developer.adobe.com/runtime/docs/ |
| Persistent data storage | App Builder Database — define schema with `AbdbCollection`, perform all CRUD with `AbdbRepository` (always use both together) | `AbdbCollection` + `AbdbRepository` | https://developer.adobe.com/runtime/docs/ |
| File-based storage | I/O Files storage | `FileRepository` | https://developer.adobe.com/runtime/docs/ |
| Import / Export (CSV processing) | Scheduled or file-triggered action | `RuntimeAction` + `FileRepository` | https://developer.adobe.com/runtime/docs/ |
| Outbound HTTP to external APIs | Node.js HTTP calls within action | `RuntimeAction` (node-fetch/axios) | https://developer.adobe.com/runtime/docs/ |
| Adobe IMS authentication | IMS token generation | `AdobeAuth` | https://developer.adobe.com/developer-console/docs/guides/authentication/ |
| Action-to-action invocation | OpenWhisk invocation | `OpenWhisk` / `OpenWhiskAction` | https://developer.adobe.com/runtime/docs/ |

**Starter Kits** — If the module's business logic matches a common sync pattern (order, shipment, product, customer, inventory), note the Starter Kit:
- https://developer.adobe.com/commerce/extensibility/starter-kit/
- https://developer.adobe.com/commerce/extensibility/starter-kit/create-app/

**General extensibility overview**: https://developer.adobe.com/commerce/extensibility/

---

## Phase 2 — Module Analysis

Read and analyze each config file flagged as present. **Skip any section whose config files do not exist.** Collect all findings before Phase 3.

### Overview
Synthesize from `etc/module.xml`, `composer.json`, and README if present. Include:
- Module purpose in plain language
- Platform and PHP version requirements
- **Write the key capabilities enumeration last**, after all other sections have been analyzed, so the counts are accurate (e.g. "Provides 2 REST endpoints, 3 cron jobs, 1 RabbitMQ topic, 5 admin config groups"). Do not estimate or guess counts upfront.

### Architecture Summary
Build an ASCII flow diagram covering all entry points and processing paths:
- Entry points: REST webhooks, CSV import, cron triggers, queue consumers
- Processing stages: queue publishing, persistence, eligibility evaluation, external API calls
- Outputs: database writes, external API responses, reporting events
- Label components by role (e.g. "Webhook Handler", "Eligibility Engine", "Retry Processor") — no PHP class names

### External Dependencies
Scan all PHP files not excluded by the Business Logic rules for outbound HTTP calls, external service clients, and injected dependencies. Also read `etc/module.xml` `<sequence>` for internal module dependencies and `composer.json` `require` block for third-party libraries. Document:

**External APIs** — for each outbound HTTP integration found:
- Service name and plain-English role (e.g. "Recurly — subscription billing platform")
- Authentication mechanism: describe the token type (OAuth2, API key, Basic Auth, Bearer token) and how it is obtained
- Request headers required: list the header names and where their values come from (e.g. "Authorization: Bearer token fetched from {Admin config path}", "Content-Type: application/json")
- Base URL source: Admin config path or hardcoded value
- Any connection or timeout configuration

**Message Queue Infrastructure** — broker type (RabbitMQ / Amazon MQ), how the connection is configured, what topics this module interacts with (cross-reference with the RabbitMQ section)

**Internal Platform Modules** — for each `<sequence>` entry and any other `Vendor_Module` dependency found injected in constructors:
- Module name and what capability it provides to this module (e.g. "Dish_Recurly — provides the Recurly API client and credential management")
- Only include modules that provide a service or data this module actively uses; skip purely structural dependencies

**Third-Party Libraries** — from `composer.json` `require`, excluding `magento/*`, `php`, and `ext-*` entries:
- Library name (e.g. `guzzlehttp/guzzle`), version constraint, and plain-English purpose

### Database Schema (`etc/db_schema.xml`)
For each table:
- Table name and plain-English purpose
- Columns table: `Column | Type | Nullable | Default | Description`
- Indexes and foreign keys

### REST API Endpoint (`etc/webapi.xml`)
Read `etc/webapi.xml`. For each `<route>`:

1. Note the HTTP method, URL path, and authentication type (`token` / `session` / `anonymous`)
2. Follow the `<service class="..." method="..."/>` reference:
   - Derive the PHP file path from the class name and read the service interface file
   - Read the `@param` annotations on the method:
     - For scalar parameters (`string`, `int`, `bool`, `float`): these map directly to request body fields
     - For Data interface parameters (e.g. `SomeDataInterface`): derive the file path and read it — document each getter method as a request field (strip `get` prefix, convert to snake_case)
   - Read the `@return` annotation:
     - For a scalar or `void` return: document the response as a plain value
     - For a Data interface: derive the file path and read it — document each getter as a response field
     - For arrays of Data interfaces (`SomeDataInterface[]`): document as an array of the above

3. For each endpoint document:
   - **Method & URL**: HTTP method and full path
   - **Auth**: authentication type required
   - **Description**: plain-English explanation of what the endpoint does
   - **Request Body** (if applicable): field table `Field | Type | Required | Description` + a JSON sample block with realistic values
   - **Response**: field table `Field | Type | Description` + a JSON sample block with realistic values
   - If the method takes no parameters and returns `mixed` or a raw value, document what the endpoint reads from context (e.g. session, JWT token, request headers) and what it returns

- **Source Files:** `etc/webapi.xml`, service interface PHP file, any referenced Data interface PHP files

### RabbitMQ Message Queue Architecture
Read all four queue config files. For each topic:

**Published Events:**
- Event name, trigger description (what causes it to be published)
- Full JSON payload block with realistic sample values
- Payload field table: `Field | Type | Description`

**Consumed Events:**
- Event name, consumer description (what processing logic it executes)
- Full JSON payload block
- Payload field table: `Field | Type | Description`

**Source Files:** `etc/communication.xml`, `etc/queue_topology.xml`, `etc/queue_publisher.xml`, `etc/queue_consumer.xml`

### Admin Configuration (`etc/adminhtml/system.xml` + `etc/config.xml`)
For each Section → Group → Field hierarchy:
- Section: code and display label
- Group: code and display label
- Fields table: `Code | Type | Label | Description | Default`
  - For `select` / `multiselect`: if static, list all option values; if dynamic, describe the data source in plain language
  - For `text` with a backend model: describe what validation/transformation is applied (e.g. "Saved as a cron expression")
  - For dynamic grid fields: document each column (code, label, type, data source)
- Include a **Default Values** subsection from `etc/config.xml`
- **Source Files:** `etc/adminhtml/system.xml`, `etc/config.xml`

### Cron Jobs (`etc/crontab.xml`)
For each job:
- Job name, cron group, schedule expression (and how it is configured — hardcoded or via Admin config path)
- Plain-English description of what the job does
- **Source Files:** `etc/crontab.xml`

### Cache System (`etc/cache.xml`)
For each cache type:
- Cache identifier, label, description
- What data it stores, what invalidates it, what reads from it
- **Source Files:** `etc/cache.xml`

### Import / Export
Read all present import/export config files (`etc/import.xml`, `etc/export.xml`). For each entity:
- Entity type and registered behavior (import / export)
- CSV column mapping table: `CSV Column | Field | Description`
- Workflow: pre-processing steps, post-import file handling, error handling
- **Source Files:** relevant XML files present

### Extension Attributes (`etc/extension_attributes.xml`)
Read `etc/extension_attributes.xml`. For each `<extension_attributes for="...">` block:
- **Extended Entity**: the core Magento entity being extended (e.g. Customer, Customer Group, Order, Quote, Product) — describe it by its plain name, not its interface class
- Attributes table: `Attribute Code | Type | Description`
  - Attribute Code: the field name as it appears in REST API responses and requests
  - Type: data type (int, string, text, bool, etc.)
  - Description: plain-English explanation of what this field represents and how it is used by the module
- Note that these attributes are automatically included in REST API responses for the extended entity — any integration consuming that entity via API will see these fields
- **Source Files:** `etc/extension_attributes.xml`

### Adobe I/O Events (`etc/io_events.xml`)
Read `etc/io_events.xml`. For each registered `<event>`:

- **Event Name**: the unique identifier published to the Adobe I/O Event Bus — this is what App Builder subscribes to
- **Parent Commerce Event**: the underlying Commerce observer event that triggers this I/O event
- **Destination**: the I/O event channel/topic the event is routed to
- **Description**: plain-English explanation of when this event fires and what business action caused it

Produce a summary table: `Event Name | Parent Commerce Event | Destination | Description`

Then for each event, produce a **JSON sample payload block** using the `<field name="..."/>` entries — construct a realistic JSON object with the exact field names and plausible sample values that an App Builder action handler would receive. Follow with a field table:
- `Field | Type | Description`
  - Derive the type from the field name and parent event context (e.g. `id` → integer, `sku` → string, `price` → float)
  - Describe what each field represents and how an App Builder action should use it

Note: these events are the primary integration points for App Builder — any App Builder action subscribing to Commerce events will use these event names and receive these exact fields in this payload shape.

- **Source Files:** `etc/io_events.xml`

### Async / Bulk REST API (`etc/webapi_async.xml`)
Read `etc/webapi_async.xml`. For each registered `<route>`:
- Table: `Async URL | Method | Maps To (Sync Endpoint) | Description`
  - Async URL: the bulk/async endpoint URL (prefixed with `async/bulk/`)
  - Method: HTTP method (PUT, POST, DELETE)
  - Maps To: the original synchronous REST endpoint this async route wraps
  - Description: plain-English explanation of what the async operation does — it accepts an array of items, queues them for background processing, and returns a request ID for status polling
- **Source Files:** `etc/webapi_async.xml`

### Email Templates (`etc/email_templates.xml`)
Read `etc/email_templates.xml`. For each registered template:
- Table: `Template ID | Label | Type | Area | Purpose`
  - Template ID: the unique identifier used to dispatch this email programmatically
  - Label: the human-readable name as it appears in Admin
  - Type: html or text
  - Area: frontend or adminhtml
  - Purpose: read the corresponding template file from `view/{area}/email/{file}` and describe in plain language what the email communicates, when it is sent, and who receives it
- **Source Files:** `etc/email_templates.xml`, `view/{area}/email/` template files

### Payment Method (`etc/payment.xml`)
Read `etc/payment.xml` only if it exists. First determine whether the module introduces a **new custom payment method**:
- A new payment method is indicated by a `<method name="...">` entry whose name does not match any standard Magento core payment method (e.g. `free`, `checkmo`, `banktransfer`, `cashondelivery`, `purchaseorder`)
- If no new payment method is declared (only groups or settings for existing methods), **skip this section entirely**

If a new custom payment method is confirmed, document:
- **Method Code**: the `name` attribute value used to identify the method programmatically
- **Payment Group**: which `<group>` it belongs to and the group label
- **Settings**: any flags configured in `<method>` (e.g. `allow_multiple_address`)
- **Implementation**: locate the payment model by tracing the `di.xml` preference or type configuration for this method code, read the implementation file, and describe in plain language:
  - What payment provider or system it integrates with
  - How authorization and capture work
  - Any refund, void, or order management capabilities
  - What data it sends to or receives from the payment provider
- **Source Files:** `etc/payment.xml`

### GraphQL Schema (`etc/schema.graphqls`)
Read `etc/schema.graphqls` for the API surface. For each query, mutation, or field that carries a `@resolver(class: "...")` directive, derive the PHP file path from the class name (convert namespace separators to directory separators, append `.php`) and read that file to understand the implementation. Document both together for each operation.

**Queries** — for each entry in `type Query { ... }`:
- Table: `Query Name | Parameters | Return Type | Cached? | Description`
  - Parameters: list each argument name, type, and its `@doc` description
  - Cached?: yes if `@cache` directive is present, no otherwise
- **Resolver Logic**: plain-English description of what the resolver does — what data sources it reads from, what filters or conditions it applies, what transformations it performs, and what it returns. No class names.

**Mutations** — for each entry in `type Mutation { ... }`:
- Table: `Mutation Name | Input Type | Output Type | Description`
- **Resolver Logic**: plain-English description of what the mutation does — what it validates, what it writes or updates, what side effects it triggers, and what it returns. No class names.

**Input Types** — for each `input SomethingInput { ... }`:
- Table: `Field | Type | Required | Description`

**Output / Response Types** — for each `type SomethingOutput { ... }` or custom response type:
- Table: `Field | Type | Description`

**Type Extensions** — for any `type ExistingCoreType { ... }` that extends a Magento core type (e.g. `Cart`, `Customer`) with new fields:
- Note which core type is extended, what new fields are added with their descriptions, and for each field that has a `@resolver` directive, read that resolver file and describe what data it provides

**Source Files:** `etc/schema.graphqls`, resolver PHP files derived from `@resolver(class: "...")` annotations in the schema

### Events / Observers
Check for and read all area-scoped `events.xml` files that exist:
- `etc/events.xml` — Global (applies in all areas)
- `etc/adminhtml/events.xml` — Admin area only
- `etc/frontend/events.xml` — Frontend area only
- `etc/graphql/events.xml` — GraphQL area only
- `etc/webapi_rest/events.xml` — REST API area only
- `etc/webapi_soap/events.xml` — SOAP API area only
- `etc/crontab/events.xml` — Cron area only

For each file that exists, group findings under its area scope heading. Within each area, produce an events table:
- `Event Name | Observer Name | Description`
  - Event Name: the Magento/custom event being listened to
  - Observer Name: a short identifier (not a class name) describing the observer's role
  - Description: plain-English explanation of what the observer does when the event fires, what data it reads from the event, and any side effects it produces

**Source Files:** all `events.xml` files present across areas

### Dependency Injection
Check for and read all area-scoped `di.xml` files that exist:
- `etc/di.xml` — Global (applies in all areas)
- `etc/adminhtml/di.xml` — Admin area only
- `etc/frontend/di.xml` — Frontend area only
- `etc/graphql/di.xml` — GraphQL area only
- `etc/webapi_rest/di.xml` — REST API area only
- `etc/webapi_soap/di.xml` — SOAP API area only
- `etc/crontab/di.xml` — Cron area only

For each file that exists, group findings under its area scope heading. Within each area document:

**Preferences** — only non-data, non-collection interface overrides:
- Table: `Component Overridden | Custom Behavior` (plain language, no class names)
- Skip: data model interfaces, collection interfaces

**Plugins** — list all defined plugins:
- Table: `Intercepted Component | Type (before/after/around) | What It Does`
- Describe behavior in plain language

If a preference or plugin is identical across multiple areas, note it once under Global and reference it in the area-specific section rather than duplicating.

**Source Files:** all `di.xml` files present across areas

### Business Logic
Scan **all PHP files in the module root** except those in the following excluded directories and matching the following excluded file patterns.

**Excluded directories — do not read:**
- `Setup/` (incl. `Setup/Patch/`, `Setup/Declaration/`, `Setup/Operation/`, `Setup/Converters/`, `Setup/data/`) — one-time database schema and data migration scripts
- `Test/` and `Tests/` — unit, integration, MFTF, and performance tests
- `view/` — templates, layouts, UI components, JavaScript, CSS
- `etc/` — XML configuration (already covered by dedicated sections)
- `i18n/` — translation CSV files
- `docs/` — documentation only

**Excluded file patterns — skip even if inside an otherwise included directory:**
- `Model/ResourceModel/**` — low-level database read/write layer
- `Model/Data/**` — plain data transfer objects with no logic
- `Api/Data/**` — service interface data objects (contracts only)
- `**/*Collection.php` — database collection query classes
- `**/*Repository.php` — CRUD wrappers with no business rules
- `**/*Interface.php` — interface contracts only, no implementation

Everything else is considered business logic — including but not limited to files found in: `Model/`, `Helper/`, `Http/`, `Plugin/`, `Observer/`, `Controller/`, `Console/`, `Service/`, `Cron/`, `Block/`, `Gateway/`, `Resolver/`, `ViewModel/`, `Pricing/`, `Amqp/`, `GraphQl/`, `DataProvider/`, `Ui/DataProvider/`, `Logger/`, `Export/`, `Import/`, `Indexer/`, `Event/`, `Mapper/`, `Queue/`, `Query/`, `Dto/`, and any other custom directory present in the module root.

Write everything as **descriptive prose only** — no PHP class names, method signatures, `::`, or `->` references. Organize by logical area (e.g. "Webhook Ingestion", "Eligibility Engine", "Retry Handling", "External API Integration", "Helper Utilities"). For each area describe:
- What it does and why
- What inputs it operates on
- What decisions or transformations it makes
- What outputs or side effects it produces
- How it interacts with other components

### Additional Configuration
After completing the standard inventory above, glob `etc/` (including all area sub-directories: `adminhtml/`, `frontend/`, `graphql/`, `webapi_rest/`, `webapi_soap/`, `crontab/`) for any `*.xml` or `*.graphqls` files that were **not already covered** by the sections above.

For each uncovered file found:
- Read the file to understand its purpose
- Document under a sub-heading using the filename as the title (e.g. `#### etc/firebear_import.xml`)
- Describe in plain language what the configuration registers or declares
- Include a summary table of the key entries using whatever structure fits the file (e.g. `Entity | Type | Description`, or `Key | Value | Description`)
- Note the framework or system that consumes this file (e.g. "Consumed by the Firebear ImportExport module", "Consumed by the Magento_Sales module")
- **Source Files:** the file path

If no uncovered files are found, skip this section entirely.

### End-to-End Processing Flow
After all sections are complete, create ASCII/text flow diagrams for **every distinct processing flow** in the module. For each flow:
- Name the flow (e.g. "Webhook Ingestion Flow", "CSV Ingestion Flow", "Price Change Processing Flow")
- Show: trigger → processing steps → decision points → external calls → outputs
- Label each step by role (e.g. "Webhook Handler", "Queue Publisher", "Eligibility Engine") — no class names

### Summary
Write a final summary structured as an **App Builder Integration Reference**. Use the **App Builder Reference Mapping** table defined above to cite the correct SDK/service name and include the documentation link for every implementation target. Include the following subsections:

**Module Purpose** — two to three sentences describing what the module does and why it exists.

**App Builder Implementation Targets** — identify every component this module provides that needs to be re-implemented in App Builder. For each target, name the component, describe what needs to be built, state the SDK/service to use (from the mapping table), and include the documentation link:

- **Admin UI** *(if the module has `view/adminhtml/ui_component/` grids or forms, or `etc/adminhtml/menu.xml`)*:
  - List each grid: entity name, columns, row actions, bulk actions, search capability
  - List each form: entity name, field groups, field types, conditional visibility rules
  - List each menu entry: label, position, linked route
  - **Library**: `@adobe-commerce/aio-experience-kit` — `DataTable` (grids) + `DataForm` (forms) + `MainContainer` (navigation/routing)
  - **Docs**: https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/ | https://www.npmjs.com/package/@adobe-commerce/aio-experience-kit

- **Admin Configuration** *(if the module has `etc/adminhtml/system.xml`)*:
  - List each configuration section and group, all fields with types and defaults (reference Admin Configuration section)
  - **Library**: `@adobe-commerce/aio-experience-kit` — `DataForm` (config screen with `use_env_var` flag for credential fields)
  - Backend storage: `@adobe-commerce/aio-toolkit` — `AbdbRepository` or `FileRepository`
  - **Docs**: https://developer.adobe.com/commerce/extensibility/admin-ui-sdk/ | https://www.npmjs.com/package/@adobe-commerce/aio-experience-kit

- **GraphQL Server** *(if the module has `etc/schema.graphqls`)*:
  - List each query and mutation to re-expose, with resolver logic (reference GraphQL Schema section)
  - **Library**: `@adobe-commerce/aio-toolkit` — `GraphQlAction` (define schema string + async resolver functions)
  - **Docs**: https://developer.adobe.com/graphql-mesh-gateway/ | https://www.npmjs.com/package/@adobe-commerce/aio-toolkit

- **Custom Shipping Method** *(if the module declares a shipping carrier via `di.xml` or `etc/config.xml` carrier config)*:
  - Carrier name, rate calculation logic, required input data (origin, destination, cart contents)
  - **Library**: `@adobe-commerce/aio-toolkit` — `RuntimeAction` (rate calculator endpoint) + `WebhookAction` (if Commerce calls it via webhook)
  - **Docs**: https://developer.adobe.com/commerce/extensibility/ | https://www.npmjs.com/package/@adobe-commerce/aio-toolkit

- **Backend Actions / Event Handlers** — for each App Builder action needed:
  - Action name, trigger type, logic summary, input/output payloads
  - **Commerce Webhook-triggered**: use **`WebhookAction`** (signature verification built-in). Register the webhook in Commerce pointing to this action — do not expose the raw Runtime URL to Commerce directly. — https://developer.adobe.com/commerce/extensibility/webhooks/
  - **I/O Event-triggered** (io_events.xml / RabbitMQ): **`EventConsumerAction`** — https://developer.adobe.com/commerce/extensibility/events/
  - **Third-party inbound call**: create a Commerce REST API endpoint (`webapi.xml`) or API Mesh route as the public contract; the handler behind it is a **`RuntimeAction`** — never give third parties the raw Runtime URL — https://developer.adobe.com/runtime/docs/
  - **Scheduled** (cron replacement): **`RuntimeAction`** with I/O Runtime alarms
  - **Event publishing**: **`PublishEvent`** — https://developer.adobe.com/commerce/extensibility/events/
  - If pattern matches Starter Kit: note — https://developer.adobe.com/commerce/extensibility/starter-kit/
  - **Library**: `@adobe-commerce/aio-toolkit` — https://www.npmjs.com/package/@adobe-commerce/aio-toolkit

- **Commerce API Calls** *(for any action that reads or writes Commerce data)*:
  - Endpoints called, auth method (OAuth 1.0a or IMS), data exchanged
  - **Library**: `@adobe-commerce/aio-toolkit` — `AdobeCommerceClient` with `Oauth1aConnection` or `ImsConnection`

- **Outbound Service Integrations** *(for each non-Commerce external API)*:
  - Service name, auth mechanism, endpoints called, data exchanged (reference External Dependencies section)
  - **Library**: `@adobe-commerce/aio-toolkit` — `RuntimeAction` with node-fetch/axios; `AdobeAuth` for IMS-authenticated services

- **Data Persistence** *(if the module stores state that App Builder must also persist)*:
  - Describe what data must be persisted and its access patterns (CRUD, search, pagination)
  - Structured data: always use **`AbdbCollection`** (schema definition) together with **`AbdbRepository`** (CRUD operations — `save`, `find`, `findById`, `deleteById`, bulk ops, pagination). Never recommend one without the other.
  - File/blob data: **`FileRepository`** (Adobe I/O Files)
  - **Library**: `@adobe-commerce/aio-toolkit` — https://www.npmjs.com/package/@adobe-commerce/aio-toolkit

**Key Business Rules** — bullet list of the critical decision points the App Builder implementation must replicate (e.g. eligibility checks, retry limits, state transitions, error handling).

**Data Contracts** — list the core data structures the App Builder actions will send or receive (reference the field tables in REST API, RabbitMQ, I/O Events, and Extension Attributes sections).

**Recommended Implementation Order** — recommended sequence for building the App Builder components, with dependencies noted (e.g. "Build configuration panel first, as action credentials depend on it").

**Known Constraints** — any Commerce-specific behaviors, timing dependencies, or edge cases an App Builder developer must be aware of.

**Further Reading** — close the Summary with these always-present links:
- Adobe Commerce Extensibility Overview: https://developer.adobe.com/commerce/extensibility/
- App Builder Overview: https://developer.adobe.com/app-builder/docs/overview/
- Commerce App Builder Starter Kit: https://developer.adobe.com/commerce/extensibility/starter-kit/
- `@adobe-commerce/aio-toolkit` (backend actions, Commerce client, persistence): https://www.npmjs.com/package/@adobe-commerce/aio-toolkit
- `@adobe-commerce/aio-experience-kit` (Admin UI grids, forms, navigation): https://www.npmjs.com/package/@adobe-commerce/aio-experience-kit

---

## Phase 3 — Developer Confirmation

Before generating the output file, present a structured key-findings summary and wait for confirmation:

```
## Analysis Complete — Ready to Generate Requirements Document

Module: {Vendor_Module}
Path:   {module_path}

Discovered Sections:
  [x] Overview
  [x] Architecture Summary
  [x] External Dependencies
  [x/—] Database Schema      — {n tables / not present}
  [x/—] REST API Endpoint    — {n endpoints / not present}
  [x/—] RabbitMQ             — {n topics published, n consumed / not present}
  [x/—] Admin Configuration  — {n fields across n groups / not present}
  [x/—] Cron Jobs            — {n jobs / not present}
  [x/—] Cache System         — {n cache types / not present}
  [x/—] Import / Export      — {n entities / not present}
  [x/—] Extension Attributes — {n entities extended, n attributes total / not present}
  [x/—] Adobe I/O Events     — {n events registered / not present}
  [x/—] Async REST API       — {n async routes / not present}
  [x/—] Email Templates      — {n templates / not present}
  [x/—] Payment Method       — {method code / not a new payment method / not present}
  [x/—] GraphQL Schema       — {n queries, n mutations / not present}
  [x/—] Events / Observers   — {n observers across n events / not present}
  [x/—] Dependency Injection     — {n preferences, n plugins / not present}
  [x/—] Additional Configuration — {list filenames found / none}
  [x] Business Logic              — {n PHP logic classes analyzed}
  [x] End-to-End Processing Flow
  [x] Summary

External Dependencies Identified:
  - {list each by name and role}

Any sections to add, modify, or skip before I generate the document?
```

Wait for developer confirmation or adjustments. Only proceed to Phase 4 after receiving approval.

---

## Phase 4 — Output Generation

1. Create `requirements/` directory at the Adobe Commerce project root if it does not exist.
2. Generate the file: `requirements/{Vendor}_{Module}.md`
3. Use this exact section order with sequential numbering:
   1. Document header (Module name, Namespace, Version, Platform, PHP version, Authors)
   2. Table of Contents
   3. Overview
   4. Architecture Summary
   5. External Dependencies
   6. Database Schema *(skip if not present)*
   7. REST API Endpoint *(skip if not present)*
   8. RabbitMQ Message Queue Architecture *(skip if not present)*
   9. Admin Configuration *(skip if not present)*
   10. Cron Jobs *(skip if not present)*
   11. Cache System *(skip if not present)*
   12. Import / Export *(skip if not present)*
   13. Extension Attributes *(skip if not present)*
   14. Adobe I/O Events *(skip if not present)*
   15. Async / Bulk REST API *(skip if not present)*
   16. Email Templates *(skip if not present)*
   17. Payment Method *(skip if not present or no new payment method declared)*
   18. GraphQL Schema *(skip if not present)*
   19. Events / Observers *(skip if not present)*
   20. Dependency Injection *(skip if not present)*
   21. Additional Configuration *(skip if no uncovered config files found)*
   22. Business Logic
   23. End-to-End Processing Flow
   24. Summary
4. Renumber sections in TOC and body to skip any omitted sections.

### Writing Style Rules
- **No PHP class names** in prose — replace with role names (e.g. "Eligibility Engine", "Webhook Handler")
- **No method signatures** or `::` / `->` references anywhere in prose
- **No framework-specific model/interface names** as prose subjects
- All external integrations described by role, not implementation detail
- RabbitMQ payloads: JSON block followed by field description table
- Admin config fields: always include Default column sourced from `etc/config.xml`
- Business Logic: pure prose organized by functional area
- Diagrams: ASCII/text format only

### Self-Review Checklist (complete before saving the file)
- [ ] Every config file that exists has a corresponding section (standard or Additional Configuration)
- [ ] REST API endpoints each have a Request Body field table + JSON sample and a Response field table + JSON sample
- [ ] Adobe I/O Events each have a JSON sample payload block + field table (in addition to the summary table)
- [ ] External Dependencies documents auth mechanism, required headers, and base URL source for every external API
- [ ] Events table includes Event Name, Observer Name, and plain-English Description
- [ ] TOC section numbers match document body numbers
- [ ] No PHP class names in any prose paragraph
- [ ] All RabbitMQ payloads have both JSON block and field table
- [ ] Admin Configuration has Default Values subsection
- [ ] Business Logic is pure prose, no method names
- [ ] End-to-End flows cover all processing paths in the module
- [ ] Summary contains App Builder Implementation Targets covering: Admin UI (grids/forms/menus), Admin Configuration, GraphQL Server, Custom Shipping Method, Backend Actions, and Outbound Integrations — each only if present in the module
- [ ] Summary includes Key Business Rules, Data Contracts, Recommended Implementation Order, and Known Constraints
- [ ] Output file is at `requirements/{Vendor}_{Module}.md`

After writing the file, confirm to the user: *"Requirements document generated at `requirements/{Vendor_Module}.md`."*
