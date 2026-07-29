# Adobe Commerce App Builder Starter Kit

A starter template for building **Adobe Commerce Admin UI extensions** with [Adobe App Builder](https://developer.adobe.com/app-builder/). Use it as a foundation when you need a Commerce backend UI panel, serverless actions on Adobe I/O Runtime, and a local dev workflow that matches production.

## Overview

This project wires up a `commerce/backend-ui/1` extension with:

- **Admin UI** — React app using React Spectrum and the Admin UI SDK (`@adobe/uix-guest`) to run inside the Commerce Admin
- **Runtime actions** — Example actions (including Admin UI SDK registration) built with `@adobe-commerce/aio-toolkit`
- **Shared libraries** — Reusable code under `src/commerce-backend-ui-1/lib` (for example, `database/repository/user`)
- **Tooling** — TypeScript, Jest unit tests, ESLint, Prettier, and deploy hooks

After console setup and `npm run reset` / `npm run setup`, you can run the UI locally, deploy to your dev workspace, and extend the sample components and actions.

## Prerequisites

Before working with this starter kit locally, configure the Adobe I/O CLI and create a project in the [Adobe Developer Console](https://developer.adobe.com/console).

### Adobe I/O CLI installation (required for database)

This starter kit uses **App Builder Data Services** and `@adobe/aio-lib-db`. The DB integration in the Adobe I/O CLI depends on current versions of the App Builder plugins.

**1. Uninstall early access plugins (if applicable)**

If you previously installed early access versions of these plugins, uninstall them **before** updating `@adobe/aio-cli`:

```bash
aio plugins:uninstall @adobe/aio-cli-plugin-app
aio plugins:uninstall @adobe/aio-cli-plugin-app-storage
```

**2. Update the Adobe I/O CLI**

The DB plugin requires:

- `@adobe/aio-cli-plugin-app` **14.7.0** or higher
- `@adobe/aio-cli-plugin-app-storage` **1.5.0** or higher

Install the latest CLI globally — it pulls in compatible plugin versions automatically:

```bash
npm install -g @adobe/aio-cli
```

Verify plugins after install with `aio plugins`. Complete this step before `npm run setup` (which provisions the database via `aio app db provision` after linking your project).

### 1. Create a project

1. Sign in to the [Adobe Developer Console](https://developer.adobe.com/console).
2. Select **Create new project** (or open an existing project you want to use).
3. Add **App Builder** to the project when prompted, or choose the App Builder project template if available.

### 2. Create your own development workspace

Do **not** use the default **Stage** or **Production** workspaces for local development in this starter kit. Instead, create a dedicated workspace for yourself (for example, `dev-yourname` or `local-dev`):

1. Open your project in the [Adobe Developer Console](https://developer.adobe.com/console).
2. Add a new workspace (name it something unique to you or your team).
3. Use that workspace when running `npm run setup` and for local deploys.

This keeps your Runtime namespace and credentials isolated. It also aligns with the **pre-app-deploy** hook (`hooks/pre-app-deploy.js`), which **blocks** `aio app deploy` from a local machine when the linked workspace is `stage` or `production`. Stage and Production deployments are intended to run through CI/CD only.

### 3. Add APIs to the workspace

In **your development workspace**, add the following APIs (add each one from **Add API** / **Add to project** as needed):

| API                                     | Purpose                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| **I/O Management API**                  | Manage Runtime namespaces, credentials, and App Builder project configuration |
| **I/O Events**                          | Eventing infrastructure for App Builder and integrations                      |
| **Adobe I/O Events for Adobe Commerce** | Commerce-specific events and webhooks                                         |
| **App Builder Data Services**           | Data storage and services used by App Builder apps                            |

Complete any OAuth or service configuration steps the console prompts for (for example, linking a Commerce instance for Commerce events).

When the console is ready, continue to [Setup](#setup) and run **`npm run reset`** then **`npm run setup`** to link this repository to your project.

## Setup

After [Prerequisites](#prerequisites) are complete, follow the steps below. The most important step is linking this repo to your Developer Console project with **`npm run reset`** and **`npm run setup`**.

### Local requirements

| Requirement        | Notes                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js** `>=18` | See `engines` in `package.json`. Node 20 LTS is used in CI.                                                                                  |
| **Git**            | Required for Husky git hooks (clone the repo, do not only copy files without `.git`).                                                        |
| **Adobe I/O CLI**  | Latest global install per [Prerequisites](#adobe-io-cli-installation-required-for-database) (uninstall early access plugins first if needed) |

### Step 1: Clone and install

```bash
git clone <your-repo-url>
cd app-builder-starter-kit
npm install
```

`npm install` also runs `prepare` (Husky git hooks). Run `npm run prepare` only if hooks are missing (for example, after `npm install --ignore-scripts`).

### Step 2: Link your Adobe I/O project (`reset` → `setup`)

These two commands connect the starter kit to your Developer Console project and write local config files. **Always run them in this order** on first setup (and again when switching projects or workspaces):

```bash
npm run reset
npm run setup
```

| Command                    | What it does                                                                                                                 | When to use                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **`npm run reset`**        | Clears prior local App Builder config and generates a fresh **`.aio`** and **`.env`** scaffold from the toolkit              | First clone, new machine, wrong project linked, or stale `.env` / `.aio` |
| **`npm run setup`**        | Links console **project** and workspace (`.aio`, `.env`), then runs **`aio app db provision`** for App Builder Data Services | After every `reset`, or when you need to re-link without wiping files    |
| **`npm run db:provision`** | Provisions the database only (same as `aio app db provision`)                                                                | Workspace already linked; re-run after Data Services API changes         |

**Database region**

By default, `npm run setup` runs `aio app db provision` without a region. To target a specific region, pass `--region` to the provision command:

```bash
npm run db:provision -- --region <region-code>
```

Or run the CLI directly:

```bash
aio app db provision --region <region-code>
```

Use this when your workspace or Data Services configuration requires a non-default region. If the default provision during `npm run setup` is not correct for your project, run `npm run db:provision` with `--region` after setup completes.

During `npm run setup`, choose:

- Your App Builder **project**
- **Your development workspace** (for example `dev-yourname`) — **not** Stage or Production
- The correct Runtime namespace and credentials when prompted

When setup finishes, confirm `.aio` and `.env` exist in the project root, that `.env` contains your Runtime credentials, and that database provisioning completed without errors. Regenerate env values later with `aio app use` if needed; re-provision the DB with `npm run db:provision` if required.

**Variants**

| Scenario                                                       | Commands                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| First-time setup (recommended)                                 | `npm run reset` then `npm run setup`                      |
| Re-link project/workspace only (`.aio` / `.env` already valid) | `npm run setup`                                           |
| Automated / scripted setup                                     | `npm run setup:config` (config file + database provision) |

> **Why reset before setup?**  
> `reset` ensures you start from a clean `.aio` and `.env` so `setup` does not merge with outdated credentials or the wrong workspace. Skipping `reset` on first setup can leave you linked to another developer’s config or an old namespace.

### Step 3: Verify (optional)

Before local dev or deploy, you can confirm the link worked:

```bash
npm run dev:validate   # build, lint, format, type-check, tests
npm run app            # start local dev server
```

### Git hooks (optional to know)

Husky is configured automatically on `npm install`. Hooks enforce quality checks before commits and pushes:

| Hook           | Runs                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| **pre-commit** | `lint:fix`, `format`, `type-check`                                                  |
| **pre-push**   | `dev:validate` (`build:all`, `lint:check`, `format:check`, `type-check`, `test:ci`) |

The `dev:setup` script (`npm install` + `prepare`) is equivalent to [Step 1](#step-1-clone-and-install) if you prefer a single command after cloning.

## Local Dev

Start the local dev server:

```bash
npm run app
```

This runs `aio app run`. The app serves on `localhost:9080` by default.

By default the UI is served locally but actions are deployed and served from Adobe I/O Runtime. To run actions locally as well, pass `--local`:

```bash
npm run app -- --local
```

You can pass any other `aio app run` flags after `--` (for example, `npm run app -- --verbose`).

## Ways of Working

All application code for this extension lives under `src/commerce-backend-ui-1/`. Follow the layout below so actions, shared logic, and UI stay separated and deploy correctly.

```
src/commerce-backend-ui-1/
├── actions/          # Adobe I/O Runtime actions (serverless)
├── lib/              # Shared TypeScript used by actions
├── web-src/          # Admin UI (React)
├── test/             # Unit tests for actions and lib
└── ext.config.yaml   # Extension manifest (packages, web, hooks)
```

| Area             | Path       | Import alias                                      | Built for Runtime?                           |
| ---------------- | ---------- | ------------------------------------------------- | -------------------------------------------- |
| Runtime actions  | `actions/` | `@actions/*`                                      | Yes (`npm run build:all` → `build/actions/`) |
| Shared libraries | `lib/`     | `@lib/*`                                          | Yes (bundled with actions)                   |
| Admin UI         | `web-src/` | `@web/*`, `@components/*`, `@types/*`, `@utils/*` | No (served as static web)                    |

### Runtime actions

**Where:** `src/commerce-backend-ui-1/actions/<package>/<action-name>/index.ts`

Actions are grouped into **packages** (for example `example`, `admin-ui-sdk`). Each package has an `actions.config.yaml` that registers its actions with Runtime. Packages are included from `ext.config.yaml` under `runtimeManifest.packages`.

**How to add a new action**

1. Create the action folder and entry file, for example `actions/my-package/my-action/index.ts`.
2. Implement `main` using `@adobe-commerce/aio-toolkit` (`RuntimeAction`, `RuntimeActionResponse`, etc.). See `actions/example/generic/index.ts` for a minimal pattern.
3. Register the action in `actions/my-package/actions.config.yaml` (point `function` at the compiled output under `build/actions/...` after build, matching existing entries).
4. If `my-package` is new, add it to `ext.config.yaml`:

   ```yaml
   runtimeManifest:
     packages:
       my-package:
         license: Apache-2.0
         actions:
           $include: actions/my-package/actions.config.yaml
   ```

5. Add unit tests under `test/actions/my-package/` and run `npm test`.

Use `actions/constants.ts` for values shared across actions (for example extension IDs). Import shared business logic from `lib/` — do not duplicate it inside actions.

### Shared code (`lib/`)

**Where:** `src/commerce-backend-ui-1/lib/<module-name>/`

Put reusable TypeScript here: services, clients, validators, domain helpers — anything actions need but that should not live in a single action file. The sample `lib/database/` layout uses collections (`lib/database/collection/`) and repositories (`lib/database/repository/`).

**How to use**

```typescript
import { UserRepository } from '@lib/database/repository/user'
```

- Import from actions via `@lib/*` (see `tsconfig.extended.json`).
- Add unit tests under `test/lib/<module-name>/`.
- Keep `lib/` free of React or UI code; it compiles with actions via `npm run build:all`.

### Admin UI (`web-src/`)

**Where:** `src/commerce-backend-ui-1/web-src/src/`

The Commerce Admin loads this React app. Source lives under `web-src/src/`; `ext.config.yaml` maps `web: web-src`.

**How to add UI**

1. Create a component folder: `web-src/src/components/MyComponent/index.tsx` (and `types.ts` if needed).
2. Import using aliases:

   ```typescript
   import { MyComponent } from '@components/MyComponent'
   import { EXTENSION_ID } from '@web/types/constants'
   ```

3. Wire the component into the app tree — typically `components/App/`, `components/MainPage/`, or `components/ExtensionRegistration/` depending on whether it is a page, menu item, or registration hook.
4. Use React Spectrum (`@adobe/react-spectrum`) and Admin UI SDK patterns (`@adobe/uix-guest`) consistent with existing components.

The UI calls Runtime actions over HTTP (see `components/ActionsForm/`). Action URLs come from your deployed workspace, not from hard-coded localhost paths in production.

### Tests mirror source

| You change                    | Add or update tests in    |
| ----------------------------- | ------------------------- |
| `actions/<package>/<action>/` | `test/actions/<package>/` |
| `lib/<module>/`               | `test/lib/<module>/`      |

Run `npm run build:all` before deploy so `build/actions/` matches your latest `actions/` and `lib/` sources.

## Test & Coverage

Tests use [Jest](https://jestjs.io/) with [ts-jest](https://kulshekhar.github.io/ts-jest/) (`jest.config.js`). **Use the npm scripts below** — not `aio app test`. This starter kit runs Jest directly against TypeScript in `test/`, with path aliases and a **100%** coverage gate. CI, Husky pre-push, and `dev:validate` all call `npm run test:ci`, so local runs stay aligned with the pipeline.

Unit tests target **actions** and **shared libraries** under `src/commerce-backend-ui-1`; the Admin UI (`web-src`) is excluded (see [configuration](#jest-configuration) below).

### Commands

| Command                 | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `npm test`              | Run unit tests once (day-to-day development)                          |
| `npm run test:watch`    | Run unit tests in watch mode                                          |
| `npm run test:coverage` | Run unit tests with coverage report (inspect `coverage/` locally)     |
| `npm run test:ci`       | **Recommended before push** — CI mode with coverage, no watch         |
| `npm run dev:validate`  | Full local gate: build, lint, format check, type-check, and `test:ci` |

### Test layout

```
src/commerce-backend-ui-1/
├── test/                    # Unit tests (mirrors actions/ and lib/)
│   ├── actions/
│   └── lib/
├── actions/                 # Code under test
└── lib/
```

Unit tests live in `test/` and import from `actions/` and `lib/` using the same path aliases as production code (`@actions/*`, `@lib/*`, etc.).

### Coverage

Coverage is collected from `src/commerce-backend-ui-1/**/*.{js,jsx,ts,tsx}` with these exclusions:

- `test/`, `web-src/`, type definitions, and `node_modules`

Reports are written to `coverage/` (text, `lcov`, and HTML).

**Threshold:** Jest enforces **100%** coverage globally (branches, functions, lines, statements). `npm run test:coverage` or `npm run test:ci` fails if coverage drops below that bar. Add or update tests when you change actions or shared libraries.

### Jest configuration

| Setting             | Value                                                        |
| ------------------- | ------------------------------------------------------------ |
| **Environment**     | `node`                                                       |
| **Roots**           | `src/commerce-backend-ui-1`                                  |
| **Unit test match** | Files under `test/`, or `*.test.*` / `*.spec.*`              |
| **Ignored paths**   | `hooks/`, `web-src/`, `node_modules/`                        |
| **Transform**       | `ts-jest` (uses root `tsconfig.json`)                        |
| **Timeout**         | 30s per test (`jest.setup.js` also sets a 10s default)       |
| **Setup**           | `jest.setup.js` (mocks console noise; keeps `console.error`) |

Path aliases in tests match the app (`@actions`, `@lib`, `@web`, `@components`, `@types`, `@utils`) via `moduleNameMapper` in `jest.config.js`.

## Deploy & Cleanup

```bash
aio app deploy    # build and deploy actions to Runtime and static files to CDN
aio app undeploy  # remove the deployment
```

### Local deploy guardrail

The `pre-app-deploy` hook runs before every deploy. When you deploy **from your local machine**, it allows only workspaces whose names are **not** `stage` or `production` (case-insensitive). That is why [Prerequisites](#prerequisites) recommends a personal development workspace.

| Environment                              | Local `aio app deploy` | CI/CD deploy |
| ---------------------------------------- | ---------------------- | ------------ |
| Your dev workspace (e.g. `dev-yourname`) | Allowed                | Allowed      |
| `stage`                                  | Blocked                | Allowed      |
| `production`                             | Blocked                | Allowed      |

CI/CD pipelines set `CI` / `GITHUB_ACTIONS` (or similar), so the hook skips these checks and Stage/Production deploys proceed in the pipeline.
