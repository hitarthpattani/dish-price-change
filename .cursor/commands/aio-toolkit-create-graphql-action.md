# AIO Toolkit: Create GraphQL Action

**Command Name:** `aio-toolkit-create-graphql-action`

**Description:** Creates or extends a GraphQL action using @adobe-commerce/aio-toolkit with queries, mutations, and API Gateway

## Workflow

This command creates a new GraphQL action or adds queries/mutations to an existing GraphQL implementation.

### Step 1: Verify Prerequisites

1. Check if `@adobe-commerce/aio-toolkit` is installed in `package.json`
   - If NOT installed, ask user if they want to install it: `npm install @adobe-commerce/aio-toolkit`
2. **Check for existing GraphQL action**
   - Search for `GraphQlAction.execute` in the project
   - If found: Proceed to add queries/mutations/fields to existing action
   - If not found: Create new GraphQL action
3. Detect project language (TypeScript or JavaScript)
   - Check for `typescript` in dependencies + `tsconfig.json`
   - Check for `.ts` files in `actions/` or `lib/`
   - Default to JavaScript if ambiguous
4. Detect project structure
   - Check for `application:` in `app.config.yaml` (root actions)
   - Check for `extensions:` in `app.config.yaml` (extension point actions)

### Step 2: Collect Configuration

**Important**: GraphQL actions are always in the `actions/application/` directory.

#### If Creating NEW GraphQL Action:

Ask the user:

1. **Action Location** (auto-detect or ask)
   - Root application (`actions/application/`)
   - Extension point (`[extension-path]/actions/application/`)

2. **Initial Operation Type**
   - Query (fetch data)
   - Mutation (modify data)

3. **Operation Name** (required)
   - For Query: `getUser`, `listProducts`, `helloWorld`
   - For Mutation: `createUser`, `updateProduct`, `deleteOrder`
   - Used for resolver class name (PascalCase) and operation name (camelCase)

4. **Return Type** (required)
   - Scalar types: `String`, `Int`, `Boolean`, `Float`, `ID`
   - Custom types: `User`, `Product`, `Order`
   - Arrays: `[Product]`, `[String]`
   - If custom type, ask: What fields does this type have?

5. **Type Definitions** (if custom type)
   - Field definitions with types
   - Example: `User` type with `id: ID!, name: String!, email: String`
   - Format: `fieldName: Type` (use `!` for required fields)
   - Ask for description for the type and each field

6. **Mutation Input Parameters** (if Mutation)
   - Parameter names and types
   - Example: `userId: ID!, name: String, email: String`
   - Format: `paramName: Type`

7. **Description** (required)
   - Short (one line): Use `"` format
   - Long (multi-line): Use `"""` format
   - Appears in introspection and GraphiQL documentation

8. **Business Logic Description**
   - Brief description of what the operation should do

9. **Introspection**
   - Enable (default, recommended for development)
   - Disable (secure for production, prevents schema exploration)
   - Note: When enabled, tools like GraphiQL can explore the schema

#### If Adding to EXISTING GraphQL Action:

Ask the user:

1. **What to Add?**
   - New Query
   - New Mutation
   - New Field to existing Query/Mutation
   - New Field to custom Type

2. **For New Query/Mutation**:
   - Ask questions 3-8 from "Creating NEW" section above

3. **For New Field to Query/Mutation**:
   - **Parent Operation**: Which operation? (list existing from schema)
   - **Field Name**: Name of the new field
   - **Field Type**: Type of the field
   - **Description**: Field description
   - **Business Logic**: What should this field resolver do?

4. **For New Field to Custom Type**:
   - **Type Name**: Which custom type? (list existing from schema)
   - **Field Name**: Name of the new field
   - **Field Type**: Type of the field
   - **Description**: Field description
   - **Business Logic**: What should this field resolver do?

### Step 3: Confirm Configuration

Display summary:

