# Playwright Skill - Complete API Reference

This document contains the comprehensive Playwright API reference and advanced patterns for browser control and internet browsing. For quick-start execution patterns, see [SKILL.md](SKILL.md).

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Core Patterns](#core-patterns)
- [Selectors & Locators](#selectors--locators)
- [Common Actions](#common-actions)
- [Waiting Strategies](#waiting-strategies)
- [Network Inspection & Interception](#network-inspection--interception)
- [Authentication & Session Management](#authentication--session-management)
- [Screenshots & Visual Capture](#screenshots--visual-capture)
- [Mobile Device Emulation](#mobile-device-emulation)
- [Debugging](#debugging)
- [Performance Measurement](#performance-measurement)
- [Data Extraction Patterns](#data-extraction-patterns)
- [Common Patterns & Solutions](#common-patterns--solutions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Installation & Setup

### Prerequisites

Before using this skill, ensure the Playwright package is available and a remote browser server is running:

```bash
# Check if Playwright is installed
npm list playwright 2>/dev/null || echo "Playwright not installed"

# Install (if needed) without downloading local browser binaries
cd /path/to/skills/playwright-skill
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
npm run setup
```

### Basic Configuration

Set the remote browser WebSocket endpoint:

```bash
export PLAYWRIGHT_WS_ENDPOINT=ws://your-remote-browser-host:3000
```

## Core Patterns

### Basic Browser Automation

```javascript
const { chromium } = require('playwright');

(async () => {
  // Connect to remote browser (PLAYWRIGHT_WS_ENDPOINT must be set)
  const browser = await chromium.connect(process.env.PLAYWRIGHT_WS_ENDPOINT);

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  // Navigate
  await page.goto('https://example.com', {
    waitUntil: 'networkidle'  // Wait for network to be idle
  });

  // Your automation here

  await browser.close();
})();
```

## Selectors & Locators

### Best Practices for Selectors

```javascript
// PREFERRED: Data attributes (most stable)
await page.locator('[data-testid="submit-button"]').click();
await page.locator('[data-cy="user-input"]').fill('text');

// GOOD: Role-based selectors (accessible)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
await page.getByRole('heading', { level: 1 }).click();

// GOOD: Text content (for unique text)
await page.getByText('Sign in').click();
await page.getByText(/welcome back/i).click();

// OK: Semantic HTML
await page.locator('button[type="submit"]').click();
await page.locator('input[name="email"]').fill('test@test.com');

// AVOID: Classes and IDs (can change frequently)
await page.locator('.btn-primary').click();  // Avoid
await page.locator('#submit').click();       // Avoid

// LAST RESORT: Complex CSS/XPath
await page.locator('div.container > form > button').click();  // Fragile
```

### Advanced Locator Patterns

```javascript
// Filter and chain locators
const row = page.locator('tr').filter({ hasText: 'John Doe' });
await row.locator('button').click();

// Nth element
await page.locator('button').nth(2).click();

// Combining conditions
await page.locator('button').and(page.locator('[disabled]')).count();

// Parent/child navigation
const cell = page.locator('td').filter({ hasText: 'Active' });
const row = cell.locator('..');
await row.locator('button.edit').click();
```

## Common Actions

### Form Interactions

```javascript
// Text input
await page.getByLabel('Email').fill('user@example.com');
await page.getByPlaceholder('Enter your name').fill('John Doe');

// Clear and type
await page.locator('#username').clear();
await page.locator('#username').type('newuser', { delay: 100 });

// Checkbox
await page.getByLabel('I agree').check();
await page.getByLabel('Subscribe').uncheck();

// Radio button
await page.getByLabel('Option 2').check();

// Select dropdown
await page.selectOption('select#country', 'usa');
await page.selectOption('select#country', { label: 'United States' });
await page.selectOption('select#country', { index: 2 });

// Multi-select
await page.selectOption('select#colors', ['red', 'blue', 'green']);

// File upload
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
await page.setInputFiles('input[type="file"]', [
  'file1.pdf',
  'file2.pdf'
]);
```

### Mouse Actions

```javascript
// Click variations
await page.click('button');                          // Left click
await page.click('button', { button: 'right' });    // Right click
await page.dblclick('button');                       // Double click
await page.click('button', { position: { x: 10, y: 10 } });  // Click at position

// Hover
await page.hover('.menu-item');

// Drag and drop
await page.dragAndDrop('#source', '#target');

// Manual drag
await page.locator('#source').hover();
await page.mouse.down();
await page.locator('#target').hover();
await page.mouse.up();
```

### Keyboard Actions

```javascript
// Type with delay
await page.keyboard.type('Hello World', { delay: 100 });

// Key combinations
await page.keyboard.press('Control+A');
await page.keyboard.press('Control+C');
await page.keyboard.press('Control+V');

// Special keys
await page.keyboard.press('Enter');
await page.keyboard.press('Tab');
await page.keyboard.press('Escape');
await page.keyboard.press('ArrowDown');
```

## Waiting Strategies

### Smart Waiting

```javascript
// Wait for element states
await page.locator('button').waitFor({ state: 'visible' });
await page.locator('.spinner').waitFor({ state: 'hidden' });
await page.locator('button').waitFor({ state: 'attached' });
await page.locator('button').waitFor({ state: 'detached' });

// Wait for specific conditions
await page.waitForURL('**/success');
await page.waitForURL(url => url.pathname === '/dashboard');

// Wait for network
await page.waitForLoadState('networkidle');
await page.waitForLoadState('domcontentloaded');

// Wait for function
await page.waitForFunction(() => document.querySelector('.loaded'));
await page.waitForFunction(
  text => document.body.innerText.includes(text),
  'Content loaded'
);

// Wait for response
const responsePromise = page.waitForResponse('**/api/users');
await page.click('button#load-users');
const response = await responsePromise;

// Wait for request
await page.waitForRequest(request =>
  request.url().includes('/api/') && request.method() === 'POST'
);

// Custom timeout
await page.locator('.slow-element').waitFor({
  state: 'visible',
  timeout: 10000  // 10 seconds
});
```

## Network Inspection & Interception

### Intercepting Requests

```javascript
// Mock API responses
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
  });
});

// Modify requests
await page.route('**/api/**', route => {
  const headers = {
    ...route.request().headers(),
    'X-Custom-Header': 'value'
  };
  route.continue({ headers });
});

// Block resources
await page.route('**/*.{png,jpg,jpeg,gif}', route => route.abort());
```

### Custom Headers via Environment Variables

The skill supports automatic header injection via environment variables:

```bash
# Single header (simple)
PW_HEADER_NAME=X-Automated-By PW_HEADER_VALUE=playwright-skill

# Multiple headers (JSON)
PW_EXTRA_HEADERS='{"X-Automated-By":"playwright-skill","X-Request-ID":"123"}'
```

These headers are automatically applied to all requests when using:
- `helpers.createContext(browser)` - headers merged automatically
- `getContextOptionsWithHeaders(options)` - utility injected by run.js wrapper

**Precedence (highest to lowest):**
1. Headers passed directly in `options.extraHTTPHeaders`
2. Environment variable headers
3. Playwright defaults

**Use case:** Identify automated traffic so your backend can return LLM-optimized responses (e.g., plain text errors instead of styled HTML).

## Screenshots & Visual Capture

### Taking Screenshots

Ensure the `scripts` directory exists before running these examples (for example, run `mkdir -p scripts`), or update the `path` values to point to an existing directory.

```javascript
// Full page screenshot
await page.screenshot({
  path: './scripts/screenshot.png',
  fullPage: true
});

// Element screenshot
await page.locator('.chart').screenshot({
  path: './scripts/chart.png'
});

// Viewport-only screenshot
await page.screenshot({ path: './scripts/viewport.png' });
```

## Mobile Device Emulation

```javascript
// Device emulation
const { devices } = require('playwright');
const iPhone = devices['iPhone 12'];

const context = await browser.newContext({
  ...iPhone,
  locale: 'en-US',
  permissions: ['geolocation'],
  geolocation: { latitude: 37.7749, longitude: -122.4194 }
});
```

## Debugging

### In-Code Debugging

```javascript
// Pause execution (opens Playwright Inspector)
await page.pause();

// Console logs from the browser
page.on('console', msg => console.log('Browser log:', msg.text()));
page.on('pageerror', error => console.log('Page error:', error));
```

## Performance Measurement

```javascript
// Measure page load time
const startTime = Date.now();
await page.goto('https://example.com');
const loadTime = Date.now() - startTime;
console.log(`Page loaded in ${loadTime}ms`);
```

## Data Extraction Patterns

### Extract Text Content

```javascript
// Single element text
const title = await page.textContent('h1');

// All matching elements
const items = await page.locator('li').allTextContents();

// Text from multiple selectors
const heading = await page.locator('h1').innerText();
const paragraph = await page.locator('p.intro').innerText();
```

### Extract Attributes and Links

```javascript
// Single attribute
const href = await page.locator('a.main-link').getAttribute('href');

// All hrefs on the page
const links = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a[href]')).map(a => a.href)
);
```

### Extract Structured Data

```javascript
const data = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.item')).map(el => ({
    title: el.querySelector('.title')?.textContent?.trim(),
    price: el.querySelector('.price')?.textContent?.trim(),
    url: el.querySelector('a')?.href,
  }));
});
console.log(JSON.stringify(data, null, 2));
```

## Common Patterns & Solutions

### Handling Popups

```javascript
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.click('button.open-popup')
]);
await popup.waitForLoadState();
```

### File Downloads

```javascript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('button.download')
]);
await download.saveAs(`./downloads/${download.suggestedFilename()}`);
```

### iFrames

```javascript
const frame = page.frameLocator('#my-iframe');
await frame.locator('button').click();
```

### Infinite Scroll

```javascript
async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
}
```

## Best Practices

1. **Selector Strategy** - Prefer data-testid attributes and role-based selectors; avoid fragile CSS classes
2. **Waiting** - Use Playwright's auto-waiting (`waitForSelector`, `waitForLoadState`, `waitForURL`); avoid hard-coded timeouts
3. **Error Handling** - Always wrap in try-catch and take a screenshot on failure for visibility
4. **Output** - Use `console.log()` to surface extracted data and page state back to the user
5. **Cookie Banners** - Use `helpers.handleCookieBanner(page)` before interacting with sites that show consent dialogs
6. **Scripts** - Save browsing scripts to `./scripts/` so they can be inspected and re-run

## Troubleshooting

### Common Issues

1. **Element not found** - Check if element is in an iframe, verify it is visible and the page has loaded
2. **Timeout errors** - Increase timeout, check network conditions, use `waitForLoadState('networkidle')`
3. **Authentication issues** - Verify credentials and auth flow; save session state for re-use
4. **Cookie/consent dialogs** - Use `helpers.handleCookieBanner(page)` before interacting with the page

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
