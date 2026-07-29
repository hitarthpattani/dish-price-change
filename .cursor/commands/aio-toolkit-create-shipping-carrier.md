# AIO Toolkit: Create Shipping Carrier

**Command Name:** `aio-toolkit-create-shipping-carrier`

**Description:** Creates an Adobe Commerce OOPE (Out-of-Process Extensibility) custom shipping carrier using @adobe-commerce/aio-toolkit — including the carrier class, webhook action for rate computation, and optional Commerce API management methods.

## Workflow

This command creates a complete OOPE shipping carrier implementation: a carrier class in `lib/shipping-carriers/` and a `WebhookAction` in `actions/` that Commerce calls at checkout to retrieve available shipping rates.

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

### Step 2: Collect Carrier Configuration

Ask the user:

1. **Carrier Class Name** (required)
   - PascalCase class name, e.g., `FlatRateCarrier`, `ExpressCarrier`, `TablerateEmployee`

2. **Carrier Code** (required)
   - Unique identifier registered in Commerce Admin, format: `oope_[name]`
   - Must contain only alphanumeric characters and underscores
   - Example: `oope_flat_rate`, `oope_express`, `oope_tablerate_employee`

3. **Carrier Display Title** (required)
   - Customer-facing name shown at checkout, e.g., `Flat Rate Shipping`, `Express Delivery`

4. **Supported Stores** (comma-separated, or `all` for no restriction)
   - Store view codes from Commerce Admin → Stores → All Stores
   - Example: `default`, `en_us,en_ca`, `arcteryx_en`

5. **Supported Countries** (comma-separated ISO 3166-1 alpha-2 codes, or `all`)
   - Example: `US,CA`, `US,CA,GB,AU`

6. **Sort Order** (default: `10`)
   - Display order at checkout — lower numbers appear first

7. **Rate Methods** — How many rate methods does this carrier offer?
   - For each method, ask:
     - **Method code** (e.g., `standard`, `express`, `overnight`)
     - **Method title** (e.g., `Standard Shipping (5-7 days)`)
     - **Rate logic** — static price or computed from `params`?
       - Static: ask for price and cost values
       - Dynamic: ask which `params` fields drive the computation (e.g., `cart_total`, `destination_country`, `weight`)

8. **Signature Verification**
   - **Disabled** — `SignatureVerification.DISABLED` (simplest, use for dev/testing)
   - **Enabled with PUBLIC_KEY** — Requires `PUBLIC_KEY` env var
   - **Enabled with PUBLIC_KEY_BASE64** — Requires base64-encoded key in env var

9. **Action Name** (default: `shipping-rates`)
   - The webhook action name in `app.config.yaml`

10. **Action Location**
    - Root application (`actions/`)
    - Extension point (`[extension-path]/actions/`)

11. **Package Structure**
    - Simple: `actions/[action-name]/index.[js/ts]`
    - Packaged: `actions/[package]/[action-name]/index.[js/ts]`

12. **Commerce OOPE Management Methods** (optional)
    - Does this carrier class also need methods to register/fetch/update/delete itself in Commerce via the OOPE REST API?
    - If **Yes**, ask:
      - **Connection type**: `Oauth1a` (recommended), `IMS`, or `Basic`
      - Which methods are needed: `fetchCarrier`, `fetchAllCarriers`, `registerCarrier`, `updateCarrier`, `deleteCarrier`
    - If **No**, skip the Commerce client integration

### Step 3: Confirm Configuration

Display summary:

```
📋 Shipping Carrier Configuration

Carrier Class: [ClassName]
Carrier Code: [oope_code]
Display Title: [title]
Stores: [stores or all]
Countries: [countries or all]
Sort Order: [order]
Language: [JavaScript/TypeScript] (auto-detected)

Rate Methods:
  - [method-code]: [method-title] — [static $X.XX | dynamic from params.[field]]
  [... for each method]

Signature Verification: [Disabled/PUBLIC_KEY/PUBLIC_KEY_BASE64]
Action Name: [action-name]
Location: [Root/Extension]
Package: [package-name or simple]
Commerce OOPE Management: [Yes (Oauth1a/IMS/Basic) | No]

✅ Files to Create:
- lib/shipping-carriers/[carrier-name]/index.[js/ts]
- actions/[path]/index.[js/ts]
- Update app.config.yaml or ext.config.yaml

Should I proceed?
```

