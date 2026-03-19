# Playwright Skill - Remote Browser

**General-purpose browser automation as an Agent Skill**

A skill that enables AI agents to write and execute any Playwright automation on-the-fly — from simple page tests to complex multi-step flows. Uses a **remote browser server** so no browser is ever installed locally.

The agent autonomously decides when to use this skill based on your browser automation needs, loading only the minimal information required for your specific task.

## Features

- **Any Automation Task** - Agent writes custom code for your specific request, not limited to pre-built scripts
- **Remote Browser Only** - Connects to a remote Playwright browser server; no local browser installation required
- **Zero Module Resolution Errors** - Universal executor ensures proper module access
- **Progressive Disclosure** - Concise SKILL.md with full API reference loaded only when needed
- **Safe Cleanup** - Smart temp file management without race conditions
- **Comprehensive Helpers** - Optional utility functions for common tasks

## Requirements

- Node.js ≥ 14
- A running remote Playwright browser server (e.g. [playwright-server](https://playwright.dev/docs/api/class-browserserver), [browserless](https://www.browserless.io/), or any service that exposes a Playwright WebSocket endpoint)
- `PLAYWRIGHT_WS_ENDPOINT` environment variable set to the server's WebSocket URL

## Installation

```bash
# Clone the repository
git clone https://github.com/eric2788/playwright-skill-remote-browser.git

# Navigate to the skill directory and install dependencies
cd playwright-skill-remote-browser/skills/playwright-skill
npm run setup
```

Set the remote browser endpoint before running any automation:

```bash
export PLAYWRIGHT_WS_ENDPOINT=ws://your-remote-browser-host:3000
```

## Quick Start

After installation, simply ask your agent to test or automate any browser task. The agent will write custom Playwright code, execute it against the remote browser, and return results with screenshots and console output.

## Usage Examples

### Test Any Page

```
"Test the homepage"
"Check if the contact form works"
"Verify the signup flow"
```

### Visual Testing

```
"Take screenshots of the dashboard in mobile and desktop"
"Test responsive design across different viewports"
```

### Interaction Testing

```
"Fill out the registration form and submit it"
"Click through the main navigation"
"Test the search functionality"
```

### Validation

```
"Check for broken links"
"Verify all images load"
"Test form validation"
```

## How It Works

1. Describe what you want to test or automate
2. The agent writes custom Playwright code for the task
3. The universal executor (run.js) runs it with proper module resolution
4. Automation executes against the remote browser
5. Results are displayed with console output and screenshots

## Configuration

Default settings:

- **Remote Browser:** Required — set `PLAYWRIGHT_WS_ENDPOINT`
- **Timeout:** `30s`
- **Screenshots:** Saved to `/tmp/`

## Project Structure

```
playwright-skill-remote-browser/
├── skills/
│   └── playwright-skill/    # The actual skill (agent discovers this)
│       ├── SKILL.md         # What the agent reads
│       ├── run.js           # Universal executor (proper module resolution)
│       ├── package.json     # Dependencies & setup scripts
│       └── lib/
│           └── helpers.js   # Optional utility functions
│       └── API_REFERENCE.md # Full Playwright API reference
├── README.md                # This file - user documentation
├── CONTRIBUTING.md          # Contribution guidelines
└── LICENSE                  # MIT License
```

## Advanced Usage

The agent will automatically load `API_REFERENCE.md` when needed for comprehensive documentation on selectors, network interception, authentication, visual regression testing, mobile emulation, performance testing, and debugging.

## Dependencies

- Node.js
- Playwright package (installed via `npm run setup`)
- A remote Playwright-compatible browser server (NOT installed locally)

## Troubleshooting

**Playwright package not installed?**
Navigate to the skill directory and run `npm run setup`.

**Module not found errors?**
Ensure automation runs via `run.js`, which handles module resolution.

**Remote browser unreachable?**
Verify `PLAYWRIGHT_WS_ENDPOINT` is set and the remote browser server is running.

## What is a Skill?

[Agent Skills](https://agentskills.io) are folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently. When you ask an agent to test a webpage or automate browser interactions, it discovers this skill, loads the necessary instructions, executes custom Playwright code against the remote browser, and returns results with screenshots and console output.

This Playwright skill implements the [open Agent Skills specification](https://agentskills.io), making it compatible across agent platforms.

## Contributing

Contributions are welcome. Fork the repository, create a feature branch, make your changes, and submit a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Learn More

- [Agent Skills Specification](https://agentskills.io) - Open specification for agent skills
- [API_REFERENCE.md](skills/playwright-skill/API_REFERENCE.md) - Full Playwright documentation
- [GitHub Issues](https://github.com/eric2788/playwright-skill-remote-browser/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.
