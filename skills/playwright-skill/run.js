#!/usr/bin/env node
/**
 * Universal Playwright Executor
 *
 * Executes Playwright automation code from:
 * - File path: node run.js script.js
 * - Inline code: node run.js 'await page.goto("...")'
 * - Stdin: cat script.js | node run.js
 *
 * Requires PLAYWRIGHT_WS_ENDPOINT env var pointing to a remote browser server.
 * Ensures proper module resolution by running from skill directory.
 */

const fs = require('fs');
const path = require('path');

// Change to skill directory for proper module resolution
process.chdir(__dirname);

/**
 * Get code to execute from various sources
 */
function getCodeToExecute() {
  const args = process.argv.slice(2);

  // Case 1: File path provided
  if (args.length > 0 && fs.existsSync(args[0])) {
    const filePath = path.resolve(args[0]);
    console.log(`📄 Executing file: ${filePath}`);
    return fs.readFileSync(filePath, 'utf8');
  }

  // Case 2: Inline code provided as argument
  if (args.length > 0) {
    console.log('⚡ Executing inline code');
    return args.join(' ');
  }

  // Case 3: Code from stdin
  if (!process.stdin.isTTY) {
    console.log('📥 Reading from stdin');
    return fs.readFileSync(0, 'utf8');
  }

  // No input
  console.error('❌ No code to execute');
  console.error('Usage:');
  console.error('  node run.js script.js          # Execute file');
  console.error('  node run.js "code here"        # Execute inline');
  console.error('  cat script.js | node run.js    # Execute from stdin');
  process.exit(1);
}

/**
 * Clean up old temporary execution files from previous runs
 */
function cleanupOldTempFiles() {
  try {
    const files = fs.readdirSync(__dirname);
    const tempFiles = files.filter(f => f.startsWith('.temp-execution-') && f.endsWith('.js'));

    if (tempFiles.length > 0) {
      tempFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // Ignore errors - file might be in use or already deleted
        }
      });
    }
  } catch (e) {
    // Ignore directory read errors
  }
}

/**
 * Wrap code in async IIFE if not already wrapped.
 *
 * EXECUTION PATH BEHAVIOR:
 *
 * 1. If code has NO require() statements (!hasRequire):
 *    - Wraps in full template with remote browser validation and proxy
 *    - Automatically redirects .launch() → .connect() via proxy
 *    - Best for: Inline code snippets, simple automation tasks
 *    - User scripts can use .launch() syntax unchanged
 *
 * 2. If code HAS require() statements (hasRequire):
 *    - Assumes code is a complete script managing its own imports
 *    - Only adds async IIFE wrapper if missing
 *    - NO proxy wrapping - user must explicitly use .connect()
 *    - Best for: Complete standalone scripts, complex automation
 *    - User must write: chromium.connect(process.env.PLAYWRIGHT_WS_ENDPOINT)
 *
 * IMPORTANT: This means "existing scripts require no changes" only applies to
 * inline code without require() statements. File-based scripts that import
 * playwright must be updated to use .connect() instead of .launch().
 *
 * @param {string} code - The code to wrap
 * @returns {string} Wrapped code ready for execution
 */
