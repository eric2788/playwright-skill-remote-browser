---
name: playwright-skill
description: Control a remote browser to freely browse the internet with Playwright. Navigate to any URL, read page content, extract information, fill forms, take screenshots, and interact with any website. Use when user wants to browse websites, look up information online, extract data from sites, or perform any internet browsing task.
---

**IMPORTANT - Path Resolution:**
This skill can be installed in different locations. Before executing any commands, determine the skill directory based on where you loaded this SKILL.md file, and use that path in all commands below. Replace `$SKILL_DIR` with the actual discovered path.

Example installation paths (adjust to whatever directory your agent framework uses for skills):

- Manual global: `~/.agent/skills/playwright-skill`
- Project-specific: `<project>/.agent/skills/playwright-skill`
- openclaw/picoclaw/nanoclaw: `~/.openclaw/skills/playwright-skill` (or equivalent skills directory for your claw variant)

# Playwright Browser Control

Control a remote browser to browse the internet on behalf of the user. Navigate to any URL, read page content, extract data, fill forms, take screenshots, and interact with any website.

**REQUIRED: Set `PLAYWRIGHT_WS_ENDPOINT`** to the WebSocket endpoint of your remote browser server before running any automation. Example:
```bash
export PLAYWRIGHT_WS_ENDPOINT=ws://localhost:3000
```

## Important: Remote Browser Option Compatibility

When connecting to a remote browser server, only certain options are supported:

**✅ Supported Options** (work with `chromium.connect()`):
- `timeout` - Connection timeout in milliseconds
- `slowMo` - Slow down operations by specified milliseconds
- `headers` - Additional HTTP headers for WebSocket connection
- `logger` - Custom logger implementation

**❌ Unsupported Options** (launch-only, do NOT work with remote browsers):
- `headless` - Browser is already running remotely
- `args` - Cannot pass args to already-running browser
- `executablePath` - Remote browser uses its own executable
- `channel`, `downloadsPath`, `chromiumSandbox`, `devtools`, `proxy`

**Example - Correct usage for remote browser:**
```javascript
// ✅ CORRECT - Using connect with supported options
const browser = await chromium.connect(WS_ENDPOINT, {
  timeout: 60000,  // 60 second connection timeout
  slowMo: 100      // Slow down by 100ms for visibility
});

// ❌ INCORRECT - These options will be ignored
const browser = await chromium.connect(WS_ENDPOINT, {
  headless: false,  // Ignored - browser already running remotely
  args: ['--no-sandbox']  // Ignored - cannot modify remote browser
});
```

## How It Works

1. You describe what you want to browse or do on the web
2. I write custom Playwright code in `./scripts/playwright-browse-*.js` inside the skill directory
3. I execute it via: `cd $SKILL_DIR && node run.js ./scripts/playwright-browse-*.js`
4. Results (text, screenshots, extracted data) are returned in real-time via the remote browser
5. Script files stay in `./scripts/` for easy inspection and re-use

## Setup (First Time)

```bash
cd $SKILL_DIR
npm run setup
```

This installs the Playwright package (no local browser is installed). Make sure `PLAYWRIGHT_WS_ENDPOINT` is set to your remote browser server's WebSocket endpoint.

## Execution Pattern

**Step 1: Write browsing script to `./scripts/`**

```javascript
// ./scripts/playwright-browse-page.js
const { chromium } = require('playwright');

// Remote browser endpoint (required)
const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;

(async () => {
  const browser = await chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();

  await page.goto('https://example.com');
  console.log('Page title:', await page.title());

  // Extract page content
  const content = await page.textContent('body');
  console.log('Page content:', content.slice(0, 500));

  await page.screenshot({ path: './scripts/screenshot.png', fullPage: true });
  console.log('📸 Screenshot saved to ./scripts/screenshot.png');

  await browser.close();
})();
```

**Step 2: Execute from skill directory**

```bash
cd $SKILL_DIR && node run.js ./scripts/playwright-browse-page.js
```

## Common Patterns

### Navigate to a URL and Read Content

```javascript
// ./scripts/playwright-browse-read.js
const { chromium } = require('playwright');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;

(async () => {
  const browser = await chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();

  await page.goto('https://news.ycombinator.com');
  console.log('Title:', await page.title());

  // Extract all article titles
  const items = await page.locator('.titleline > a').allTextContents();
  items.forEach((title, i) => console.log(`${i + 1}. ${title}`));

  await browser.close();
})();
```

