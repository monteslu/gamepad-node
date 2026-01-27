# GitHub Actions

## CI (`ci.yml`)

Runs on every push and PR. Tests with Node 20 & 22 on Linux:

- ESLint
- 55 unit tests (pure JavaScript, no hardware required)

The unit tests cover:
- `GamepadButton` class (W3C compliance)
- `Gamepad` class (button/axis mapping, controller vs joystick handling)
- `ControllerMapper` (button mapping, axis mapping, fallback mappings)
- Additional controller config loading (EmulationStation es_input.cfg parsing)

Tests that require hardware (smoke test, basic test, mapping test, events test) are not run in CI - use them locally with a connected controller.

## Publishing

This is pure JavaScript, no binaries to build. To publish:

```bash
npm version patch  # or minor/major
npm publish
git push && git push --tags
```

Done.
