# Controller vs Joystick: How gamepad-node gives everything standard mappings

## The problem

SDL2 has two APIs for game controllers:

1. **SDL_GameController** - Knows the button layout. Gives you semantic names like "A button" and "left stick X"
2. **SDL_Joystick** - Just gives raw buttons/axes. Button 0 might be A on one controller, B on another, who knows

Most controllers (2100+) get recognized as SDL_GameController thanks to SDL's massive community database. But some don't, and those fall back to SDL_Joystick with totally arbitrary button numbers.

## Our solution

We handle both paths and ensure everything gets `mapping: "standard"`:

### Path 1: SDL_GameController (preferred)

SDL loads 2100+ controller mappings on startup from gamecontrollerdb.txt. When your device is recognized, SDL handles all the mapping for us. We just pass through the already-standardized data.

Features available:
- Vibration/rumble
- Standard button layout
- Platform-specific drivers (XInput, DirectInput, etc.)

### Path 2: SDL_Joystick (fallback)

When SDL doesn't recognize a controller, we get raw joystick data. No semantic names, just button indices. This is where our remapping kicks in:

1. Look up the controller by GUID in our EmulationStation database (321 controllers from Knulli + Batocera)
2. If found, apply that mapping to transform raw buttons to standard layout
3. If not found, apply generic Xbox 360 / PS4 style fallback mapping

This all happens in `ControllerMapper.js`.

No vibration on this path though - that's an SDL_GameController feature.

## How @kmamal/sdl exposes this

The @kmamal/sdl library gives us device objects with an `isController` flag:

```javascript
const devices = sdl.controller.devices;

devices.forEach(device => {
    if (device.mapping) {
        // SDL_GameController path - mapping handled by SDL
        // device.mapping is the SDL mapping string
    } else {
        // SDL_Joystick path - we handle remapping in JS
        // Look up device.guid in our database
    }
});
```

## Why this works

The key insight: SDL's C code is way better at detecting controllers than we could ever be. So we lean on that as much as possible, only stepping in with our own mappings when SDL doesn't know what the device is.

Between SDL's 2100+ mappings and our 321 EmulationStation configs, we cover basically everything. And for the weird stuff? Generic fallback keeps it playable.

Result: every gamepad works, no config UI needed.
