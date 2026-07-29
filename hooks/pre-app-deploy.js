#!/usr/bin/env node
/**
 * Pre-app-deploy hook for Adobe App Builder Extension
 *
 * This hook runs before `aio app deploy` to validate workspace and environment.
 *
 * Purpose:
 * - Prevent accidental deployments to stage/production from local environments
 * - Allow CI/CD deployments to all environments
 * - Enforce deployment safety guardrails
 */

const { Core } = require('@adobe/aio-sdk')
require('dotenv').config()

module.exports = params => {
  // Load AIO_runtime_namespace environment variable
  const aioNamespace = process.env.AIO_runtime_namespace

  // create a Logger with namespace-deploy-hook
  const logger = Core.Logger(`${aioNamespace}-deploy-hook`, { level: 'debug' })

  // Check if running in CI/CD environment
  const isCI =
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.JENKINS_URL ||
    process.env.TRAVIS ||
    process.env.CIRCLECI

  if (!isCI) {
    logger.info('💻 Local environment detected - running deployment checks')

    // Extract workspace name with multiple fallback methods
    let workspaceName = null

    // Method 1: From params.project.workspace.name (primary method)
    if (params?.project?.workspace?.name) {
      workspaceName = params.project.workspace.name
      logger.debug('🔍 Found workspace name via params.project:', workspaceName)
    }

    // Method 2: From AIO CLI config directly (fallback)
    if (!workspaceName) {
      try {
        const { execSync } = require('child_process')
        workspaceName = execSync('aio config get project.workspace.name', {
          encoding: 'utf8'
        }).trim()
        logger.debug('🔍 Found workspace name via AIO CLI:', workspaceName)
      } catch (error) {
        logger.debug('🔍 Failed to get workspace name via AIO CLI:', error.message)
      }
    }

    if (!workspaceName) {
      logger.error('❌ Error: workspace name not found - stopping deployment process')
      process.exit(1)
    }

    // Convert to lowercase for comparison
    const workspaceNameLower = workspaceName.toLowerCase()
    logger.debug('🔍 Workspace name (lowercase):', workspaceNameLower)

    // Compare against stage and production values
    if (workspaceNameLower === 'stage' || workspaceNameLower === 'production') {
      logger.error(`🚫 Environment detected: ${workspaceNameLower} - stopping deployment process`)
      process.exit(1) // Error exit to stop execution for stage/production
    }

    logger.info(`✅ Environment detected: ${workspaceNameLower} - allowing execution`)
  } else {
    logger.info('🤖 CI/CD environment detected - skipping deployment checks')
  }
}
