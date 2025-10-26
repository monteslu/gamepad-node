# GitHub Actions Workflows

This directory contains automated workflows for testing gamepad-node.

## Workflows

### CI (`ci.yml`)

**Trigger:** Push to main/master, Pull Requests

**Purpose:** Continuous integration testing

**What it does:**
- Tests on Linux (ubuntu-latest)
- Tests with Node.js 20 and 22
- Runs linting (ESLint)
- Runs unit tests (37 tests)
- Runs smoke tests to verify API works

**Note:** Since gamepad-node is pure JavaScript using @kmamal/sdl (which provides prebuilt binaries for all platforms), we only test on Linux. Cross-platform compatibility is handled by @kmamal/sdl.

## Publishing to npm

gamepad-node is a pure JavaScript package that uses [@kmamal/sdl](https://github.com/kmamal/node-sdl) for native SDL2 bindings.

To publish a new version:

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Publish to npm
npm publish

# 3. Push changes and tags
git push && git push --tags
```

## No Build Step Required

Unlike previous versions that built custom C++ bindings, gamepad-node now uses @kmamal/sdl which provides prebuilt binaries for all platforms. Users can install with a simple:

```bash
npm install gamepad-node
```

No compilation required!