### Take a Screenshot of a Website

```javascript
// ./scripts/playwright-browse-screenshot.js
const { chromium } = require('playwright');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;

(async () => {
  const browser = await chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();

  await page.goto('https://example.com', { waitUntil: 'networkidle' });
  await page.screenshot({ path: './scripts/screenshot.png', fullPage: true });
  console.log('📸 Screenshot saved to ./scripts/screenshot.png');

  await browser.close();
})();
```

### Search the Web

```javascript
// ./scripts/playwright-browse-search.js
const { chromium } = require('playwright');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;

(async () => {
  const browser = await chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();

  await page.goto('https://www.google.com');
  await page.fill('textarea[name="q"]', 'Playwright browser automation');
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');

  // Extract search results
  const results = await page.locator('h3').allTextContents();
  results.slice(0, 5).forEach((r, i) => console.log(`${i + 1}. ${r}`));

  await browser.close();
})();
```

### Fill and Submit a Web Form

```javascript
// ./scripts/playwright-browse-form.js
const { chromium } = require('playwright');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;

(async () => {
  const browser = await chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();

  // Replace with the URL of the form you want to test and update selectors below to match that page.
  await page.goto('https://<your-site>/contact');

  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('textarea[name="message"]', 'Hello!');
  await page.click('button[type="submit"]');

  await page.waitForLoadState('networkidle');
  console.log('✅ Form submitted. Current URL:', page.url());

  await browser.close();
})();
```

### Extract Structured Data from a Page

```javascript
// ./scripts/playwright-browse-extract.js
const { chromium } = require('playwright');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;

(async () => {
  const browser = await chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();

  // NOTE: The URL and selectors below are placeholders.
  // Replace 'https://example.com/your-products-page' and the CSS selectors
  // with a real page and DOM structure that match your target site.
  await page.goto('https://example.com/your-products-page');

  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.product')).map(el => ({
      name: el.querySelector('.name')?.textContent?.trim(),
      price: el.querySelector('.price')?.textContent?.trim(),
    }));
  });

  console.log('Products found:', JSON.stringify(products, null, 2));

  await browser.close();
})();
```

### Log In to a Website

```javascript
// ./scripts/playwright-browse-login.js
const { chromium } = require('playwright');

const WS_ENDPOINT = process.env.PLAYWRIGHT_WS_ENDPOINT;

(async () => {
  const browser = await chromium.connect(WS_ENDPOINT);
  const page = await browser.newPage();

  await page.goto('https://example.com/login');

  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'mypassword');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard'); // adjust URL pattern to match the actual site
  console.log('✅ Logged in. Current URL:', page.url());

  await browser.close();
})();
```

## Inline Execution (Simple Tasks)

For quick one-off tasks, you can execute code inline without creating files:

```bash
# Take a quick screenshot of a website
cd $SKILL_DIR && node run.js "
const browser = await chromium.connect(process.env.PLAYWRIGHT_WS_ENDPOINT);
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: './scripts/quick-screenshot.png', fullPage: true });
console.log('Screenshot saved');
await browser.close();
"
```

**When to use inline vs files:**

- **Inline**: Quick one-off tasks (screenshot, get page title, read a single element)
- **Files**: Multi-step browsing sessions, data extraction, anything the user might want to re-run

## Available Helpers

Optional utility functions in `lib/helpers.js`:

```javascript
const helpers = require('./lib/helpers');

// Safe click with retry
await helpers.safeClick(page, 'button.submit', { retries: 3 });

// Safe type with clear
await helpers.safeType(page, '#username', 'testuser');

// Take timestamped screenshot
await helpers.takeScreenshot(page, 'browse-result');

// Handle cookie banners
await helpers.handleCookieBanner(page);

// Extract table data
const data = await helpers.extractTableData(page, 'table.results');
```

See `lib/helpers.js` for full list.

## Custom HTTP Headers

Configure custom headers for all HTTP requests via environment variables. Useful for:

- Identifying automated traffic to your backend
- Getting LLM-optimized responses (e.g., plain text errors instead of styled HTML)
- Adding authentication tokens globally

### Configuration

**Single header (common case):**