### Step 4: Generate Carrier Class

Create `lib/shipping-carriers/[carrier-name]/index.[js|ts]`.

Use kebab-case for the directory name derived from the carrier class name (e.g., `FlatRateCarrier` → `flat-rate`, `TablerateEmployee` → `tablerate-employee`).

#### A. Basic carrier class (no Commerce management)

**JavaScript:**
```javascript
/*
 * <license header>
 */

const { ShippingCarrier } = require('@adobe-commerce/aio-toolkit');

/**
 * [ClassName] — [display title] shipping carrier.
 *
 * Extends ShippingCarrier to configure the carrier and its available rate methods.
 * Use getData() to retrieve the carrier configuration and addMethod() to build rates.
 *
 * @example
 * const carrier = new [ClassName]();
 * carrier.addMethod('standard', (method) => {
 *   method.setMethodTitle('Standard Shipping').setPrice(5.99).setCost(3.00);
 * });
 * const operations = new ShippingCarrierResponse(carrier).generate();
 */
class [ClassName] extends ShippingCarrier {
  /**
   * Carrier code registered in Adobe Commerce OOPE configuration.
   * Must match the code configured in Commerce Admin.
   */
  static CARRIER_CODE = '[oope_code]';

  constructor() {
    super([ClassName].CARRIER_CODE, (carrier) => {
      carrier.setTitle('[display title]');
      carrier.setStores([/* ['default'] or [] for all stores */]);
      carrier.setCountries([/* ['US', 'CA'] or [] for all countries */]);
      carrier.setSortOrder([sort_order]);
    });
  }
}

module.exports = { [ClassName] };
```

**TypeScript:**
```typescript
/*
 * <license header>
 */

import { ShippingCarrier } from '@adobe-commerce/aio-toolkit';

/**
 * [ClassName] — [display title] shipping carrier.
 */
export class [ClassName] extends ShippingCarrier {
  public static readonly CARRIER_CODE = '[oope_code]';

  constructor() {
    super([ClassName].CARRIER_CODE, (carrier) => {
      carrier.setTitle('[display title]');
      carrier.setStores([/* ['default'] or [] for all stores */]);
      carrier.setCountries([/* ['US', 'CA'] or [] for all countries */]);
      carrier.setSortOrder([sort_order]);
    });
  }
}
```

#### B. Carrier class with Commerce OOPE management methods

When the user selects "Yes" for Commerce OOPE Management, extend the class with `AdobeCommerceClient` (lazy init) and the OOPE REST API methods. Do NOT use `@adobe-commerce/aio-services-kit` — use `AdobeCommerceClient` directly.

