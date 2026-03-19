# Playwright Skill - Remote Browser

**Free internet browsing as an Agent Skill**

A skill that enables AI agents to browse the internet freely using a remote Playwright browser — navigate to any URL, read page content, extract data, fill forms, take screenshots, and perform any browser-based task. Uses a **remote browser server** so no local browser process needs to run on your machine.

The agent autonomously decides when to use this skill based on your browsing needs, loading only the minimal information required for your specific task.

## Features

- **Browse Any Website** - Agent writes custom Playwright code for your specific request, not limited to pre-built scripts
- **Remote Browser Only** - Connects to a remote Playwright browser server; no locally running browser required (and no browser binaries are downloaded during setup when using `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`)
- **Zero Module Resolution Errors** - Universal executor ensures proper module access
- **Progressive Disclosure** - Concise SKILL.md with full API reference loaded only when needed
- **Safe Script Management** - Scripts and screenshots stored in `./scripts/` for easy inspection and re-use
- **Comprehensive Helpers** - Optional utility functions for common browsing tasks

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
# Prevent Playwright from downloading local browser binaries during setup
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm run setup
```

Set the remote browser endpoint before running any automation:

```bash
export PLAYWRIGHT_WS_ENDPOINT=ws://your-remote-browser-host:3000
```

## Quick Start

After installation, simply ask your agent to browse or interact with any website. The agent will write custom Playwright code, execute it against the remote browser, and return results with screenshots and extracted content.

## Usage Examples

### Browse the Web

```
"What's the top story on Hacker News?"
"Take a screenshot of github.com"
"Search for 'Playwright docs' on Google"
```

### Extract Information

```
"What are the latest posts on the Playwright blog?"
"Get the current Bitcoin price from CoinGecko"
"List all links on the Wikipedia homepage"
```

### Interact with Websites

```
"Fill out the contact form on the site you provide"
"Log in to the site you provide with these credentials"
"Click the 'Download' button on this page"
```

### Screenshots & Visual

```
"Take a full-page screenshot of stripe.com"
"Show me what the GitHub trending page looks like on mobile"
```

## How It Works

1. Describe what you want to browse or do on the web
2. The agent writes custom Playwright code for the task
3. The universal executor (run.js) runs it with proper module resolution
4. Browsing executes against the remote browser
5. Results are displayed with console output and screenshots

## Configuration

Default settings:

- **Remote Browser:** Required — set `PLAYWRIGHT_WS_ENDPOINT`
- **Timeout:** `30s`
- **Scripts & Screenshots:** Saved to `./scripts/` inside the skill directory

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

The agent will automatically load `API_REFERENCE.md` when needed for comprehensive documentation on selectors, network interception, authentication, data extraction, mobile emulation, and debugging.

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

[Agent Skills](https://agentskills.io) are folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently. When you ask an agent to browse a webpage or interact with a website, it discovers this skill, loads the necessary instructions, executes custom Playwright code against the remote browser, and returns results with screenshots and extracted content.

This Playwright skill implements the [open Agent Skills specification](https://agentskills.io), making it compatible across agent platforms.

## Contributing

Contributions are welcome. Fork the repository, create a feature branch, make your changes, and submit a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Learn More

- [Agent Skills Specification](https://agentskills.io) - Open specification for agent skills
- [API_REFERENCE.md](skills/playwright-skill/API_REFERENCE.md) - Full Playwright documentation
- [GitHub Issues](https://github.com/eric2788/playwright-skill-remote-browser/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.