function wrapCodeIfNeeded(code) {
  // Check if code already has require() and async structure
  const hasRequire = code.includes('require(');
  const hasAsyncIIFE = code.includes('(async () => {') || code.includes('(async()=>{');

  // If it's already a complete script, return as-is
  if (hasRequire && hasAsyncIIFE) {
    return code;
  }

  // If it's just Playwright commands, wrap in full template
  if (!hasRequire) {
    return `
const _playwright = require('playwright');
const { devices } = _playwright;
const helpers = require('./lib/helpers');

// Remote browser endpoint (required)
const _WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;
if (!_WS_ENDPOINT) {
  console.error('❌ PLAYWRIGHT_WS_ENDPOINT environment variable is required.');
  console.error('   Set it to the WebSocket endpoint of your remote browser server.');
  process.exit(1);
}

/**
 * Wrap browser types so that .launch() transparently connects to the remote browser.
 *
 * IMPORTANT: This proxy intercepts .launch() calls and redirects them to .connect().
 * However, launch() and connect() have different option sets:
 *
 * Launch-only options (NOT supported for remote browsers):
 *   - headless, args, executablePath, channel, downloadsPath, chromiumSandbox, devtools, proxy
 *
 * Connect-compatible options (supported):
 *   - timeout, slowMo, headers, logger, wsEndpoint
 *
 * This function filters options and warns users about unsupported launch-only options.
 *
 * @param {Object} browserType - Playwright browser type (chromium/firefox/webkit)
 * @returns {Proxy} Proxied browser type with launch→connect redirection
 */
function _wrapBrowser(browserType) {
  return new Proxy(browserType, {
    get(target, prop) {
      if (prop === 'launch') {
        return async (options = {}) => {
          // Launch-only options that don't work with remote browser connections
          const launchOnlyOptions = [
            'headless', 'args', 'executablePath', 'channel',
            'downloadsPath', 'chromiumSandbox', 'devtools', 'proxy'
          ];

          // Check if user provided any launch-only options
          const providedLaunchOptions = Object.keys(options)
            .filter(key => launchOnlyOptions.includes(key));

          if (providedLaunchOptions.length > 0) {
            console.warn(
              '⚠️  Warning: The following launch-only options are not supported when connecting to a remote browser ' +
              'and will be ignored: ' + providedLaunchOptions.join(', ')
            );
            console.warn('    Remote browsers are already running, so options like headless, args, etc. cannot be applied.');
          }

          // Filter to only connect-compatible options
          const connectOptions = {};
          const validConnectOptions = ['timeout', 'slowMo', 'headers', 'logger'];

          Object.keys(options).forEach(key => {
            if (validConnectOptions.includes(key)) {
              connectOptions[key] = options[key];
            }
          });

          return target.connect(_WS_ENDPOINT, connectOptions);
        };
      }
      return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
    }
  });
}

const chromium = _wrapBrowser(_playwright.chromium);
const firefox = _wrapBrowser(_playwright.firefox);
const webkit = _wrapBrowser(_playwright.webkit);

// Extra headers from environment variables (if configured)
const __extraHeaders = helpers.getExtraHeadersFromEnv();

/**
 * Utility to merge environment headers into context options.
 * Use when creating contexts with raw Playwright API instead of helpers.createContext().
 * @param {Object} options - Context options
 * @returns {Object} Options with extraHTTPHeaders merged in
 */
function getContextOptionsWithHeaders(options = {}) {
  if (!__extraHeaders) return options;
  return {
    ...options,
    extraHTTPHeaders: {
      ...__extraHeaders,
      ...(options.extraHTTPHeaders || {})
    }
  };
}

(async () => {
  try {
    ${code}
  } catch (error) {
    console.error('❌ Automation error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
`;
  }

  // If has require but no async wrapper
  if (!hasAsyncIIFE) {
    return `
(async () => {
  try {
    ${code}
  } catch (error) {
    console.error('❌ Automation error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
`;
  }

  return code;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎭 Playwright Skill - Universal Executor\n');

  // Clean up old temp files from previous runs
  cleanupOldTempFiles();

  // Get code to execute
  const rawCode = getCodeToExecute();
  const code = wrapCodeIfNeeded(rawCode);

  // Create temporary file for execution
  const tempFile = path.join(__dirname, `.temp-execution-${Date.now()}.js`);

  try {
    // Write code to temp file
    fs.writeFileSync(tempFile, code, 'utf8');

    // Execute the code
    console.log('🚀 Starting automation...\n');
    require(tempFile);

    // Note: Temp file will be cleaned up on next run
    // This allows long-running async operations to complete safely

  } catch (error) {
    console.error('❌ Execution failed:', error.message);
    if (error.stack) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