**JavaScript:**
```javascript
/*
 * <license header>
 */

const { ShippingCarrier, AdobeCommerceClient } = require('@adobe-commerce/aio-toolkit');
const { AdobeCommerceClientBuilder } = require('@lib/adobe-commerce/client-builder');

class [ClassName] extends ShippingCarrier {
  static CARRIER_CODE = '[oope_code]';

  /** @type {AdobeCommerceClient|undefined} */
  #client;

  /** @type {Promise<AdobeCommerceClient>|undefined} */
  #clientInitPromise;

  /**
   * @param {object} params - Action params (process.env equivalent)
   */
  constructor(params) {
    super([ClassName].CARRIER_CODE, (carrier) => {
      carrier.setTitle('[display title]');
      carrier.setStores([/* stores */]);
      carrier.setCountries([/* countries */]);
      carrier.setSortOrder([sort_order]);
    });

    this.params = params;
  }

  /**
   * Lazily initializes and returns the AdobeCommerceClient.
   * @private
   * @returns {Promise<AdobeCommerceClient>}
   */
  async #getClient() {
    if (this.#client) return this.#client;
    if (this.#clientInitPromise) return this.#clientInitPromise;

    this.#clientInitPromise = AdobeCommerceClientBuilder.generate(this.params);
    this.#client = await this.#clientInitPromise;
    this.#clientInitPromise = undefined;

    return this.#client;
  }

  /**
   * Fetches this carrier's configuration from Commerce.
   * @returns {Promise<{success: boolean, statusCode?: number, message: any}>}
   */
  async fetchCarrier() {
    const client = await this.#getClient();
    return client.get(`rest/V1/oope_shipping_carrier/${[ClassName].CARRIER_CODE}`);
  }

  /**
   * Fetches all registered OOPE shipping carriers from Commerce.
   * @returns {Promise<{success: boolean, statusCode?: number, message: any}>}
   */
  async fetchAllCarriers() {
    const client = await this.#getClient();
    return client.get('rest/V1/oope_shipping_carrier');
  }

  /**
   * Registers this carrier in Commerce (creates the OOPE carrier record).
   * Call this once during setup / deployment — not on every webhook request.
   * @param {object} [payload] - Optional override payload; defaults to this.getData()
   * @returns {Promise<{success: boolean, statusCode?: number, message: any}>}
   */
  async registerCarrier(payload = undefined) {
    const client = await this.#getClient();
    const carrierData = payload || this.getData();
    return client.post('rest/V1/oope_shipping_carrier', { carrier: carrierData });
  }

  /**
   * Updates this carrier's configuration in Commerce.
   * @param {object} [payload] - Optional override payload; defaults to this.getData()
   * @returns {Promise<{success: boolean, statusCode?: number, message: any}>}
   */
  async updateCarrier(payload = undefined) {
    const client = await this.#getClient();
    const carrierData = payload || this.getData();
    return client.put('rest/V1/oope_shipping_carrier', { carrier: carrierData });
  }

  /**
   * Deletes this carrier from Commerce.
   * @returns {Promise<{success: boolean, statusCode?: number, message: any}>}
   */
  async deleteCarrier() {
    const client = await this.#getClient();
    return client.delete(`rest/V1/oope_shipping_carrier/${[ClassName].CARRIER_CODE}`);
  }
}

module.exports = { [ClassName] };
```

**TypeScript:**
```typescript
/*
 * <license header>
 */

import { ShippingCarrier, type AdobeCommerceClient } from '@adobe-commerce/aio-toolkit';
import {
  AdobeCommerceClientBuilder,
  type AdobeCommerceClientParams,
} from '@lib/adobe-commerce/client-builder';

interface [ClassName]Params extends AdobeCommerceClientParams {
  // add any additional params your carrier needs here
}

export class [ClassName] extends ShippingCarrier {
  public static readonly CARRIER_CODE = '[oope_code]';

  private params: [ClassName]Params;
  private client?: AdobeCommerceClient;
  private clientInitPromise?: Promise<AdobeCommerceClient>;

  constructor(params: [ClassName]Params) {
    super([ClassName].CARRIER_CODE, (carrier) => {
      carrier.setTitle('[display title]');
      carrier.setStores([/* stores */]);
      carrier.setCountries([/* countries */]);
      carrier.setSortOrder([sort_order]);
    });

    this.params = params;
  }

  private async getClient(): Promise<AdobeCommerceClient> {
    if (this.client) return this.client;
    if (this.clientInitPromise) return this.clientInitPromise;

    this.clientInitPromise = AdobeCommerceClientBuilder.generate(
      this.params as AdobeCommerceClientParams
    ) as Promise<AdobeCommerceClient>;

    this.client = await this.clientInitPromise;
    this.clientInitPromise = undefined;

    return this.client;
  }

  /** Fetches this carrier's OOPE configuration from Commerce. */
  public async fetchCarrier() {
    const client = await this.getClient();
    return client.get(`rest/V1/oope_shipping_carrier/${[ClassName].CARRIER_CODE}`);
  }

  /** Fetches all registered OOPE shipping carriers from Commerce. */
  public async fetchAllCarriers() {
    const client = await this.getClient();
    return client.get('rest/V1/oope_shipping_carrier');
  }

  /**
   * Registers this carrier in Commerce.
   * Call this once during setup — not on every webhook request.
   */
  public async registerCarrier(payload?: object) {
    const client = await this.getClient();
    const carrierData = payload || this.getData();
    return client.post('rest/V1/oope_shipping_carrier', { carrier: carrierData });
  }

  /** Updates this carrier's configuration in Commerce. */
  public async updateCarrier(payload?: object) {
    const client = await this.getClient();
    const carrierData = payload || this.getData();
    return client.put('rest/V1/oope_shipping_carrier', { carrier: carrierData });
  }

  /** Deletes this carrier from Commerce. */
  public async deleteCarrier() {
    const client = await this.getClient();
    return client.delete(`rest/V1/oope_shipping_carrier/${[ClassName].CARRIER_CODE}`);
  }
}
```

