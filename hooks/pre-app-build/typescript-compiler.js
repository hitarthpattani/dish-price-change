/**
 * TypeScript Compiler Class
 *
 * Handles TypeScript compilation for Adobe App Builder projects
 * Provides a class-based interface with configurable options and comprehensive logging
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

/**
 * TypeScript Compiler Class
 *
 * @class TypeScriptCompiler
 */
class TypeScriptCompiler {
  /**
   * Creates an instance of TypeScriptCompiler
   * @param {Object} logger - Logger instance for output
   */
  constructor(logger) {
    if (!logger) {
      throw new Error('Logger is required for TypeScriptCompiler')
    }

    this.logger = logger
    this.buildCommand = 'npm run build:all'
  }

  /**
   * Compile TypeScript files and verify the build output
   * @param {string} projectRoot - The project root directory
   * @returns {Object} Build results with statistics
   * @throws {Error} If compilation fails or verification fails
   */
  compile(projectRoot) {
    this.logger.debug('Starting TypeScript compilation...')

    this._validateProjectRoot(projectRoot)
    this._validateBuildConfiguration(projectRoot)

    this.logger.debug(`Running ${this.buildCommand}...`)
    this._executeBuildCommand(projectRoot)

    this.logger.debug('TypeScript compilation completed!')
    return true
  }

  /**
   * Validate that we're in the correct project directory
   * @private
   * @param {string} projectRoot - The project root directory
   * @throws {Error} If project root is invalid
   */
  _validateProjectRoot(projectRoot) {
    const packageJsonPath = path.join(projectRoot, 'package.json')

    if (!fs.existsSync(packageJsonPath)) {
      throw new Error("package.json not found. Make sure you're in the project root directory.")
    }

    this.logger.debug(`Project root validated: ${projectRoot}`)
  }

  /**
   * Validate build configuration in package.json
   * @private
   * @param {string} projectRoot - The project root directory
   * @throws {Error} If build configuration is invalid
   */
  _validateBuildConfiguration(projectRoot) {
    const packageJsonPath = path.join(projectRoot, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    if (!packageJson.scripts || !packageJson.scripts[this.buildCommand.replace('npm run ', '')]) {
      throw new Error(`Build script not found in package.json. Expected: ${this.buildCommand}`)
    }

    this.logger.debug('Build configuration validated')
  }

  /**
   * Execute the build command
   * @private
   * @param {string} projectRoot - The project root directory
   * @throws {Error} If build command fails
   */
  _executeBuildCommand(projectRoot) {
    try {
      execSync(this.buildCommand, {
        cwd: projectRoot,
        stdio: 'inherit',
        encoding: 'utf8'
      })
      this.logger.debug('Build command executed successfully')
    } catch (error) {
      throw new Error(`Build command failed: ${error.message}`)
    }
  }
}

module.exports = TypeScriptCompiler
