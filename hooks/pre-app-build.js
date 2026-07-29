#!/usr/bin/env node
/**
 * Pre-app-build hook for Adobe App Builder Extension
 *
 * This hook runs before `aio app build` to ensure TypeScript actions
 * are compiled to JavaScript in the build directory.
 *
 * Purpose:
 * - Clean existing build directory
 * - Compile TypeScript actions to JavaScript
 * - Transform path aliases to relative imports
 * - Ensure fresh build artifacts for deployment
 */

const { Core } = require('@adobe/aio-sdk')
const TypeScriptCompiler = require('./pre-app-build/typescript-compiler')
const TransformPathAliases = require('./pre-app-build/transform-path-aliases')

// Load environment variables from .env file
require('dotenv').config()

const run = () => {
  // Load AIO_runtime_namespace environment variable
  const aioNamespace = process.env.AIO_runtime_namespace || 'extension'

  // create a Logger with namespace-build-hook
  const logger = Core.Logger(`${aioNamespace}-build-hook`, { level: 'debug' })

  try {
    logger.debug('Pre-app-build: Cleaning and rebuilding TypeScript actions...')

    // Get the project root directory
    const projectRoot = process.cwd()

    // Compile TypeScript files using the class-based compiler
    const compiler = new TypeScriptCompiler(logger)
    compiler.compile(projectRoot)

    // Transform path aliases to relative imports for webpack compatibility
    const pathAliasTransformer = new TransformPathAliases(logger)
    pathAliasTransformer.transform(projectRoot)

    logger.debug('Pre-app-build hook completed successfully!')
  } catch (error) {
    logger.error('Pre-app-build hook failed:', error.message)
    // Log helpful debugging information
    logger.error('Debug info:')
    logger.error(`   Working directory: ${process.cwd()}`)
    logger.error(`   Node version: ${process.version}`)

    // Exit with error code to prevent deployment with stale/missing actions
    process.exit(1)
  }
}

module.exports = run

if (require.main === module) {
  run()
}