```bash
PW_HEADER_NAME=X-Automated-By PW_HEADER_VALUE=playwright-skill \
  cd $SKILL_DIR && node run.js ./scripts/my-script.js
```

**Multiple headers (JSON format):**

```bash
PW_EXTRA_HEADERS='{"X-Automated-By":"playwright-skill","X-Debug":"true"}' \
  cd $SKILL_DIR && node run.js ./scripts/my-script.js
```

### How It Works

Headers are automatically applied when using `helpers.createContext()`:

```javascript
const context = await helpers.createContext(browser);
const page = await context.newPage();
// All requests from this page include your custom headers
```

For scripts using raw Playwright API, use the injected `getContextOptionsWithHeaders()`:

```javascript
const context = await browser.newContext(
  getContextOptionsWithHeaders({ viewport: { width: 1920, height: 1080 } }),
);
```

## Advanced Usage

For comprehensive Playwright API documentation, see [API_REFERENCE.md](API_REFERENCE.md):

- Selectors & Locators best practices
- Network interception & request inspection
- Authentication & session management
- Data extraction & web scraping
- Mobile device emulation
- Multi-page navigation
- Debugging techniques

## Tips

- **Remote browser required** - Set `PLAYWRIGHT_WS_ENDPOINT` to your remote browser server's WebSocket endpoint before running any automation
- **Write scripts to `./scripts/`** - Write to `./scripts/playwright-browse-*.js` inside the skill directory; relative paths work because `run.js` sets the working directory to `$SKILL_DIR`
- **Headless / UI visibility** - When using a remote browser via `chromium.connect()` / `PLAYWRIGHT_WS_ENDPOINT`, headless vs. visible mode is configured on the remote browser server; this skill does not pass a `headless` option and cannot override the server's setting.
- **Custom headers** - Use `PW_HEADER_NAME`/`PW_HEADER_VALUE` env vars to add custom HTTP headers to all requests
- **Wait strategies** - Use `waitForURL`, `waitForSelector`, `waitForLoadState` instead of fixed timeouts
- **Error handling** - Always use try-catch for robust browsing
- **Console output** - Use `console.log()` to surface extracted data, page state, and progress back to the user

## Troubleshooting

**Playwright not installed:**

```bash
cd $SKILL_DIR && npm run setup
```

**PLAYWRIGHT_WS_ENDPOINT not set:**
```bash
export PLAYWRIGHT_WS_ENDPOINT=ws://your-remote-browser:3000
```
Alternatively, if your agent framework stores the endpoint in agent memory, retrieve it from there (e.g. look up a memory entry like `PLAYWRIGHT_WS_ENDPOINT` or `remote_browser_endpoint`).

**Module not found:**
Ensure running from skill directory via `run.js` wrapper

**Element not found:**
Add wait: `await page.waitForSelector('.element', { timeout: 10000 })`

## Example Usage

```
User: "What's the top story on Hacker News right now?"

Agent: I'll open Hacker News and read the top stories.
[Writes browsing script to ./scripts/playwright-browse-hn.js]
[Runs: cd $SKILL_DIR && node run.js ./scripts/playwright-browse-hn.js]
[Output: 1. "Some Interesting Article" - 342 points]
The top story is "Some Interesting Article" with 342 points.
```

```
User: "Take a screenshot of github.com"

Agent: I'll navigate to GitHub and take a screenshot.
[Runs inline: chromium.connect → page.goto('https://github.com') → page.screenshot('./scripts/screenshot.png')]
[Output: 📸 Screenshot saved to ./scripts/screenshot.png]
[Attaches screenshot]
```

```
User: "Search for 'Playwright docs' on Google and tell me the first result"

Agent: I'll search Google for you.
[Writes browsing script to ./scripts/playwright-browse-search.js]
[Runs: cd $SKILL_DIR && node run.js ./scripts/playwright-browse-search.js]
[Output: 1. Playwright: Fast and Reliable End-to-End Testing... - playwright.dev]
The first result is "Playwright: Fast and Reliable End-to-End Testing" at playwright.dev.
```

## Notes

- Each browsing session is custom-written for your specific request
- Not limited to pre-built scripts - any browser task on any website is possible
- Browse scripts and screenshots stored in `./scripts/` relative to the skill directory
- Code executes reliably with proper module resolution via `run.js`
- Progressive disclosure - API_REFERENCE.md loaded only when advanced features needed
