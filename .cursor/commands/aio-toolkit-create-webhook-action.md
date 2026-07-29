# AIO Toolkit: Create Webhook Action

**Command Name:** `aio-toolkit-create-webhook-action`

**Description:** Creates a webhook action using @adobe-commerce/aio-toolkit with signature verification and API Gateway support

## Workflow

This command creates a new webhook action with optional signature verification and API Gateway endpoint.

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
   - Example: `customer-validation`, `order-webhook`, `product-sync-webhook`

2. **Action Location** (auto-detect or ask)
   - Root application (`actions/`)
   - Extension point (`[extension-path]/actions/`)

3. **Package Structure**
   - Simple: `actions/[action-name]/index.[js/ts]`
   - Packaged: `actions/[package]/[action-name]/index.[js/ts]`
   - If packaged, ask for package name (e.g., `webhooks`, `customers`, `orders`)

4. **Signature Verification** (security feature)
   - **Disabled** - No signature verification (SignatureVerification.DISABLED)
   - **Enabled with PUBLIC_KEY** - Requires PUBLIC_KEY in `.env`
   - **Enabled with PUBLIC_KEY_BASE64** - Requires base64 encoded key in `.env`
   - Note: Signature verification validates webhook requests from Adobe Commerce using HMAC SHA256
   - Reference: [Adobe Commerce Signature Verification](https://developer.adobe.com/commerce/extensibility/webhooks/signature-verification/)

5. **Required Parameters** (comma-separated or empty)
   - Example: `orderId, customerId, webhookData`

6. **Required Headers** (comma-separated or empty)
   - Example: `Authorization, x-webhook-signature`
   - Note: If `Authorization` included, sets `require-adobe-auth: true`

7. **Error Handling**
   - Specific error scenarios to handle
   - Example: Invalid signature, missing data, processing errors
   - Note: WebhookActionResponse.exception() accepts optional message and exception type

8. **Business Logic Description**
   - Brief description of what the webhook should do

9. **Response Type**
   - **success**: Continue process without changes (most common)
   - **exception**: Terminate process with optional error message and exception class
   - **add**: Add data to event arguments at path (with optional DataObject instance class)
   - **replace**: Replace values in event arguments at path (with optional DataObject instance class)
   - **remove**: Remove data from event arguments at path
   - Note: Response is a 200 OK with JSON object containing the operation details

10. **API Gateway Configuration** (optional, recommended)
    - Do you want to create an API Gateway endpoint?
    - If Yes, ask:
      - **Base Path**: Default `v1` (e.g., `v1`, `v2`, `api`)
      - **Relative Path**: e.g., `customers/validation`, `webhooks/order`
      - **HTTP Method**: Default `post` (options: `get`, `post`, `put`, `delete`, `patch`)
      - **Response Type**: Default `http` (options: `http`, `json`, `text`, `html`)

### Step 3: Confirm Configuration

Display summary:

```
📋 Webhook Action Configuration

Action Name: [name]
Language: [JavaScript/TypeScript] (auto-detected)
Location: [Root/Extension]
Package: [package-name or simple]
Signature Verification: [Disabled/Enabled]
Required Parameters: [params or none]
Required Headers: [headers or none]
Authentication: [Yes/No]
Business Logic: [description]
Response Operation: [success/exception/add/replace/remove]
  - success: Continue process without changes
  - exception: Terminate process with error
  - add: Add data to event arguments
  - replace: Replace values in event arguments  
  - remove: Remove data from event arguments

API Gateway: [Yes/No]
[If Yes]
  Endpoint: [method] /apis/[namespace]/[base-path]/[relative-path]
  Response Type: [http/json/text/html]

✅ Files to Create:
- actions/[path]/index.[js/ts]
- Update app.config.yaml or ext.config.yaml
[- actions/[package]/actions.config.yaml if packaged]
[- actions/[package]/apis.config.yaml if API Gateway]
[- .env with PUBLIC_KEY if signature verification enabled]

Should I proceed?
```

### Step 4: Generate Webhook Action

Create action file with this template:

**JavaScript:**
```javascript
const {
  WebhookAction,
  WebhookActionResponse,
  SignatureVerification,
} = require('@adobe-commerce/aio-toolkit');
const name = '[action-name]';

exports.main = WebhookAction.execute(
  name,
  [/* 'param1', 'param2' */],
  [/* 'Authorization', 'x-webhook-signature' */],
  SignatureVerification.DISABLED, // or ENABLED
  async (params, ctx) => {
    const { logger } = ctx;
    logger.info({ message: `${name}-received`, params: JSON.stringify(params) });

    try {
      // TODO: Implement webhook business logic
      logger.info({ message: `${name}-processed` });
      return WebhookActionResponse.success();
    } catch (error) {
      logger.error({ message: `${name}-error`, error: error.message, stack: error.stack });
      // Optional parameters: message and exceptionType
      return WebhookActionResponse.exception(
        `Failed: ${error.message}`,
        '\\Magento\\Framework\\Exception\\LocalizedException'
      );
      // Or simply: WebhookActionResponse.exception('Failed');
    }
  }
);
```

**TypeScript:** Same with type annotations and `import` syntax

**Notes:**
- If Authorization header NOT in requiredHeaders, set `require-adobe-auth: false`
- If signature verification enabled, ensure PUBLIC_KEY in `.env`
- Enable in Commerce Admin: Stores > Configuration > Adobe Services > Webhooks

### Step 5: Update Configuration Files

Add action to `app.config.yaml` or `ext.config.yaml`:

**Simple structure:**
```yaml
application:
  runtimeManifest:
    packages:
      [package-name]:
        license: Apache-2.0
        actions:
          [action-name]:
            function: actions/[action-name]/index.[js/ts]
            web: 'yes'
            runtime: nodejs:22
            inputs:
              LOG_LEVEL: debug
              # If signature verification enabled:
              PUBLIC_KEY: $PUBLIC_KEY
              # OR: PUBLIC_KEY_BASE64: $PUBLIC_KEY_BASE64
            annotations:
              require-adobe-auth: [true/false]
              final: true
              # Required when signature verification is enabled:
              raw-http: true
        # If API Gateway requested:
        apis:
          [action-name]:
            [base-path]:
              [relative-path]:
                [action-name]:
                  method: post
                  response: http
```

**Packaged structure:**
- Create `actions/[package]/actions.config.yaml` with action config
- If API Gateway: Create `actions/[package]/apis.config.yaml`
- Reference both in main config

### Step 6: Setup Signature Verification (if enabled)

If signature verification enabled:

1. **Get Public Key from Commerce Admin:**
   - Navigate to: Stores → Configuration → Adobe Services → Webhooks
   - Set Signature Verification: Yes
   - Click "Regenerate key pair"
   - Copy the Public Key

2. **Add to `.env` file (project root):**
   ```bash
   # Option 1: Standard format (recommended)
   PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
   [your public key here]
   -----END PUBLIC KEY-----"
   
   # Option 2: Base64 encoded
   PUBLIC_KEY_BASE64="[your base64 encoded key]"
   ```

3. **Ensure `raw-http: true` is set in `app.config.yaml`:**
   - `raw-http: true` is **required** for signature verification to work
   - Without it, `__ow_body` is never populated and signature verification always fails
   - The annotation must be under `annotations:` in the action configuration

4. **Security Notes:**
   - Never commit `.env` to version control
   - Add `.env` to `.gitignore`
   - Regenerate keys regularly
   - Update `.env` when keys are regenerated

### Step 7: Completion

Display:

```
✅ Webhook Action Created Successfully!

📁 Files Created:
- actions/[path]/index.[js/ts]
[- .env with PUBLIC_KEY placeholder if signature verification enabled]

📝 Configuration Updated:
- app.config.yaml or ext.config.yaml
[- actions/[package]/actions.config.yaml if packaged]
[- actions/[package]/apis.config.yaml if API Gateway]

🚀 Next Steps:
1. Implement webhook business logic
[2. Add PUBLIC_KEY to .env if signature verification enabled]
[3. Wait 5-10 mins for API Gateway provisioning if configured]
4. Test locally: aio app dev
5. Deploy: aio app deploy
6. Test webhook endpoint
[7. Configure webhook in Adobe Commerce Admin if needed]

📖 Documentation:
- WebhookAction: @adobe-commerce/aio-toolkit
- Signature Verification: https://developer.adobe.com/commerce/extensibility/webhooks/signature-verification/
- Webhook Responses: https://developer.adobe.com/commerce/extensibility/webhooks/responses/

🔐 Signature Verification:
[If enabled]
- Protects against unauthorized webhook requests
- Uses HMAC SHA256 validation
- Commerce sends x-adobe-commerce-webhook-signature header
- Toolkit validates automatically using PUBLIC_KEY from .env

📤 Webhook Responses:
- All responses return 200 OK with JSON operation object
- Operations: success, exception, add, replace, remove
- Commerce processes the operation and modifies event arguments accordingly
- See WebhookActionResponse Operations section for detailed examples

🌐 API Gateway:
[If configured]
- Endpoint: https://adobeioruntime.net/apis/[namespace]/[base-path]/[relative-path]
- Provisioning: 5-10 minutes (may see 404 errors during)
- Response Type: [http/json/text/html]
```

### Key Features

- **Auto-detection**: Language (TS/JS) and project structure
- **Flexible**: Simple or packaged actions
- **Signature Verification**: HMAC SHA256 webhook validation for Adobe Commerce
- **API Gateway**: Optional standardized API endpoints (5-10 min provisioning)
- **Response Operations**: Full Adobe Commerce webhook spec support
  - `success`: Continue without changes
  - `exception`: Terminate with error
  - `add`: Add data to event arguments (with optional DataObject instance)
  - `replace`: Replace values in event arguments (with optional DataObject instance)
  - `remove`: Remove data from event arguments
- **Best Practices**: Structured logging, error handling, telemetry-ready
- **Configuration Management**: Automatic config file updates

### WebhookActionResponse Operations

Adobe Commerce webhooks expect a 200 response with a JSON object indicating the operation result. The toolkit provides these methods:

#### **success()** - Continue Process Without Changes

The process that triggered the original event continues without any changes.

```javascript
return WebhookActionResponse.success();
```

Returns:
```json
{ "op": "success" }
```

#### **exception(message?, exceptionType?)** - Terminate Process

Causes Commerce to terminate the process that triggered the original event. The exception is logged in Commerce's system.log.

**Parameters:**
- `message` (optional): Exception message shown to the end user
- `exceptionType` (optional): Fully qualified Magento exception class name (e.g., `\\Magento\\Framework\\Exception\\LocalizedException`). Only fields that are provided are included in the response.

```javascript
// With custom message and exception type
return WebhookActionResponse.exception(
  'The product cannot be added to the cart because it is out of stock',
  'Path\\To\\Exception\\Class'
);

// With just message
return WebhookActionResponse.exception('Processing failed');
```

Returns:
```json
{
  "op": "exception",
  "type": "Path\\To\\Exception\\Class",
  "message": "The product cannot be added to the cart because it is out of stock"
}
```

#### **add(path, value, instance?)** - Add Data to Event Arguments

Updates the arguments in the original event by adding data at the specified path.

**Parameters:**
- `path` (required): Path where value should be added to triggered event arguments
- `value` (required): Value to add (single value or object)
- `instance` (optional): DataObject class name to create from the value

```javascript
// Add a new shipping method
return WebhookActionResponse.add(
  'result',
  {
    data: {
      amount: '5',
      base_amount: '5',
      carrier_code: 'newshipmethod',
      carrier_title: 'Webhook new shipping method'
    }
  },
  'Magento\\Quote\\Api\\Data\\ShippingMethodInterface'
);
```

Returns:
```json
{
  "op": "add",
  "path": "result",
  "value": {
    "data": {
      "amount": "5",
      "base_amount": "5",
      "carrier_code": "newshipmethod",
      "carrier_title": "Webhook new shipping method"
    }
  },
  "instance": "Magento\\Quote\\Api\\Data\\ShippingMethodInterface"
}
```

#### **replace(path, value, instance?)** - Replace Values in Event Arguments

Replaces argument values in the original event at the specified path.

**Parameters:**
- `path` (required): Path where value should be replaced (use `/` for nested paths)
- `value` (required): Replacement value (single value or object)
- `instance` (optional): DataObject class name to create from the value

```javascript
// Replace nested shipping method amount
return WebhookActionResponse.replace(
  'result/shipping_methods/shipping_method_one/amount',
  6
);

// Replace customer email
return WebhookActionResponse.replace(
  'customer/email',
  'newemail@example.com'
);
```

Returns:
```json
{
  "op": "replace",
  "path": "result/shipping_methods/shipping_method_one/amount",
  "value": 6
}
```

#### **remove(path)** - Remove Data from Event Arguments

Removes values or nodes from the arguments in the original event by the provided path.

**Parameters:**
- `path` (required): Path of value to remove (use `/` for nested paths)

```javascript
// Remove a specific key
return WebhookActionResponse.remove('result/key2');

// Remove internal notes from order
return WebhookActionResponse.remove('order/internal_notes');
```

Returns:
```json
{
  "op": "remove",
  "path": "result/key2"
}
```


### Related Rules

- **Setting up New Relic Telemetry**: Add observability to your webhook action
- **Using PublishEvent**: Publish CloudEvents to Adobe I/O Events from your webhook action
- **Using RuntimeApiGatewayService**: Call another web-exposed Runtime action via API Gateway from your webhook
- **Using FileRepository**: Persist and retrieve records using Adobe I/O Files storage from your webhook action
- **Using AbdbCollection**: Add MongoDB-backed App Builder Data storage with schema validation to your webhook action
- **Using AbdbRepository**: Add full CRUD operations (insert, find, update, delete, pagination) on top of an AbdbCollection in your webhook action
- **Create Shipping Carrier**: If this webhook action handles Adobe Commerce OOPE shipping rates, use the `aio-toolkit-create-shipping-carrier` command instead — it generates both the carrier class (`lib/shipping-carriers/`) and the webhook action together, including optional Commerce OOPE API management methods
- **Using Amazon SQS — Publish**: Publish messages to an Amazon SQS queue from your webhook action

