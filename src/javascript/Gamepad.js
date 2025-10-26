export class GamepadButton {
    constructor(pressed = false, value = 0.0) {
        this.pressed = pressed;
        this.touched = pressed;
        this.value = value;
    }
}

import { createJSMap, mapButtons, mapAxes, getFallbackMapping } from './ControllerMapper.js';

// Track which controllers we've already warned about (to avoid spam)
const warnedControllers = new Set();

// SDL standard button mapping to our indices
const SDL_BUTTON_MAP = {
    'a': 0, 'b': 1, 'x': 2, 'y': 3,
    'leftshoulder': 4, 'rightshoulder': 5,
    'lefttrigger': 6, 'righttrigger': 7,
    'back': 8, 'start': 9,
    'leftstick': 10, 'rightstick': 11,
    'dpup': 12, 'dpdown': 13, 'dpleft': 14, 'dpright': 15,
    'guide': 16
};

const SDL_AXIS_MAP = {
    'leftx': 0, 'lefty': 1,
    'rightx': 2, 'righty': 3
};

// Parse SDL mapping string like "guid,name,a:b1,b:b2,leftx:a0,..."
function parseSDLMapping(mappingString) {
    const parts = mappingString.split(',');
    const buttons = Array(17).fill(100); // 100 = unmapped
    const axes = [];

    for (let i = 2; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part || part.startsWith('platform:')) continue;

        const [sdlName, sdlValue] = part.split(':');
        if (!sdlName || !sdlValue) continue;

        const standardIdx = SDL_BUTTON_MAP[sdlName] ?? SDL_AXIS_MAP[sdlName];
        if (standardIdx === undefined) {
            continue;
        }

        // Button mapping: "a:b1" means standard button 0 = raw button 1
        if (sdlValue.startsWith('b')) {
            const rawIdx = parseInt(sdlValue.substring(1), 10);
            buttons[rawIdx] = standardIdx;
        }
        // Axis mapping: "leftx:a0" means standard axis 0 = raw axis 0
        else if (sdlValue.startsWith('a') || sdlValue.startsWith('+a') || sdlValue.startsWith('-a')) {
            const isNegative = sdlValue.startsWith('-');
            const axisStr = sdlValue.replace(/^[+-]?a/, '');
            const rawIdx = parseInt(axisStr, 10);

            if (!axes[rawIdx]) axes[rawIdx] = [];
            axes[rawIdx].push({
                id: rawIdx,
                name: sdlName,
                value: isNegative ? -1 : 1,
                multiplier: isNegative ? 1 : -1
            });
        }
    }

    return { buttons, axes };
}

export class Gamepad {
    constructor(native_data, hapticActuator = null, mappingData = null) {
        this.id = native_data.id;
        this.index = native_data.index;
        this.connected = native_data.connected;
        this.timestamp = performance.now();
        this.mapping = 'standard';

        // Haptic actuator for rumble/vibration
        this.vibrationActuator = hapticActuator;

        // Store raw native data
        this._native = native_data;

        // Store which platform the mapping came from (for debugging)
        this._mappingSource = mappingData ? mappingData.source : null;

        // Check if we have SDL mapping data from GamepadManager (vendor/product match)
        const hasSDLMapping = mappingData && mappingData.mapping;

        // For SDL_GameController: use data as-is ONLY if we don't have our own SDL mapping
        if (native_data.isController && !hasSDLMapping) {
            this.buttons = (native_data.buttons || []).map((btn, i) => {
                // Button data is already { pressed, value } from GamepadManager
                return new GamepadButton(btn.pressed, btn.value);
            });

            // Only use first 4 axes for standard gamepad (left stick, right stick)
            this.axes = (native_data.axes || []).slice(0, 4);
        }
        // For SDL_Joystick OR SDL_GameController with our own SDL mapping: apply manual mapping
        else {
            let jsMap;

            // If we have SDL mapping from vendor/product match, parse it
            if (hasSDLMapping) {
                jsMap = parseSDLMapping(mappingData.mapping);
            } else {
                // Look up mapping from EmulationStation controller database
                jsMap = createJSMap(native_data.guid, native_data.id);
            }

            // If no database mapping found, use fallback
            if (!jsMap) {
                jsMap = getFallbackMapping(native_data.id);
                // Only warn once per controller GUID to avoid spam
                if (!warnedControllers.has(native_data.guid)) {
                    console.log(`No database mapping for "${native_data.id}" (${native_data.guid}), using fallback`);
                    warnedControllers.add(native_data.guid);
                }
            }

            // Extract just the pressed state for mapping (mapButtons expects boolean array)
            const rawButtonStates = native_data.buttons.map(b => b.pressed);

            // Map raw joystick buttons to standard gamepad buttons
            const mappedButtons = mapButtons(rawButtonStates, jsMap);

            // Convert to GamepadButton objects
            this.buttons = mappedButtons.map(btn => new GamepadButton(btn.pressed, btn.value));

            // Map raw joystick axes to standard gamepad axes
            this.axes = mapAxes(native_data.axes, jsMap, this.buttons);

            // Store mapping for debugging
            this._mapping = jsMap;
        }
    }
}
