# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.1](https://github.com/atriumn/tokencost-dev/compare/v0.1.0...v0.1.1) - 2025-02-20

### Added
- GitHub Actions release workflow with OIDC trusted publishing
- MIT LICENSE file
- CONTRIBUTING.md with development guide
- Dependabot configuration for npm and GitHub Actions

### Fixed
- npm publish now uses provenance via OIDC (no manual tokens)

## [0.1.0](https://github.com/atriumn/tokencost-dev/releases/tag/v0.1.0) - 2025-02-14

### Added
- Initial release
- `get_model_details` tool — look up pricing and capabilities for any LLM
- `calculate_estimate` tool — estimate cost for a given token count
- `compare_models` tool — filter and compare models by provider, context window, or mode
- `refresh_prices` tool — force re-fetch of pricing data from LiteLLM registry
- Fuzzy model name matching via Fuse.js
- In-memory cache with 24h TTL and disk fallback
- Docs site at tokencost.dev (Astro + Starlight)
