# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.2](https://github.com/atriumn/tokencost-dev/compare/v0.1.1...v0.1.2) (2026-02-26)


### Features

* add CI quality gates with Biome linting and coverage thresholds ([8be84dd](https://github.com/atriumn/tokencost-dev/commit/8be84dd43bb7989df9d0c9105a7c4b449868d7f6))
* add CI quality gates with Biome linting and coverage thresholds ([1b0dfb6](https://github.com/atriumn/tokencost-dev/commit/1b0dfb6b9294d7d7f66ea92b37382071afc31e21))


### Bug Fixes

* use PAT for release-please to bypass enterprise token restrictions ([3e2db35](https://github.com/atriumn/tokencost-dev/commit/3e2db3577328132e6c080b98ccb898e307614d1c))
* use PAT for release-please workflow ([c76d4e5](https://github.com/atriumn/tokencost-dev/commit/c76d4e52b9ebc83cc69bd67f544dc6aa4a87f94a))

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
