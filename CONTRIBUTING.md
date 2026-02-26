# Contributing to tokencost-dev

Thank you for your interest in contributing to tokencost-dev! We welcome bug reports, feature requests, and pull requests.

## Getting Started

### Prerequisites
- Node.js >=18
- npm

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/atriumn/tokencost-dev.git
   cd tokencost-dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Watch mode for development**
   ```bash
   npm run dev
   ```

## Running Tests

Run the test suite:

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once and exit
```

All tests must pass before submitting a pull request.

## Linting

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
npm run lint          # Check for lint and formatting issues
npm run lint:fix      # Auto-fix issues
```

CI enforces linting — run `npm run lint` before pushing.

## Building and Running

To build the TypeScript code:
```bash
npm run build
```

To start the server:
```bash
npm start
```

## Code Style

- Use TypeScript for all code
- Follow ESM module conventions (this project uses `"type": "module"`)
- Run `npm run lint` to check formatting and lint rules ([Biome](https://biomejs.dev/) enforces style automatically)
- Keep code readable and maintainable
- Comments should explain the "why", not the "what"

## Pull Request Process

1. **Fork and branch** — Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** — Implement your feature or fix, keeping commits logical and atomic

3. **Test thoroughly**
   - Run `npm run test:run` and ensure all tests pass
   - Add tests for new functionality
   - Test the MCP server with Claude Code or Cursor

4. **Commit with clear messages**
   ```bash
   git commit -m "type: description"
   ```
   Examples:
   - `feat: add model filtering by capability`
   - `fix: handle missing pricing data gracefully`
   - `docs: clarify fuzzy matching behavior`

5. **Push and create a pull request**
   - Push to your fork: `git push origin feat/your-feature-name`
   - Open a PR against `main`
   - Provide a clear description of what you changed and why

6. **Address feedback** — Respond to review comments and update as needed

## Reporting Issues

Found a bug? Have a feature idea?

- **GitHub Issues** — [Open an issue](https://github.com/atriumn/tokencost-dev/issues)
- Include:
  - What you expected vs. what happened
  - Steps to reproduce (for bugs)
  - Your Node.js version and OS (if relevant)

## Architecture Overview

The project is organized as follows:

- **`src/index.ts`** — Server setup and stdio transport
- **`src/tools.ts`** — Tool definitions and dispatch logic
- **`src/pricing.ts`** — Fetch and cache LiteLLM pricing data
- **`src/search.ts`** — Fuzzy model name matching

For larger contributions, familiarize yourself with the MCP protocol ([modelcontextprotocol.io](https://modelcontextprotocol.io)).

## Questions?

- Check existing [GitHub Issues](https://github.com/atriumn/tokencost-dev/issues)
- Open a discussion or ask in an issue if something is unclear

## Code of Conduct

This project has adopted the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code of conduct.

---

Happy contributing! 🎉
