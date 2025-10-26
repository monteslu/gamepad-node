# gamepad-node

**W3C Gamepad API implementation for Node.js** with native SDL2 bindings.

A fully compliant browser Gamepad API implementation that's **better than browsers** - every controller gets `mapping: "standard"`, not just the 20-30 that browsers recognize.

## Features

✅ **Browser API Compatible** - `navigator.getGamepads()` works identically to browser
⚡ **Native Performance** - C++ SDL2 bindings for low-latency input
🎮 **ALL Controllers Get `mapping: "standard"`** - Every controller gets W3C standard layout (SDL + 291 database configs + fallbacks)
🗺️ **Better Than Browsers** - Browsers only give `mapping: "standard"` to ~20-30 controllers, we give it to ALL
🔌 **Hot-Plug Support** - Automatic detection of connect/disconnect with events
📳 **Vibration/Rumble** - Full GamepadHapticActuator support (dual-rumble)
🎨 **CLI Tester** - Beautiful ASCII art controller visualizer
📦 **Zero Config** - Automatic SDL2 download, no manual setup

## Installation

```bash
npm install
```

This will automatically download SDL2 and build the native addon.

## Usage

### Basic API

```javascript
import { installNavigatorShim } from 'gamepad-node';

// Enable navigator.getGamepads()
installNavigatorShim();

// Use standard browser Gamepad API
setInterval(() => {
    const gamepads = navigator.getGamepads();

    for (const gamepad of gamepads) {
        if (!gamepad) continue;

        // Standard gamepad API
        if (gamepad.buttons[0].pressed) {
            console.log('A button pressed!');
        }

        const leftStickX = gamepad.axes[0];
        const leftStickY = gamepad.axes[1];
    }
}, 16); // 60 FPS
```

### Events (gamepadconnected/gamepaddisconnected)

```javascript
import { installNavigatorShim } from 'gamepad-node';

const manager = installNavigatorShim();

// Listen for controller connections
manager.on('gamepadconnected', (event) => {
    console.log('Controller connected:', event.gamepad.id);
});

manager.on('gamepaddisconnected', (event) => {
    console.log('Controller disconnected:', event.gamepad.id);
});
```

### Vibration/Rumble (GamepadHapticActuator)

```javascript
const gamepads = navigator.getGamepads();
const gamepad = gamepads[0];

if (gamepad && gamepad.vibrationActuator) {
    // Play dual-rumble effect
    await gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration: 200,           // milliseconds
        strongMagnitude: 1.0,    // 0.0 to 1.0
        weakMagnitude: 0.5       // 0.0 to 1.0
    });

    // Or use the pulse helper
    await gamepad.vibrationActuator.pulse(0.8, 100);

    // Stop vibration
    await gamepad.vibrationActuator.reset();
}
```

### CLI Tester

```bash
# Run interactive controller tester
node bin/cli.js

# Or if installed globally:
gamepad-test
```

The CLI tester shows:
- Real-time button states (A, B, X, Y, LB, RB, triggers, d-pad, etc.)
- Analog stick positions with visual indicators
- Trigger pressure bars
- Supports up to 4 controllers simultaneously
- 60 FPS updates

## Architecture

- **Native Layer**: Minimal C++ SDL2 bindings (~300 lines)
- **JavaScript API**: Standard Gamepad API implementation
- **Controller DB**: EmulationStation configs (Knulli + Batocera)
- **CLI Tester**: React/Ink-based ASCII art visualizer

Based on the proven approach from [webaudio-node](../webaudio-node).

## Building

```bash
# Install dependencies
npm install

# Build native addon
npm run build

# Run tests
npm test                  # Basic gamepad test
npm run test:events       # Test events and rumble
npm run test:mapping      # Test controller mapping (shows database lookup)

# Run CLI tester
node bin/cli.js
```

## Platform Support

Prebuilt binaries available for:
- macOS (x64, arm64)
- Linux (x64, arm64)
- Windows (x64)

Installation automatically downloads the appropriate prebuilt binary for your platform. If unavailable, it builds from source automatically.

## ALL Controllers Get `mapping: "standard"` (Better Than Browsers!)

**The Problem with Browsers:**
- Only ~20-30 recognized controllers get `mapping: "standard"`
- Unknown controllers get `mapping: ""` with unpredictable button indices
- Games must implement per-controller configuration UI

