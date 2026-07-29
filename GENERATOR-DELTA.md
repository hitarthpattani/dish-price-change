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