### Step 5: Generate WebhookAction

Create `actions/[action-name]/index.[js|ts]`.

#### A. Static rates

**JavaScript:**
```javascript
/*
 * <license header>
 */

const {
  WebhookAction,
  WebhookActionResponse,
  ShippingCarrierResponse,
  SignatureVerification,
} = require('@adobe-commerce/aio-toolkit');
const { [ClassName] } = require('@lib/shipping-carriers/[carrier-name]');

const name = '[action-name]';

exports.main = WebhookAction.execute(
  name,
  SignatureVerification.[DISABLED|ENABLED_WITH_PUBLIC_KEY|ENABLED_WITH_PUBLIC_KEY_BASE64],
  [],
  async (params, ctx) => {
    const { logger } = ctx;

    logger.info({ message: `${name}-start` });

    const carrier = new [ClassName]();

    carrier.addMethod('[method-code]', (method) => {
      method
        .setMethodTitle('[Method Title]')
        .setPrice([price])
        .setCost([cost])
        .addAdditionalData('delivery_time', '[X-Y business days]');
    });

    // [Add more methods as needed]

    const operations = new ShippingCarrierResponse(carrier).generate();

    logger.info({ message: `${name}-complete`, methods: carrier.getAddedMethods().length });

    return WebhookActionResponse.success(operations);
  }
);
```

#### B. Dynamic rates (computed from params)

```javascript
exports.main = WebhookAction.execute(
  name,
  SignatureVerification.[DISABLED|ENABLED],
  [],
  async (params, ctx) => {
    const { logger } = ctx;

    logger.info({ message: `${name}-start` });

    // Access Commerce webhook payload fields
    const cartTotal = params.cart_total || 0;
    const destinationCountry = params.destination_country || 'US';
    // [Access other params fields as needed]

    const carrier = new [ClassName]();

    // Compute rates based on params
    const standardPrice = cartTotal >= 50 ? 0 : 5.99;   // example: free over $50

    carrier.addMethod('standard', (method) => {
      method
        .setMethodTitle(standardPrice === 0 ? 'Free Standard Shipping' : 'Standard Shipping (5-7 days)')
        .setPrice(standardPrice)
        .setCost(3.00)
        .addAdditionalData('delivery_time', '5-7 business days');
    });

    // Example: only offer express for domestic
    if (destinationCountry === 'US') {
      carrier.addMethod('express', (method) => {
        method
          .setMethodTitle('Express Shipping (1-2 days)')
          .setPrice(19.99)
          .setCost(12.00)
          .addAdditionalData('delivery_time', '1-2 business days');
      });
    }

    logger.info({
      message: `${name}-rates-computed`,
      country: destinationCountry,
      cart_total: cartTotal,
      methods: carrier.getAddedMethods().length,
    });

    const operations = new ShippingCarrierResponse(carrier).generate();
    return WebhookActionResponse.success(operations);
  }
);
```

**TypeScript:** Same structure with `import` syntax and type annotations.

### Step 6: Update Configuration Files

Add action to `app.config.yaml` or `ext.config.yaml`.

**Basic (no signature verification):**
```yaml
[action-name]:
  function: actions/[action-name]/index.[js/ts]
  web: 'yes'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    require-adobe-auth: true
    final: true
```