**Our Solution:**
gamepad-node ensures **every controller gets `mapping: "standard"`** through three tiers:
1. **SDL_GameController** (2100+ controllers) - SDL loads community gamecontrollerdb.txt and handles mapping natively
2. **EmulationStation Database** (321 controllers) - For joysticks SDL doesn't recognize, remap via EmulationStation configs
3. **Fallback** (everything else) - Xbox 360/PS4 style remapping for unknown joysticks

**Result:** Your game code always sees predictable button indices. No configuration UI needed!

📋 **See [MAPPED_CONTROLLERS.md](./docs/MAPPED_CONTROLLERS.md) for full list of 2455+ supported controllers**

### How It Works

1. **SDL_GameController** - Natively recognized controllers (~2100+ total)
   - SDL loads [gamecontrollerdb.txt](https://github.com/mdqinc/SDL_GameControllerDB) (2134 community mappings)
   - Combined with SDL's built-in mappings (~1000 compiled-in)
   - SDL handles remapping in native code → `mapping: "standard"`
   - Full feature support: vibration, platform-specific drivers (XInput, DirectInput, IOKit)
   - Includes Xbox, PlayStation, Switch, 8BitDo, and many more

2. **SDL_Joystick with EmulationStation Database** - 321 controllers SDL doesn't recognize
   - Look up by GUID + name from Knulli (283) + Batocera (38) databases
   - Vendor/product ID matching for cross-platform support
   - JavaScript remaps raw button indices to standard layout → `mapping: "standard"`

3. **SDL_Joystick with Fallback** - Unknown joysticks
   - Xbox 360 or PS4 style remapping → `mapping: "standard"`
   - Ensures compatibility even with brand new/exotic controllers

**Result:** Games always see `mapping: "standard"` with predictable button indices (A=0, B=1, X=2, Y=3, etc.)

```javascript
// Always works, even with exotic controllers!
if (gamepad.buttons[0].pressed) {
    console.log('A button pressed');  // Standard index 0 = A
}
```

See [CONTROLLER_VS_JOYSTICK.md](./docs/CONTROLLER_VS_JOYSTICK.md) for technical details.

## Development

See [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) for the complete development plan.

### Building Locally

```bash
# Install dependencies and build
npm install

# Or build manually
npm run download-sdl
npm run build
```

### Creating a Release

To publish a new version with prebuilt binaries:

1. Update version in `package.json`
2. Commit and push changes
3. Create and push a git tag:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
4. GitHub Actions will automatically:
   - Build native addons for all platforms
   - Create a GitHub release
   - Upload prebuilt binaries

Users will automatically download the prebuilt binary matching their platform during `npm install`.

## License

ISC

## Credits

This project builds on excellent work from the gaming and emulation communities:

- **[@kmamal](https://github.com/kmamal)** - Pioneering work on SDL2 for Node.js ecosystem
  - [node-sdl](https://github.com/kmamal/node-sdl) - Comprehensive SDL2 bindings that inspired this implementation
  - [build-sdl](https://github.com/kmamal/build-sdl) - Cross-platform prebuilt SDL2 binaries (used by this project)
  - Made it possible to bring native SDL2 performance to Node.js with zero-config installation
- **[SDL2](https://www.libsdl.org/)** - Cross-platform game controller support with ~1000 built-in controller mappings
- **[SDL_GameControllerDB](https://github.com/mdqinc/SDL_GameControllerDB)** - Community-sourced database of 2134 game controller mappings maintained by [@mdqinc](https://github.com/mdqinc)
- **[Knulli](https://knulli.org/)** - Retro gaming distribution with extensive EmulationStation controller configs (283 controllers)
- **[Batocera](https://batocera.org/)** - Retro gaming platform with additional controller mappings (38 controllers)
- **[EmulationStation](https://emulationstation.org/)** - Frontend for retro gaming with comprehensive controller database format

By combining @kmamal's SDL2 foundation, SDL2's built-in mappings, the SDL_GameControllerDB community database, and EmulationStation's configs, we achieve **universal `mapping: "standard"` support** that surpasses browser implementations.

## Related Projects

- [webaudio-node](../webaudio-node) - Web Audio API for Node.js
- [jsgamelauncher](../jsgamelauncher) - Run web games in Node.js
- [@kmamal/build-sdl](../build-sdl) - Prebuilt SDL2 binaries
