# Generator Delta — Foundation

This document records the differences between what the `commerce-app-builder-generator` skill
generated for the **Foundation** phase and the changes the developer applied afterward (committed in
`Scaffold Price Change Manager foundation and reorganize shared libs`). It is written as actionable
feedback so the skill's reference templates (`references/foundation/*.md`) and `SKILL.md` can be
updated to match these conventions on future runs.

> Scope: Foundation only. The stub **bodies** (signatures, TODO comments, `_`-prefixed unused params,
> `unknown` usage, throw messages) were kept **byte-for-byte** — every change below is structural,
> organizational, or about tests. No business logic was altered.

## Summary of changes

| #   | Area                        | Generator emitted                                                                                                                                                   | Developer changed to                                                                                                                                              | Template to update                                 |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | lib layout                  | `lib/recurly`, `lib/partner-billing`, `lib/ums-reporting`, `lib/logger`, `lib/errors`, `lib/events/publisher.ts`, `lib/reporting/builder.ts`, `lib/utils/params.ts` | `lib/integrations/<svc>/index.ts` for third-party clients; `lib/utils/<area>/index.ts` for cross-cutting libs; `lib/adobe-commerce/catalog/index.ts` kept         | `05-external-clients.md`, `06-shared-libs.md`      |
| 2   | Module file shape           | Bare single files (`publisher.ts`, `builder.ts`, `params.ts`)                                                                                                       | Folder-per-module `<module>/index.ts` everywhere                                                                                                                  | `05`, `06`                                         |
| 3   | Dir naming                  | snake_case dir `sling_prerenewal_notifications`                                                                                                                     | kebab-case dir `sling-prerenewal-notifications` (collection **name string** kept snake_case; classes PascalCase)                                                  | `04-abdb-collections-repos.md`                     |
| 4   | Types split                 | Domain interfaces inlined (`ReportRow` in builder; nav interfaces in `NavigationProvider/index.tsx`)                                                                | Split exported domain interfaces into sibling `types.ts` (`report-builder/types.ts`, `NavigationProvider/types.ts`). Small local interface (`Logger`) left inline | `06`, `07-admin-ui-scaffold.md`                    |
| 5   | Constants                   | `APP_SLUG`/`APP_NAME` as local consts in the registration action                                                                                                    | Moved to `actions/constants.ts` beside `EXTENSION_ID`; imported                                                                                                   | `07`                                               |
| 6   | Sample cleanup              | Removed only `example` + `commerce/events` action packages                                                                                                          | Also removed the `user` sample ABDB collection/repository **and** their tests                                                                                     | `SKILL.md` §2c                                     |
| 7   | Tests                       | **No tests generated for lib stubs** → 100% coverage gate broke → threshold lowered to 0                                                                            | Added a co-located `test/**` stub per module; **restored coverage gate to 100%**                                                                                  | `SKILL.md` §2d/§2g + a new test template           |
| 8   | Deploy guard (env-specific) | `hooks/pre-app-deploy.js` blocks `stage`/`production`                                                                                                               | Changed `'stage'` → `'skip_stage'` to allow deploy to their Stage workspace                                                                                       | none (workspace-specific, not a generator concern) |
| 9   | `.env.example`              | Created at project root but gitignored by `.env*`                                                                                                                   | Added `!.env.example` negation to `.gitignore` so it is tracked (`.env` stays ignored) — RESOLVED                                                                 | `03-env-example.md` / `.gitignore`                 |

## Details and recommended template edits

### 1 & 2 — `lib/` organization: `integrations/` vs `utils/`, folder-per-module

The developer established two clear ownership buckets under `lib/`:

- `lib/integrations/<service>/index.ts` — third-party API clients: `recurly`, `partner-billing`,
  `ums-reporting`.
- `lib/utils/<area>/index.ts` — cross-cutting helpers: `logger`, `errors`, `events-publisher`,
  `report-builder`, `params`.
- `lib/adobe-commerce/catalog/index.ts` — the Commerce client stays under `adobe-commerce/`
  (not `integrations/`), because it uses the toolkit `AdobeCommerceClient`/connection classes rather
  than a raw `RestClient`.

Every module is a folder with `index.ts` (no bare `<name>.ts`), matching the starter kit's existing
`lib/database/collection/<name>/index.ts` convention.

**Template edit:**

- `06-shared-libs.md`: emit shared libs at `lib/utils/<area>/index.ts`. Map the plan's §5.5 paths
  (`lib/logger`, `lib/errors`, `lib/events/publisher.ts`, `lib/reporting/builder.ts`,
  `lib/utils/params.ts`) → `lib/utils/{logger,errors,events-publisher,report-builder,params}/index.ts`.