**With signature verification:**
```yaml
[action-name]:
  function: actions/[action-name]/index.[js/ts]
  web: 'yes'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
    PUBLIC_KEY: $PUBLIC_KEY        # or PUBLIC_KEY_BASE64: $PUBLIC_KEY_BASE64
  annotations:
    require-adobe-auth: true
    raw-http: true                 # REQUIRED for signature verification — populates __ow_body
    final: true
```

> **`raw-http: true` is mandatory when signature verification is enabled.** Without it, `__ow_body` is not populated and signature verification will always fail.

**With Commerce OOPE management methods** (additional inputs needed):
```yaml
[action-name]:
  function: actions/[action-name]/index.[js/ts]
  web: 'yes'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
    COMMERCE_BASE_URL: $COMMERCE_BASE_URL
    # Oauth1a connection inputs:
    OAUTH_CONSUMER_KEY: $OAUTH_CONSUMER_KEY
    OAUTH_CONSUMER_SECRET: $OAUTH_CONSUMER_SECRET
    OAUTH_ACCESS_TOKEN: $OAUTH_ACCESS_TOKEN
    OAUTH_ACCESS_TOKEN_SECRET: $OAUTH_ACCESS_TOKEN_SECRET
    # IMS connection inputs (use instead of Oauth1a if IMS):
    # IMS_CLIENT_ID: $IMS_CLIENT_ID
    # IMS_CLIENT_SECRET: $IMS_CLIENT_SECRET
    # IMS_TECHNICAL_ACCOUNT_ID: $IMS_TECHNICAL_ACCOUNT_ID
    # IMS_TECHNICAL_ACCOUNT_EMAIL: $IMS_TECHNICAL_ACCOUNT_EMAIL
    # IMS_ORG_ID: $IMS_ORG_ID
  annotations:
    require-adobe-auth: true
    final: true
```

### Step 7: Add Environment Variables (if applicable)

If signature verification is enabled, add to `.env`:
```bash
# Shipping webhook signature verification
PUBLIC_KEY=your-public-key
# or PUBLIC_KEY_BASE64=your-base64-encoded-public-key
```

If Commerce OOPE management methods are included, add to `.env`:
```bash
# Adobe Commerce connection
COMMERCE_BASE_URL=https://your-store.com   # store root URL — do NOT include /rest or /V1

# Oauth1a (recommended)
OAUTH_CONSUMER_KEY=
OAUTH_CONSUMER_SECRET=
OAUTH_ACCESS_TOKEN=
OAUTH_ACCESS_TOKEN_SECRET=
```

### Step 8: Completion

Display:

```
✅ Shipping Carrier Created Successfully!

📁 Files Created:
- lib/shipping-carriers/[carrier-name]/index.[js/ts]   ← carrier class
- actions/[action-name]/index.[js/ts]                  ← webhook action

📝 Configuration Updated:
- app.config.yaml or ext.config.yaml

🚀 Next Steps:
1. Register the carrier in Commerce Admin → Stores → Configuration → Shipping Methods
   - Set Carrier Code to: [oope_code]
   - Set the webhook URL to your deployed action endpoint
2. Test locally: aio app dev
3. Deploy: aio app deploy
4. Test by going to checkout — your carrier should appear in shipping options

[If Commerce management methods were added:]
5. Call carrier.registerCarrier(params) from a setup action to create the OOPE record in Commerce

📖 Documentation:
- ShippingCarrier, ShippingCarrierMethod, ShippingCarrierResponse: @adobe-commerce/aio-toolkit
- OOPE Shipping Carrier API: GET/POST/PUT /V1/oope_shipping_carrier, DELETE /V1/oope_shipping_carrier/{code}

⚠️  Important Notes:
- CARRIER_CODE must match exactly what is registered in Commerce Admin
- raw-http: true is required in app.config.yaml when signature verification is enabled
- registerCarrier() / updateCarrier() should be called from a setup/deploy action — not on every webhook invocation
- The OOPE Commerce API requires AdobeCommerceClient with appropriate connection credentials
```

---

