# GitHub Actions Workflows

This directory contains automated workflows for building and testing gamepad-node.

## Workflows

### CI (`ci.yml`)

**Trigger:** Push to main/master, Pull Requests

**Purpose:** Continuous integration testing

**What it does:**
- Tests on macOS, Linux, and Windows
- Tests with Node.js 20 and 22
- Builds native addon from source
- Runs smoke tests to verify API works

### Build (`build.yml`)

**Trigger:**
- Git tags matching `v*` (e.g., v0.1.0)
- Manual workflow dispatch

**Purpose:** Build prebuilt binaries for all platforms

**What it does:**
1. **Build Phase:**
   - Builds native addon for all platforms:
     - macOS x64 (darwin-x64)
     - macOS arm64 (darwin-arm64)
     - Linux x64 (linux-x64)
     - Linux arm64 (linux-arm64)
     - Windows x64 (win32-x64)
   - Packages `gamepad_native.node` + SDL2 libraries into platform-specific tarballs
   - Uploads tarballs as artifacts

2. **Release Phase** (only on git tags):
   - Downloads all platform artifacts
   - Creates a GitHub release
   - Attaches all prebuilt binaries to the release

## Creating a Release

To publish a new version with prebuilt binaries:

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Push changes
git push

# 3. Create and push tag
git tag v0.1.0
git push origin v0.1.0

# 4. GitHub Actions automatically builds and creates release
```

## Prebuilt Binary Download

When users run `npm install gamepad-node`, the install script:

1. Checks if native addon already exists
2. Attempts to download prebuilt binary from GitHub releases:
   - URL: `https://github.com/monteslu/gamepad-node/releases/download/v{version}/gamepad-node-v{version}-{platform}.tar.gz`
   - Example: `gamepad-node-v0.1.0-darwin-arm64.tar.gz`
   - Platform auto-detected (darwin-x64, darwin-arm64, linux-x64, linux-arm64, win32-x64)
3. Extracts tarball to `build/Release/`
4. Falls back to building from source if download fails

This approach follows the same pattern as [@kmamal/sdl](https://github.com/kmamal/node-sdl).

## Platform-Specific Notes

### macOS
- Builds universal binaries that work on both Intel and Apple Silicon
- Packages libSDL2 dylibs with native addon

### Linux
- Builds for x64 and arm64 architectures
- Packages libSDL2 shared objects with native addon

### Windows
- Builds for x64 architecture
- Packages SDL2.dll with native addon

## Manual Workflow Dispatch

You can manually trigger the build workflow from GitHub:

1. Go to Actions tab in GitHub
2. Select "Build Native Addon" workflow
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow" button

This is useful for:
- Testing build process without creating a release
- Rebuilding binaries for an existing version
- Debugging platform-specific build issues
