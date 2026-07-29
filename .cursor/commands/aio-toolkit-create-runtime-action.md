# AIO Toolkit: Create Runtime Action

**Command Name:** `aio-toolkit-create-runtime-action`

**Description:** Creates a runtime action using @adobe-commerce/aio-toolkit

## Workflow

This command creates a new runtime action with @adobe-commerce/aio-toolkit.

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
   - Example: `order-processor`, `customer-sync`, `product-list`

2. **Action Location** (auto-detect or ask)
   - Root application (`actions/`)
   - Extension point (`[extension-path]/actions/`)

3. **Package Structure**
   - Simple: `actions/[action-name]/index.[js/ts]`
   - Packaged: `actions/[package]/[action-name]/index.[js/ts]`
   - If packaged, ask for package name

4. **HTTP Methods** (comma-separated or empty for all)
   - Options: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
   - Example: `POST, GET`

5. **Required Parameters** (comma-separated or empty)
   - Example: `orderId, customerId`

6. **Required Headers** (comma-separated or empty)
   - Example: `Authorization, x-api-key`
   - Note: If `Authorization` included, sets `require-adobe-auth: true`

7. **Business Logic Description**
   - Brief description of what the action should do

8. **Success Response Data**
   - What data should the action return on success?
   - Example: `{ orderId, status }`, `{ products: [...] }`, `{ message: "Success" }`
   - This will be passed to RuntimeActionResponse.success(result)

### Step 3: Confirm Configuration

Display summary:

```
📋 Runtime Action Configuration

Action Name: [name]
Language: [JavaScript/TypeScript] (auto-detected)
Location: [Root/Extension]
Package: [package-name or simple]
HTTP Methods: [methods or all]
Required Parameters: [params or none]
Required Headers: [headers or none]
Authentication: [Yes/No]
Business Logic: [description]
Success Response: [data structure]

✅ Files to Create:
- actions/[path]/index.[js/ts]
- Update app.config.yaml or ext.config.yaml
[- actions/[package]/actions.config.yaml if packaged]

Should I proceed?
```

### Step 4: Generate Runtime Action

Create action file with this template:

**JavaScript:**
```javascript
const {
  RuntimeAction,
  RuntimeActionResponse,
  HttpMethod,
  HttpStatus,
} = require('@adobe-commerce/aio-toolkit');
const name = '[action-name]';

exports.main = RuntimeAction.execute(
  name,
  [/* HttpMethod.GET, HttpMethod.POST */],
  [/* 'param1', 'param2' */],
  [/* 'Authorization', 'x-api-key' */],
  async (params, ctx) => {
    const { logger } = ctx;
    logger.info({ message: `${name}-processing`, params: JSON.stringify(params) });

    try {
      // TODO: Implement business logic
      const result = {
        /* your response data */
      };
      
      logger.info({ message: `${name}-success` });
      return RuntimeActionResponse.success(result);
    } catch (error) {
      logger.error({ message: `${name}-error`, error: error.message, stack: error.stack });
      return RuntimeActionResponse.error(
        HttpStatus.INTERNAL_ERROR, 
        `Failed: ${error.message}`
      );
    }
  }
);
```

**TypeScript:** Same with type annotations and `import` syntax

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
            annotations:
              require-adobe-auth: [true/false]
              final: true
```

**Packaged structure:**
Create `actions/[package]/actions.config.yaml` and reference in main config.

### Step 6: Completion

Display:

```
✅ Runtime Action Created Successfully!

📁 Files Created:
- actions/[path]/index.[js/ts]

📝 Configuration Updated:
- app.config.yaml or ext.config.yaml
[- actions/[package]/actions.config.yaml if packaged]

🚀 Next Steps:
1. Implement business logic in the action
2. Test locally: aio app dev
3. Deploy: aio app deploy
4. Test the action endpoint

📖 Documentation:
- RuntimeAction: @adobe-commerce/aio-toolkit

