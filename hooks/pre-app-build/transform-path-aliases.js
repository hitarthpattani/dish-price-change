/**
 * Transform Path Aliases Class
 *
 * Handles transformation of TypeScript path aliases to relative imports
 * in compiled JavaScript files for webpack compatibility
 */

const path = require('path')
const fs = require('fs')

/**
 * Transform Path Aliases Class
 *
 * @class TransformPathAliases
 */
class TransformPathAliases {
  /**
   * Creates an instance of TransformPathAliases
   * @param {Object} logger - Logger instance for output
   */
  constructor(logger) {
    if (!logger) {
      throw new Error('Logger is required for TransformPathAliases')
    }

    this.logger = logger
    this.jsFileExtension = '.js'
  }

  /**
   * Transform path aliases in compiled JavaScript files
   * @param {string} projectRoot - The project root directory
   */
  transform(projectRoot) {
    this.logger.debug('Starting path alias transformation...')

    const buildPath = path.join(projectRoot, 'build')

    if (!fs.existsSync(buildPath)) {
      throw new Error('Build directory not found. Run TypeScript compilation first.')
    }

    // Load alias mappings from tsconfig.json
    const aliasMap = this._getAliasMapFromTsConfig(projectRoot)

    // Process all JavaScript files
    this._processBuildDirectory(buildPath, buildPath, aliasMap)

    this.logger.debug('Path alias transformation completed!')
  }

  /**
   * Read path aliases from tsconfig.json and convert to alias map
   * @private
   * @param {string} projectRoot - The project root directory
   * @returns {Object} Alias mapping object
   */
  _getAliasMapFromTsConfig(projectRoot) {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.extended.json')

    if (!fs.existsSync(tsconfigPath)) {
      throw new Error(
        'tsconfig.extended.json not found. Path aliases require a valid tsconfig.extended.json file.'
      )
    }

    try {
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8')

      // Extract rootDir to map source paths to build paths
      const rootDirMatch = tsconfigContent.match(/"rootDir"\s*:\s*"([^"]+)"/)
      const rootDir = rootDirMatch ? rootDirMatch[1] : null

      // Extract paths using regex (more reliable than JSON parsing with comments)
      const pathsMatch = tsconfigContent.match(/"paths"\s*:\s*\{([^}]+)\}/)
      if (!pathsMatch) {
        throw new Error(
          'No paths section found in tsconfig.extended.json. Path aliases require a paths configuration.'
        )
      }

      const aliasMap = {}
      const pathRegex = /"([^"]+)"\s*:\s*\[\s*"([^"]+)"\s*\]/g
      let match

      while ((match = pathRegex.exec(pathsMatch[1])) !== null) {
        const alias = match[1].replace('/*', '') + '/'
        let targetPath = match[2].replace('/*', '')

        // Remove rootDir prefix from targetPath since TypeScript already handles this mapping
        if (rootDir) {
          // Normalize both paths for comparison (remove ./ prefix)
          const normalizedRootDir = rootDir.replace(/^\.\//, '')
          const normalizedTargetPath = targetPath.replace(/^\.\//, '')

          if (normalizedTargetPath.startsWith(normalizedRootDir + '/')) {
            // Remove the rootDir prefix
            targetPath = normalizedTargetPath.replace(normalizedRootDir + '/', '')
          }
        }

        if (!targetPath.startsWith('./')) {
          targetPath = './' + targetPath
        }
        aliasMap[alias] = targetPath + '/'
      }

      if (Object.keys(aliasMap).length === 0) {
        throw new Error(
          'No valid path aliases found in tsconfig.extended.json. At least one path mapping is required.'
        )
      }

      this.logger.debug(`Loaded ${Object.keys(aliasMap).length} path aliases`)
      return aliasMap
    } catch (error) {
      throw new Error(`Failed to read tsconfig.extended.json: ${error.message}`)
    }
  }

  /**
   * Process all JavaScript files in the build directory
   * @private
   * @param {string} dirPath - Directory to process
   * @param {string} buildPath - Base build path for relative calculations
   * @param {Object} aliasMap - Alias mapping object
   */
  _processBuildDirectory(dirPath, buildPath, aliasMap) {
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true })

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name)

        if (item.isDirectory()) {
          // Recursively process subdirectories
          this._processBuildDirectory(fullPath, buildPath, aliasMap)
        } else if (item.isFile() && item.name.endsWith(this.jsFileExtension)) {
          this._transformFileAliases(fullPath, buildPath, aliasMap)
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to process directory ${dirPath}: ${error.message}`)
    }
  }

  /**
   * Transform aliases in a single JavaScript file
   * @private
   * @param {string} filePath - Path to the file to transform
   * @param {string} buildPath - Base build path for relative calculations
   * @param {Object} aliasMap - Alias mapping object
   */
  _transformFileAliases(filePath, buildPath, aliasMap) {
    try {
      let content = fs.readFileSync(filePath, 'utf8')
      const originalContent = content
      const currentDir = path.dirname(filePath)

      // Transform each alias
      for (const [alias, replacement] of Object.entries(aliasMap)) {
        const aliasRegex = new RegExp(`(['"])${alias.replace('/', '\\/')}([^'"]*?)\\1`, 'g')

        content = content.replace(aliasRegex, (match, quote, modulePath) => {
          // Calculate relative path from current file to the target
          const targetPath = path.join(buildPath, replacement.replace('./', ''), modulePath)
          const relativePath = path.relative(currentDir, targetPath)

          // Ensure forward slashes for import statements
          const normalizedPath = relativePath.replace(/\\/g, '/')

          // Add ./ prefix if it doesn't start with ..
          const finalPath = normalizedPath.startsWith('../')
            ? normalizedPath
            : './' + normalizedPath

          return `${quote}${finalPath}${quote}`
        })
      }

      // Write back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8')
        const relativePath = path.relative(buildPath, filePath)
        this.logger.debug(`   Transformed: ${relativePath}`)
      }
    } catch (error) {
      this.logger.warn(`   Failed to transform ${filePath}: ${error.message}`)
    }
  }
}

module.exports = TransformPathAliases