```
📋 GraphQL Action Configuration

Action Type: [New GraphQL Action / Add to Existing]
Language: [JavaScript/TypeScript] (auto-detected)
Location: [Root Application / Extension Point]

[If New Action]
Operation Type: [Query/Mutation]
Operation Name: [operationName]
Return Type: [returnType]
[If custom type]
  Custom Type: [TypeName]
  Fields: [field definitions]
[If mutation]
  Input Parameters: [params]
Description: [description]
Introspection: [Enabled/Disabled]

[If Adding to Existing]
Adding: [New Query/Mutation/Field]
To: [existing operation or type]
Details: [relevant details]

API Gateway:
- Endpoint: GET/POST /apis/[namespace]/v1/application/graphql
- Methods: GET, POST
- Response Type: http
- Provisioning: 5-10 minutes

✅ Files to Create/Update:
[If new action]
- actions/application/graphql/index.[js/ts]
- actions/application/resolvers/[OperationName].[js/ts]
- actions/application/actions.config.yaml
- actions/application/apis.config.yaml
- Update app.config.yaml or ext.config.yaml

[If adding to existing]
- Update: actions/application/graphql/index.[js/ts] (schema)
- Create: actions/application/resolvers/[OperationName].[js/ts]

Should I proceed?
```

### Step 4: Generate GraphQL Action

**Directory Structure:**

```
actions/
└── application/
    ├── actions.config.yaml
    ├── apis.config.yaml
    ├── graphql/
    │   └── index.[js/ts]
    └── resolvers/
        ├── HelloWorld.[js/ts]
        └── [OperationName].[js/ts]
```

#### GraphQL Action Template

**JavaScript** (`actions/application/graphql/index.js`):

```javascript
const { GraphQlAction } = require('@adobe-commerce/aio-toolkit');
const HelloWorld = require('../resolvers/HelloWorld');

exports.main = GraphQlAction.execute(
  `type Query {
    "Just a sample query."
    helloWorld: String
  }`,
  async ctx => {
    const helloWorld = new HelloWorld(ctx);
    return {
      helloWorld: await helloWorld.execute(),
    };
  }
  // Optional 3rd parameter: name (default: 'main')
  // Optional 4th parameter: disableIntrospection (default: false)
  // Add 4th param as true to disable introspection for production
);
```

**For Mutations**, use `type Mutation { ... }` instead of `type Query`.

**For Custom Types**, add type definitions:
```javascript
exports.main = GraphQlAction.execute(
  `type Query {
    "Returns user information by ID."
    getUser(id: ID!): User
  }
  
  "Contains details about a user."
  type User {
    "The user identifier."
    id: ID!
    "The name of the user."
    name: String!
    "The email address of the user."
    email: String
  }`,
  async ctx => {
    const getUser = new GetUser(ctx);
    return { getUser: await getUser.execute() };
  }
);
```

**TypeScript:** Same with type annotations and `import` syntax

#### Resolver Template

**JavaScript** (`actions/application/resolvers/[OperationName].js`):

```javascript
class HelloWorld {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async execute() {
    return async (args) => {
      const { logger } = this.ctx;
      logger.info({ message: 'helloWorld-execution', args: JSON.stringify(args) });

      try {
        // TODO: Implement resolver logic
        const result = 'Hello World!';
        
        logger.info({ message: 'helloWorld-success' });
        return result;
      } catch (error) {
        logger.error({ 
          message: 'helloWorld-error', 
          error: error.message, 
          stack: error.stack 
        });
        throw error;
      }
    };
  }
}

module.exports = HelloWorld;
```

**For mutations with arguments:**
```javascript
async execute() {
  return async (args) => {
    const { userId, name, email } = args;
    // Use arguments in business logic
  };
}
```

**TypeScript:** Same with type annotations, use `export default`

### Step 5: Update Configuration Files

#### Actions Configuration

Create `actions/application/actions.config.yaml`:

```yaml
graphql:
  function: graphql/index.[js/ts]
  web: 'yes'
  runtime: nodejs:22
  inputs:
    LOG_LEVEL: debug
  annotations:
    require-adobe-auth: false
    final: true
```

#### API Gateway Configuration

Create `actions/application/apis.config.yaml`:

```yaml
graphql:
  v1:
    application/graphql:
      graphql:
        method: get,post
        response: http
```

#### Main Configuration

Update `app.config.yaml` (or `ext.config.yaml` for extensions):

```yaml
application:
  actions: actions
  web: web-src
  runtimeManifest:
    packages:
      application:
        license: Apache-2.0
        actions:
          $include: ./actions/application/actions.config.yaml
        apis:
          $include: ./actions/application/apis.config.yaml
```

**For Extension Points:**
- Actions in: `[extension-path]/actions/application/`
- If TypeScript: Config references `../../../../build/actions/application/graphql/index.js`
- Update `[extension-path]/ext.config.yaml` with same structure

### Step 6: Adding to Existing GraphQL Action

When adding to an existing GraphQL action:

1. **Update Schema**: Add new query/mutation/field to schema string
2. **Import Resolver**: Add resolver import at top of file
3. **Instantiate**: Create resolver instance in async function
4. **Return**: Add to return object
5. **Create Resolver File**: Create new resolver class file

**Example:**

```javascript
// Before
const HelloWorld = require('../resolvers/HelloWorld');

exports.main = GraphQlAction.execute(
  `type Query {
    "Just a sample query."
    helloWorld: String
  }`,
  async ctx => {
    const helloWorld = new HelloWorld(ctx);
    return { helloWorld: await helloWorld.execute() };
  }
);

// After - Adding getUser query
const HelloWorld = require('../resolvers/HelloWorld');
const GetUser = require('../resolvers/GetUser'); // New import

exports.main = GraphQlAction.execute(
  `type Query {
    "Just a sample query."
    helloWorld: String
    
    "Returns user information by ID."
    getUser(id: ID!): User
  }
  
  "Contains details about a user."
  type User {
    "The user identifier."
    id: ID!
    "The name of the user."
    name: String!
    "The email address of the user."
    email: String
  }`,
  async ctx => {
    const helloWorld = new HelloWorld(ctx);
    const getUser = new GetUser(ctx); // New instantiation
    
    return {
      helloWorld: await helloWorld.execute(),
      getUser: await getUser.execute(), // New resolver
    };
  }
);
```

### Step 7: Completion

Display:

```
✅ GraphQL Action Created Successfully!

📁 Files Created/Updated:
[If new]
- actions/application/graphql/index.[js/ts]
- actions/application/resolvers/[OperationName].[js/ts]
- actions/application/actions.config.yaml
- actions/application/apis.config.yaml
- Updated: app.config.yaml or ext.config.yaml

[If adding to existing]
- Updated: actions/application/graphql/index.[js/ts]
- Created: actions/application/resolvers/[OperationName].[js/ts]

🚀 Next Steps:
1. Implement resolver business logic
2. Test locally: aio app dev
3. Test GraphQL endpoint (see below)
4. Deploy: aio app deploy
5. Wait 5-10 minutes for API Gateway provisioning

🌐 GraphQL Endpoints:
- Local: http://localhost:9080/api/v1/web/[namespace]/application/graphql
- API Gateway: https://[runtime-host]/apis/[namespace]/v1/application/graphql

📝 Testing GraphQL:
- Use Postman, Insomnia, or GraphiQL
- Body: {"query": "{ helloWorld }"}
- Body: {"query": "{ getUser(id: \"123\") { id name email } }"}
- Introspection query: {"query": "{ __schema { types { name } } }"}

📖 Documentation:
- GraphQlAction: @adobe-commerce/aio-toolkit
- GraphQL: https://graphql.org/learn/

💡 GraphQL Features:
- Introspection: [Enabled/Disabled]
- Supports GET and POST methods
- Variable support for complex queries
- Named operations
- Schema validation
```