💡 Response Methods:
- success(result): Returns 200 with your data
- error(statusCode, message): Returns error with HTTP status code
- See RuntimeActionResponse Methods section for examples
```

### Key Features

- **Auto-detection**: Language (TS/JS) and project structure
- **Flexible**: Simple or packaged actions
- **HTTP Method Validation**: GET, POST, PUT, DELETE, PATCH
- **Parameter & Header Validation**: Automatic validation before execution
- **Response Methods**: success and error with proper HTTP status codes
- **Best Practices**: Structured logging, error handling, telemetry-ready
- **Configuration Management**: Automatic config file updates

### RuntimeActionResponse Methods

Runtime actions return responses using these methods:

#### **success(result, headers?)** - Return Successful Response

Returns a successful response with the provided result data and 200 status code.

**Parameters:**
- `result` (required): The data to return in the response body
- `headers` (optional): Custom HTTP response headers to include (`Record<string, string>`, default `{}`)

```javascript
// Return success with data
return RuntimeActionResponse.success({ 
  orderId: '12345', 
  status: 'completed',
  message: 'Order processed successfully'
});

// Return success with array
return RuntimeActionResponse.success([
  { id: 1, name: 'Product A' },
  { id: 2, name: 'Product B' }
]);

// Return success with custom response headers
return RuntimeActionResponse.success(
  { message: 'Success' },
  { 'Cache-Control': 'max-age=300', 'X-Custom-Header': 'value' }
);
```

Returns:
```json
{
  "statusCode": 200,
  "body": {
    "orderId": "12345",
    "status": "completed",
    "message": "Order processed successfully"
  }
}
```

#### **error(statusCode, message)** - Return Error Response

Returns an error response with the specified HTTP status code and error message.

**Parameters:**
- `statusCode` (required): HTTP status code from HttpStatus enum
- `message` (required): Error message string

**Available HttpStatus codes:**
- `HttpStatus.BAD_REQUEST` (400) - Invalid request
- `HttpStatus.UNAUTHORIZED` (401) - Authentication required
- `HttpStatus.NOT_FOUND` (404) - Resource not found
- `HttpStatus.METHOD_NOT_ALLOWED` (405) - HTTP method not allowed
- `HttpStatus.INTERNAL_ERROR` (500) - Internal server error

```javascript
// Internal server error
return RuntimeActionResponse.error(
  HttpStatus.INTERNAL_ERROR, 
  'Failed to process order'
);

// Bad request error
return RuntimeActionResponse.error(
  HttpStatus.BAD_REQUEST, 
  'Invalid order ID provided'
);

// Not found error
return RuntimeActionResponse.error(
  HttpStatus.NOT_FOUND, 
  'Customer not found'
);

// With error details from exception
catch (error) {
  return RuntimeActionResponse.error(
    HttpStatus.INTERNAL_ERROR, 
    `Failed: ${error.message}`
  );
}
```

Returns:
```json
{
  "error": {
    "statusCode": 500,
    "body": {
      "error": "Failed to process order"
    }
  }
}
```

### Related Rules

- **Setting up New Relic Telemetry**: Add observability to your runtime action
- **Using PublishEvent**: Publish CloudEvents to Adobe I/O Events from your runtime action
- **Using RuntimeApiGatewayService**: Call another web-exposed Runtime action via API Gateway from your action
- **Using FileRepository**: Persist and retrieve records using Adobe I/O Files storage from your runtime action
- **Using AbdbCollection**: Add MongoDB-backed App Builder Data storage with schema validation to your runtime action
- **Using AbdbRepository**: Add full CRUD operations (insert, find, update, delete, pagination) on top of an AbdbCollection in your runtime action
- **Using Amazon SQS — Publish**: Publish messages to an Amazon SQS queue from your runtime action
- **Create Amazon SQS Consumer**: Create the scheduler + worker pair to consume messages from an Amazon SQS queue