- `05-external-clients.md`: emit third-party clients at `lib/integrations/<service>/index.ts`; keep
  the Commerce client at `lib/adobe-commerce/<purpose>/index.ts`.

### 3 — kebab-case directory names

Directory: `lib/database/collection/sling-prerenewal-notifications/` (kebab). The ABDB collection
**name string** passed to `super(...)` stays the source table name `sling_prerenewal_notifications`
(snake_case); the class stays `SlingPrerenewalNotificationsCollection` (PascalCase); the record
interface stays `SlingPrerenewalNotificationRecord`.

**Template edit — `04-abdb-collections-repos.md`:** state the three casings explicitly — directory
kebab-case, collection name string = source table (verbatim), TS identifiers PascalCase — and update
the `@lib/database/collection/<kebab>` import examples.

### 4 — split exported types into `types.ts`

Exported domain interfaces live in a sibling `types.ts` (`report-builder/types.ts`,
`NavigationProvider/types.ts`), matching `collection/<name>/types.ts`. A small, tightly-coupled
interface used only by its own module (`Logger` in `utils/logger/index.ts`) was left inline.

**Template edit — `06`/`07`:** when a module exposes an exported domain interface, generate it in a
sibling `types.ts` and import it; keep small local-only interfaces inline.

### 5 — centralize `APP_SLUG` / `APP_NAME` in `actions/constants.ts`

`actions/constants.ts` now exports `EXTENSION_ID`, `APP_SLUG` (`'price-change'`), and `APP_NAME`
(`'Price Change Manager'`); the registration action imports all three.

**Template edit — `07-admin-ui-scaffold.md`:** add `APP_SLUG`/`APP_NAME` to `actions/constants.ts`
and import them in the registration action instead of declaring them locally.

### 6 — remove the `user` sample lib during §2c cleanup

The starter kit ships a sample `lib/database/collection/user` + `repository/user` (+ tests). The
generator left them; the developer removed all four files.

**SKILL edit — §2c:** extend cleanup to remove the sample `user` collection/repository and their
tests alongside the sample action packages.

### 7 — generate stub tests and keep the 100% coverage gate (highest-value change)

The starter kit's `jest.config.js` enforces 100% global coverage over `actions/**` and `lib/**`.
Because the generator produced stub source with **no matching tests**, `test:ci` failed and the
threshold had to be lowered. The developer added one co-located test per module and **restored the
gate to 100%**.

The test pattern for a throw-only stub is minimal:

```typescript
import { publishInternalEvent } from '@lib/utils/events-publisher'

describe('publishInternalEvent', () => {
  it('should throw TODO error', async () => {
    await expect(
      publishInternalEvent('com.dish.pricechange.prerenewal.received', {})
    ).rejects.toThrow('TODO: implement publishInternalEvent')
  })
})
```

Additional assertions used: pure exports (`FLOW_CODE`, `StepCode` members), and for the repository
`expect(repository.getName()).toBe('sling_prerenewal_notifications')`. Sync throwers use
`expect(() => fn()).toThrow(...)`; async use `await expect(fn()).rejects.toThrow(...)`.

**SKILL/template edit:** add a step (and a `references/foundation/08-stub-tests.md` +
per-flow equivalent) that emits a `test/**` file mirroring every generated `actions/**` and `lib/**`
file, asserting the TODO throw for each method/function plus any pure exports. This drives coverage
to 100% over the stubs so the starter kit's coverage gate never has to be relaxed (removes the §2g /
§3f "lower the threshold" branch entirely for generated stubs).

### 8 — deploy guard (environment-specific, not a generator change)

`hooks/pre-app-deploy.js`: `'stage'` → `'skip_stage'` disables the stage-deploy block so the app can
deploy to the developer's **Stage** workspace (their Console link is Stage, not a dedicated dev
workspace). This is a local/workspace workaround; no template change warranted.

### 9 — `.env.example` was gitignored (RESOLVED in this project)

The generator wrote `.env.example` at the project root, but the starter kit's `.gitignore` line 13
(`.env*`) ignored it, so it would never be committed.

**Resolved here:** a `!.env.example` negation was added to `.gitignore` immediately after the `.env*`
line, so `.env.example` is now tracked while `.env` stays ignored. Verified: `git status` reports
`.env.example` as untracked (ready to add) and `.env` still ignored.

**Template edit — `03-env-example.md` (recommended for the skill):** have the generator add the
`!.env.example` negation to `.gitignore` as part of writing `.env.example` (or write the example env
to a non-ignored path), so the documented env template is tracked on every run without manual fixup.

---

## Plan-accuracy issues found during flow builds