### Key Features

- **Auto-detection**: Language (TS/JS) and project structure
- **Flexible**: Create new or extend existing GraphQL actions
- **One GraphQL Action Per Project**: All queries, mutations, types in single schema
- **Class-based Resolvers**: Constructor with context, execute method returning async function
- **Schema Descriptions**: Single-line (`"`) or multi-line (`"""`) for documentation
- **Introspection**: Enabled by default (disable for production)
- **API Gateway**: Automatic endpoint creation at `/apis/[namespace]/v1/application/graphql`
- **Best Practices**: Structured logging, error handling, telemetry-ready

### GraphQL Schema Types

**Scalar Types:**
- `String` - Text data
- `Int` - Integer numbers
- `Float` - Floating-point numbers
- `Boolean` - true/false
- `ID` - Unique identifier

**Type Modifiers:**
- `Type!` - Required (non-nullable)
- `[Type]` - Array of Type
- `[Type]!` - Required array
- `[Type!]!` - Required array of required items

**Example Schema:**

```graphql
type Query {
  "Get a single user by ID"
  getUser(id: ID!): User
  
  "Search for users"
  searchUsers(name: String): [User]
  
  """
  Get all products with pagination
  Returns a list of products
  """
  listProducts(page: Int, limit: Int): [Product]!
}

type Mutation {
  "Create a new user"
  createUser(name: String!, email: String!): User
  
  "Update user information"
  updateUser(id: ID!, name: String, email: String): User
}

"User entity with personal information"
type User {
  "Unique user identifier"
  id: ID!
  "User's full name"
  name: String!
  "User's email address"
  email: String
  "List of user's orders"
  orders: [Order]
}
```

### Resolver Pattern

Resolvers follow this class-based pattern:

```javascript
class ResolverName {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async execute() {
    return async (args) => {
      // args = GraphQL operation arguments (field arguments from the query)
      const { logger, headers, telemetry, params } = this.ctx;
      
      // logger   - structured logger with auto-correlation
      // headers  - incoming HTTP request headers
      // telemetry - OpenTelemetry helper for custom spans
      // params   - full OpenWhisk params including:
      //            params.query         (GraphQL query string)
      //            params.variables     (GraphQL variables, already parsed)
      //            params.operationName (named operation, if provided)
      //            params.LOG_LEVEL, params.ENABLE_TELEMETRY, etc. (action inputs)
      
      return result; // Return data matching GraphQL return type
    };
  }
}
```

**Key Points:**
- Constructor receives context from GraphQlAction
- `execute()` returns an async function that receives GraphQL field arguments (`args`)
- `args` contains the field-level arguments (e.g. `id` from `getUser(id: ID!)`)
- `ctx.params` contains the full OpenWhisk params — use it to access action inputs or raw query details
- Throw errors inside the resolver for GraphQL field-level error handling (returned as `errors[]` in the response with HTTP 200)
- Use structured logging

### Related Rules

- **Setting up New Relic Telemetry**: Add observability to your GraphQL action
- **Using PublishEvent**: Publish CloudEvents to Adobe I/O Events from your GraphQL resolver
- **Using RuntimeApiGatewayService**: Call a web-exposed Runtime action via API Gateway from your resolver
- **Using FileRepository**: Persist and retrieve records using Adobe I/O Files storage from your GraphQL resolver
- **Using AbdbCollection**: Add MongoDB-backed App Builder Data storage with schema validation to your GraphQL resolver
- **Using AbdbRepository**: Add full CRUD operations (insert, find, update, delete, pagination) on top of an AbdbCollection in your GraphQL resolver
- **Using Amazon SQS — Publish**: Publish messages to an Amazon SQS queue from a GraphQL resolver