### Key Features

- **Auto-detection**: Language (TS/JS) and project structure
- **Carrier class pattern**: Extends `ShippingCarrier`, static `CARRIER_CODE` constant, constructor configuration via callback
- **Static or dynamic rates**: Hardcoded prices or computed from Commerce webhook `params` payload
- **Signature verification**: Three modes — disabled, PUBLIC_KEY, PUBLIC_KEY_BASE64
- **Optional OOPE management**: `AdobeCommerceClient` with lazy init for fetch/register/update/delete — no `aio-services-kit` dependency
- **All 5 OOPE endpoints**: `GET /V1/oope_shipping_carrier`, `GET /V1/oope_shipping_carrier/{code}`, `POST`, `PUT`, `DELETE /{code}`
- **Lazy client init**: Single `clientInitPromise` guard prevents duplicate initializations
- **Commerce client builder**: Uses `lib/adobe-commerce/client-builder` pattern (see "Creating Adobe Commerce Client Operations" rule)

---

### OOPE Commerce API Reference

| Operation | Method | Endpoint | Body |
|---|---|---|---|
| List all carriers | `GET` | `rest/V1/oope_shipping_carrier` | — |
| Get by code | `GET` | `rest/V1/oope_shipping_carrier/{code}` | — |
| Create carrier | `POST` | `rest/V1/oope_shipping_carrier` | `{ carrier: ShippingCarrierData }` |
| Update carrier | `PUT` | `rest/V1/oope_shipping_carrier` | `{ carrier: ShippingCarrierData }` |
| Delete carrier | `DELETE` | `rest/V1/oope_shipping_carrier/{code}` | — |

**Response shape** (from `AdobeCommerceClient`):
```javascript
// Success
{ success: true, message: { code, title, active, stores, countries, ... } }

// Failure
{ success: false, statusCode: 401, message: 'Unauthorized' }
```

---

### ShippingCarrier Key Components

```javascript
// Carrier constructor
new ShippingCarrier(code, callback?)
// code: unique carrier code — only alphanumeric + underscores, must match Commerce Admin
// callback: optional setup function — called immediately with `this` for fluent config

// Configuration methods (all return `this` for chaining)
carrier.setTitle('Display Name')
carrier.setStores(['default', 'en_us'])   // [] or omit for all stores
carrier.setCountries(['US', 'CA'])         // [] or omit for all countries
carrier.setSortOrder(10)                   // lower = appears first at checkout
carrier.setActive(true)                    // default: true
carrier.setTrackingAvailable(true)         // default: true
carrier.setShippingLabelsAvailable(true)   // default: true

// Rate methods
carrier.addMethod('method-code', (method) => {
  method
    .setMethodTitle('Display Name')
    .setPrice(9.99)       // customer-facing price
    .setCost(5.00)        // merchant cost (does not affect customer price)
    .addAdditionalData('key', 'value');   // arbitrary metadata
});
carrier.removeMethod('method-code')   // marks method for removal

// Getters
carrier.getData()              // returns carrier config as plain object (no methods)
carrier.getAddedMethods()      // returns ShippingCarrierMethodData[] for added methods
carrier.getRemovedMethods()    // returns string[] of method codes marked for removal

// Response
new ShippingCarrierResponse(carrier).generate()
// Returns WebhookActionResponseType[] — pass to WebhookActionResponse.success()
```

---

### Related Rules

- **"Creating Adobe Commerce Client Operations"** (`aio-toolkit-create-adobe-commerce-client.mdc`) — required when Commerce OOPE management methods are included; sets up `AdobeCommerceClient` and the `lib/adobe-commerce/client-builder` pattern
- **"Using AdobeAuth"** (`aio-toolkit-use-adobe-auth.mdc`) — use when the Commerce client uses `ImsConnection` with explicit S2S credentials
- **"Setting up New Relic Telemetry"** (`aio-toolkit-setup-new-relic-telemetry.mdc`) — add observability to the webhook action
- **"Using PublishEvent"** (`aio-toolkit-use-publish-event.mdc`) — publish events after processing a shipping rate request
