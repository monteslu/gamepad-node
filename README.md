# gamepad-node

[![npm version](https://img.shields.io/npm/v/gamepad-node.svg)](https://www.npmjs.com/package/gamepad-node)
[![CI](https://github.com/monteslu/gamepad-node/actions/workflows/ci.yml/badge.svg)](https://github.com/monteslu/gamepad-node/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

W3C Gamepad API for Node.js using SDL2. Works exactly like the browser API, but better - every controller gets `mapping: "standard"`, not just the handful browsers recognize.

## Features

- Browser-compatible API - `navigator.getGamepads()` works exactly like in browsers
- Every controller gets `mapping: "standard"` - not just the 20-30 browsers recognize
- 2100+ controllers via SDL2's community database
- 321 more via EmulationStation configs (Knulli + Batocera)
- Generic fallback for everything else
- Hot-plug support with connect/disconnect events
- Vibration/rumble support (dual-rumble via GamepadHapticActuator)
- CLI tester with real-time visualization
- Zero config - SDL2 downloads automatically

## Why this exists

Browsers only give `mapping: "standard"` to about 20-30 controllers. Everyone else gets unpredictable button mappings and has to implement config screens. That sucks for game developers.

This library ensures **every controller** gets standard mappings. Your game code stays simple.

## Install

```bash
npm install gamepad-node
```

SDL2 is installed automatically by @kmamal/sdl. No compilation, no config.

## Usage

```javascript
import { installNavigatorShim } from 'gamepad-node';

installNavigatorShim();

// Same API as browsers
setInterval(() => {
    const gamepads = navigator.getGamepads();

    for (const gamepad of gamepads) {
        if (!gamepad) continue;

        if (gamepad.buttons[0].pressed) {
            console.log('A button pressed');
        }

        const leftStickX = gamepad.axes[0];
        const leftStickY = gamepad.axes[1];
    }
}, 16);
```

### Events

```javascript
const manager = installNavigatorShim();

manager.on('gamepadconnected', (event) => {
    console.log('Connected:', event.gamepad.id);
});

manager.on('gamepaddisconnected', (event) => {
    console.log('Disconnected:', event.gamepad.id);
});
```

### Rumble

```javascript
const gamepad = navigator.getGamepads()[0];

if (gamepad?.vibrationActuator) {
    await gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration: 200,
        strongMagnitude: 1.0,
        weakMagnitude: 0.5
    });
}
```

## Test your controllers

```bash
npx gamepad-node
```

Shows all buttons, triggers, sticks, and d-pad in real-time. Press R to test rumble.

## How it works

Three-tier fallback system:

1. **SDL_GameController** (2100+ controllers) - SDL recognizes it and handles mapping natively
2. **EmulationStation database** (321 controllers) - We remap it using community configs
3. **Fallback** (everything else) - Generic Xbox 360 / PS4 style mapping

End result: `mapping: "standard"` for literally every controller, with predictable button indices.

See [docs/CONTROLLER_VS_JOYSTICK.md](./docs/CONTROLLER_VS_JOYSTICK.md) for technical details, or [docs/MAPPED_CONTROLLERS.md](./docs/MAPPED_CONTROLLERS.md) for the full controller list.

## Platform support

Works on macOS (Intel + Apple Silicon), Linux (x64 + arm64), and Windows (x64). SDL2 binaries are downloaded automatically.

## Why "better than browsers"?

Most browsers only recognize about 20-30 controllers for standard mapping. Try plugging in a Logitech Precision or some retro USB adapter - you'll get `mapping: ""` and buttons all over the place.

This library gives **every controller** standard mappings. Your game works with anything, zero config required.

## Development

Pure JavaScript on top of @kmamal/sdl, no build step. Run `npm install` and you're good.

```bash
npm test              # Basic test
npm run test:events   # Events & rumble
npm run test:unit     # Unit tests
npx gamepad-node      # Interactive tester
```

## Terminal Gaming

I'm building this as part of a terminal gaming platform. Combine gamepad-node with webaudio-node and some clever half-block rendering, and you can make full games that run via `npx`. Check out [docs/TERMINAL_GAMING_PLATFORM.md](./docs/TERMINAL_GAMING_PLATFORM.md) if that sounds interesting.

## Credits

Built on [@kmamal's SDL2 bindings](https://github.com/kmamal/node-sdl), which made this whole thing possible. Also using controller databases from [SDL_GameControllerDB](https://github.com/mdqinc/SDL_GameControllerDB), [Knulli](https://knulli.org/), and [Batocera](https://batocera.org/).

## License

ISC
