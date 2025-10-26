# GitHub Actions

## CI (`ci.yml`)

Runs on every push and PR. Tests with Node 20 & 22 on Linux:

- ESLint
- 37 unit tests
- Smoke test (makes sure the API actually works)

Since we're just wrapping @kmamal/sdl (which has its own platform-specific builds), we only test on one platform. Cross-platform stuff is their problem, not ours.

## Publishing

This is pure JavaScript, no binaries to build. To publish:

```bash
npm version patch  # or minor/major
npm publish
git push && git push --tags
```

Done.
