import sdl from './sdl-init.js';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Gamepad } from './Gamepad.js';
import { GamepadHapticActuator } from './GamepadHapticActuator.js';
import { hasDbJsonMapping } from './ControllerMapper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class GamepadManager extends EventEmitter {
    constructor() {
        super();

        // SDL mappings are loaded in sdl-init.js before device enumeration

        // Build GUID -> mapping data and vendor/product index for joystick fallback
        this._guidToMapping = new Map(); // GUID -> {name, mapping, source}
        this._vendorProductIndex = new Map(); // vendor/product ID -> array of {guid, name, mapping, source}

        // Load platform-specific mapping data for joystick vendor/product matching
        const platformMap = {
            'darwin': 'sdl_mappings_darwin.json',
            'linux': 'sdl_mappings_linux.json',
            'win32': 'sdl_mappings_win32.json'
        };

        const platform = process.platform;
        const mappingFile = platformMap[platform];

        if (mappingFile) {
            const mappingPath = path.join(__dirname, 'controllers', mappingFile);
            if (fs.existsSync(mappingPath)) {
                try {
                    const mappingsData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

                    // Build lookups for runtime vendor/product matching on joysticks
                    mappingsData.forEach(m => {
                        // Store full mapping data by GUID
                        this._guidToMapping.set(m.guid, {
                            name: m.name,
                            mapping: m.mapping,
                            source: m._source
                        });

                        // Extract vendor/product ID (characters 8-19)
                        if (m.guid.length >= 20) {
                            const vendorProduct = m.guid.substring(8, 20);
                            if (!this._vendorProductIndex.has(vendorProduct)) {
                                this._vendorProductIndex.set(vendorProduct, []);
                            }
                            this._vendorProductIndex.get(vendorProduct).push({
                                guid: m.guid,
                                name: m.name,
                                mapping: m.mapping,
                                source: m._source
                            });
                        }
                    });
                } catch (err) {
                    console.warn('Failed to load mapping data:', err.message);
                }
            }
        }

        // Track open devices and their instances
        this._controllerInstances = new Map(); // SDL device id -> {device, instance, isController: true}
        this._joystickInstances = new Map(); // SDL device id -> {device, instance, isController: false}
        this._nextGamepadIndex = 0; // W3C gamepad index
        this._gamepadIndexMap = new Map(); // SDL device id -> W3C gamepad index
        this._hapticActuators = new Map(); // W3C gamepad index -> GamepadHapticActuator
        this._loggedVendorMatches = new Set(); // Track logged vendor/product matches

        // Set up controller event handlers
        sdl.controller.on('deviceAdd', (event) => {
            const device = event.device;

            try {
                const instance = sdl.controller.openDevice(device);

                // If controller has no rumble AND db.json has a positional mapping, use joystick mode
                if (!instance.hasRumble && hasDbJsonMapping(device.guid, device.name)) {
                    console.log(`Controller "${device.name}" has no rumble but has db.json mapping - using joystick mode for positional mappings`);
                    instance.close();
                    this._forceJoystickMode.add(device.id);

                    // Manually open as joystick for db.json positional mapping
                    try {
                        const joystickInstance = sdl.joystick.openDevice(device);
                        const gamepadIndex = this._nextGamepadIndex++;

                        this._joystickInstances.set(device.id, {
                            device,
                            instance: joystickInstance,
                            isController: false
                        });
                        this._gamepadIndexMap.set(device.id, gamepadIndex);

                        const gamepad = this._createGamepadFromJoystick(device, joystickInstance, gamepadIndex);
                        this.emit('gamepadconnected', { gamepad });
                    } catch (jsErr) {
                        console.warn(`Failed to open as joystick ${device.name}:`, jsErr.message);
                    }
                    return;
                }

                // Has rumble OR no db.json mapping - keep as controller
                const gamepadIndex = this._nextGamepadIndex++;

                this._controllerInstances.set(device.id, {
                    device,
                    instance,
                    isController: true
                });
                this._gamepadIndexMap.set(device.id, gamepadIndex);

                // Create haptic actuator only if controller supports rumble
                let hapticActuator = null;
                if (instance.hasRumble) {
                    hapticActuator = new GamepadHapticActuator(this, gamepadIndex, true);
                    this._hapticActuators.set(gamepadIndex, hapticActuator);
                }

                const gamepad = this._createGamepadFromController(device, instance, gamepadIndex, hapticActuator);
                this.emit('gamepadconnected', { gamepad });
            } catch (err) {
                console.warn(`Failed to open controller ${device.name}:`, err.message);
            }
        });

        sdl.controller.on('deviceRemove', (event) => {
            const device = event.device;
            const entry = this._controllerInstances.get(device.id);
            if (entry) {
                const gamepadIndex = this._gamepadIndexMap.get(device.id);

                // Only close if not already closed
                if (!entry.instance.closed) {
                    entry.instance.close();
                }

                this._controllerInstances.delete(device.id);
                this._hapticActuators.delete(gamepadIndex);
                this._gamepadIndexMap.delete(device.id);

                const gamepad = this._createGamepadFromController(device, null, gamepadIndex, null);
                this.emit('gamepaddisconnected', { gamepad });
            }
        });

        // Set up joystick event handlers
        sdl.joystick.on('deviceAdd', (event) => {
            const device = event.device;

            // Skip if this is already a controller (SDL recognizes it)
            if (sdl.controller.devices.some(d => d.id === device.id) || device.type === 'gamecontroller') {
                return;
            }

            try {
                const instance = sdl.joystick.openDevice(device);
                const gamepadIndex = this._nextGamepadIndex++;

                this._joystickInstances.set(device.id, {
                    device,
                    instance,
                    isController: false
                });
                this._gamepadIndexMap.set(device.id, gamepadIndex);

                const gamepad = this._createGamepadFromJoystick(device, instance, gamepadIndex);
                this.emit('gamepadconnected', { gamepad });
            } catch (err) {
                console.warn(`Failed to open joystick ${device.name}:`, err.message);
            }
        });

        sdl.joystick.on('deviceRemove', (event) => {
            const device = event.device;
            const entry = this._joystickInstances.get(device.id);
            if (entry) {
                const gamepadIndex = this._gamepadIndexMap.get(device.id);

                // Only close if not already closed
                if (!entry.instance.closed) {
                    entry.instance.close();
                }

                this._joystickInstances.delete(device.id);
                this._gamepadIndexMap.delete(device.id);

                const gamepad = this._createGamepadFromJoystick(device, null, gamepadIndex);
                this.emit('gamepaddisconnected', { gamepad });
            }
        });

        // Open existing devices
        for (const device of sdl.controller.devices) {
            try {
                const instance = sdl.controller.openDevice(device);
                const gamepadIndex = this._nextGamepadIndex++;

                this._controllerInstances.set(device.id, {
                    device,
                    instance,
                    isController: true
                });
                this._gamepadIndexMap.set(device.id, gamepadIndex);

                // Create haptic actuator only if controller supports rumble
                if (instance.hasRumble) {
                    const hapticActuator = new GamepadHapticActuator(this, gamepadIndex, true);
                    this._hapticActuators.set(gamepadIndex, hapticActuator);
                }
            } catch (err) {
                console.warn(`Failed to open controller ${device.name}:`, err.message);
            }
        }

        for (const device of sdl.joystick.devices) {
            // Skip if already opened as controller OR if SDL recognizes it as a controller
            if (this._controllerInstances.has(device.id) || device.type === 'gamecontroller') {
                continue;
            }

            try {
                const instance = sdl.joystick.openDevice(device);
                const gamepadIndex = this._nextGamepadIndex++;

                this._joystickInstances.set(device.id, {
                    device,
                    instance,
                    isController: false
                });
                this._gamepadIndexMap.set(device.id, gamepadIndex);
            } catch (err) {
                console.warn(`Failed to open joystick ${device.name}:`, err.message);
            }
        }
    }

    _createGamepadFromController(device, instance, gamepadIndex, hapticActuator) {
        // Convert node-sdl controller format to our native format
        const nativeGamepad = {
            index: gamepadIndex,
            id: device.name,
            guid: device.guid,
            isController: true,
            connected: instance !== null,
            buttons: instance ? this._convertControllerButtons(instance) : [],
            axes: instance ? this._convertControllerAxes(instance) : [],
            timestamp: Date.now()
        };

        // Pass SDL mapping for dpad synthesis detection
        const mappingData = device.mapping ? { mapping: device.mapping, source: 'SDL' } : null;

        return new Gamepad(nativeGamepad, hapticActuator, mappingData);
    }

    _createGamepadFromJoystick(device, instance, gamepadIndex) {
        // Convert node-sdl joystick format to our native format
        const guid = device.guid || this._generateGUID(device);

        // Look up mapping data
        let mappingData = this._guidToMapping.get(guid);

        // Vendor/product matching for joysticks
        if (!mappingData && guid.length >= 20) {
            const vendorProduct = guid.substring(8, 20);
            const matches = this._vendorProductIndex.get(vendorProduct);

            if (matches && matches.length > 0) {
                const bestMatch = matches[0];

                if (!this._loggedVendorMatches.has(guid)) {
                    console.log(`Vendor/product match for ${guid}: using ${bestMatch.source} mapping`);
                    this._loggedVendorMatches.add(guid);
                }

                mappingData = {
                    name: bestMatch.name,
                    mapping: bestMatch.mapping,
                    source: bestMatch.source + ' (vendor/product match)',
                    guid: guid
                };
            }
        }

        const nativeGamepad = {
            index: gamepadIndex,
            id: device.name,
            guid: guid,
            isController: false,
            connected: instance !== null,
            buttons: instance ? this._convertJoystickButtons(instance) : [],
            axes: instance ? this._convertJoystickAxes(instance) : [],
            timestamp: Date.now()
        };

        return new Gamepad(nativeGamepad, null, mappingData);
    }

    _convertControllerButtons(instance) {
        const buttons = instance.buttons;
        return [
            { pressed: buttons.a, value: buttons.a ? 1.0 : 0.0 },
            { pressed: buttons.b, value: buttons.b ? 1.0 : 0.0 },
            { pressed: buttons.x, value: buttons.x ? 1.0 : 0.0 },
            { pressed: buttons.y, value: buttons.y ? 1.0 : 0.0 },
            { pressed: buttons.leftShoulder, value: buttons.leftShoulder ? 1.0 : 0.0 },
            { pressed: buttons.rightShoulder, value: buttons.rightShoulder ? 1.0 : 0.0 },
            { pressed: instance.axes.leftTrigger > 0.5, value: instance.axes.leftTrigger },
            { pressed: instance.axes.rightTrigger > 0.5, value: instance.axes.rightTrigger },
            { pressed: buttons.back, value: buttons.back ? 1.0 : 0.0 },
            { pressed: buttons.start, value: buttons.start ? 1.0 : 0.0 },
            { pressed: buttons.leftStick, value: buttons.leftStick ? 1.0 : 0.0 },
            { pressed: buttons.rightStick, value: buttons.rightStick ? 1.0 : 0.0 },
            { pressed: buttons.dpadUp, value: buttons.dpadUp ? 1.0 : 0.0 },
            { pressed: buttons.dpadDown, value: buttons.dpadDown ? 1.0 : 0.0 },
            { pressed: buttons.dpadLeft, value: buttons.dpadLeft ? 1.0 : 0.0 },
            { pressed: buttons.dpadRight, value: buttons.dpadRight ? 1.0 : 0.0 },
            { pressed: buttons.guide, value: buttons.guide ? 1.0 : 0.0 },
        ];
    }

    _convertControllerAxes(instance) {
        const axes = instance.axes;
        return [
            axes.leftStickX,
            axes.leftStickY,
            axes.rightStickX,
            axes.rightStickY,
        ];
    }

    _convertJoystickButtons(instance) {
        const buttons = [];
        for (let i = 0; i < instance.numButtons; i++) {
            const pressed = instance.buttons[i];
            buttons.push({ pressed, value: pressed ? 1.0 : 0.0 });
        }
        return buttons;
    }

    _convertJoystickAxes(instance) {
        const axes = [];
        for (let i = 0; i < instance.numAxes; i++) {
            axes.push(instance.axes[i]);
        }
        return axes;
    }

    _generateGUID(device) {
        // Generate a GUID-like identifier for devices without one
        return `unknown-${device.id}`;
    }

    _hasVendorProductMatch(guid) {
        if (!guid || guid.length < 20) return false;
        const vendorProduct = guid.substring(8, 20);
        return this._vendorProductIndex.has(vendorProduct);
    }

    poll() {
        // node-sdl polls automatically via events, but we keep this for compatibility
        // W3C Gamepad API expects manual polling in browsers
    }

    getGamepads() {
        const gamepads = [];

        // Add controllers
        for (const [deviceId, entry] of this._controllerInstances) {
            const gamepadIndex = this._gamepadIndexMap.get(deviceId);
            const hapticActuator = this._hapticActuators.get(gamepadIndex);
            const gamepad = this._createGamepadFromController(entry.device, entry.instance, gamepadIndex, hapticActuator);
            gamepads[gamepadIndex] = gamepad;
        }

        // Add joysticks
        for (const [deviceId, entry] of this._joystickInstances) {
            const gamepadIndex = this._gamepadIndexMap.get(deviceId);
            const gamepad = this._createGamepadFromJoystick(entry.device, entry.instance, gamepadIndex);
            gamepads[gamepadIndex] = gamepad;
        }

        return gamepads;
    }

    playVibration(gamepadIndex, strongMagnitude, weakMagnitude, duration) {
        // Find the controller instance
        for (const [deviceId, entry] of this._controllerInstances) {
            if (this._gamepadIndexMap.get(deviceId) === gamepadIndex) {
                if (!entry.instance || !entry.isController) {
                    return false;
                }

                // node-sdl rumble API expects values between 0 and 1
                const instance = entry.instance;

                try {
                    instance.rumble(weakMagnitude, strongMagnitude, duration);
                    return true;
                } catch (err) {
                    console.error('Rumble failed:', err);
                    return false;
                }
            }
        }

        return false;
    }

    startPolling(hz = 60) {
        // node-sdl handles polling via event loop, but keep for compatibility
        // Just do nothing - events will fire automatically
    }

    stopPolling() {
        // node-sdl handles polling via event loop, but keep for compatibility
    }
}