These are inaccuracies in the **migration plan** (`app-builder-migration-planner` output) and/or the
generator templates, discovered when `npm run generate` validated the config against the real
`@adobe/aio-commerce-lib-app` schema. They recur across flows, so fixing them at the planner/template
level avoids repeated per-flow fixups.

### 10 — `businessConfig` has no `select` type (Flow 1, recurs in Flows 3/4/5)

The plan declares every Yes/No toggle as `type: 'select'` with `options: [{Yes,1},{No,0}]` and a
string `default` (`'1'`/`'0'`). The `aio-commerce-lib-app` schema rejects this — allowed types are
`list | text | password | email | url | tel | boolean`.

**Fix applied (Flow 1):** mapped the Yes/No toggle to `type: 'boolean'`, `default: true` (no
`options`). All remaining plan `select` Yes/No fields (Flow 3 §8.4.g, Flow 4 §9.4.g, Flow 5 §10.4.g —
~15 more) will be mapped the same way; a non-binary `select` would map to `type: 'list'`.

**Template/planner edit:** planner should emit `boolean` (or `list`) rather than `select`; generator
`02-config-merge.md` should document the `select → boolean/list` mapping.

### 11 — `eventing.external[]` shape (Flow 1, recurs in Flows 3/4)

The plan (§5.1 and every §N.4.c) shows a flat external entry:
`{ provider, name, label, runtimeActions }`. The schema requires the same nested shape as
`eventing.commerce`: `{ provider: {label, description}, events: [{ name, label, description,
runtimeActions }] }`, where **`description` is required** on both the provider and each event.

**Fix applied (Flow 1):** restructured into `provider + events[]` and added a `description` to the
event. Publish-only event types (Flow 2 §7.4.c `import.error`, Flow 3 §8.4.c `reporting.queued`
before Flow 4 attaches its consumer) will need the same nesting; note the pub/sub merge for
`reporting.queued` (Flow 3 publish + Flow 4 consumer) collapses into one `events[]` entry.

**Template/planner edit:** planner should emit the nested `provider + events[]` shape for
`eventing.external`; generator `02-config-merge.md` should describe merging external events into the
correct provider's `events[]` (dedupe on event `name`, union `runtimeActions`).

### 12 — I/O Events provider needs NO custom install step (resolves §11 item 1 mechanism)

The plan §5.1 prescribed a `installation.customInstallationSteps` entry
(`scripts/register-internal-events-provider.js`) to create the custom I/O Events provider + event
types, and the generator (`references/foundation/01-app-commerce-config.md`) generated that step +
script. **It is unnecessary.** `aio-commerce-lib-app` ships a built-in **`externalEventsStep`** that
automatically creates the I/O Events provider(s) and registers event metadata from the
`eventing.external` declaration at install time.

**Fix applied (Flow 1, commit 4e34295):** removed `installation.customInstallationSteps` from
`app.commerce.config.ts` and deleted `scripts/register-internal-events-provider.js`. This resolves
the **mechanism** half of §11 item 1 (how the provider is created) at the framework level — it is no
longer a blocking design question. (The publish/consume _business logic_ in
`lib/utils/events-publisher` and the consumer remain TODO stubs, like all business logic.)

**Template/planner edit:**

- `01-app-commerce-config.md`: do **not** generate a provider-registration `customInstallationStep`
  or its script for I/O Events providers declared via `eventing.external`; rely on the built-in
  `externalEventsStep`. Only generate `customInstallationSteps` for genuinely custom install work
  (data seeding, external resource provisioning) not covered by the framework's built-in steps.
- `app-builder-migration-planner`: stop prescribing a RabbitMQ→provider registration install step in
  §5.1; note the provider is auto-created from `eventing.external`.

### 13 — Package / action naming (external vs commerce events; concise names)

The generator used the plan's package names `renewal-ingestion` and `commerce-events`, and action
`renewal-notification-receiver`. The developer renamed them (commit 4e34295):

- `commerce-events` → **`external-events`** — these are **external** I/O events (custom provider),
  not Commerce **platform** events (`eventing.commerce`). The name `commerce-events` is misleading
  and also collided conceptually with the starter kit's sample `commerce-events` package (which
  pointed at `actions/commerce/events`).
- `renewal-ingestion` → **`renewal`**, and action `renewal-notification-receiver` → **`notification`**
  (path `actions/renewal/notification`) — concise package/action names; the package already conveys
  "renewal", so the action needn't repeat it.

**Template/planner edit:** planner §5.2 / §N.4.b should name the event-consumer package
`external-events` (reserve `commerce-events` for actual `eventing.commerce` platform-event consumers),
and prefer concise `<package>/<action>` names that don't repeat the package word. Generator
`01-package-declaration.md` / `03-action-files.md` should follow whatever the plan declares but may
apply this naming guidance when the plan is verbose.
