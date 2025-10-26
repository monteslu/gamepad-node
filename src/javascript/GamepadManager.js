import { createRequire } from 'module';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Gamepad } from './Gamepad.js';
import { GamepadHapticActuator } from './GamepadHapticActuator.js';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const native = require('../../build/Release/gamepad_native.node');

export class GamepadManager extends EventEmitter {
    constructor() {
        super();

        // Load platform-specific SDL mappings for vendor/product matching on joysticks
        const platformMap = {
            'darwin': 'sdl_mappings_darwin.json',
            'linux': 'sdl_mappings_linux.json',
            'win32': 'sdl_mappings_win32.json'
        };

        const platform = process.platform;
        const mappingFile = platformMap[platform];

        // Build GUID -> mapping data and vendor/product index for joystick fallback
        this._guidToMapping = new Map(); // GUID -> {name, mapping, source}
        this._vendorProductIndex = new Map(); // vendor/product ID -> array of {guid, name, mapping, source}

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

                    console.log(`Loaded ${mappingsData.length} SDL mappings for joystick vendor/product matching`);
                } catch (err) {
                    console.warn('Failed to load SDL mappings:', err.message);
                }
            }
        }

        // Pass path to gamecontrollerdb.txt for SDL to load natively
        const gamecontrollerdbPath = path.join(__dirname, 'controllers', 'gamecontrollerdb.txt');
        this._native = new native.GamepadManager(gamecontrollerdbPath);
        this._pollInterval = null;
        this._hapticActuators = new Map();
        this._loggedVendorMatches = new Set(); // Track logged vendor/product matches

        // Set up event callbacks from native layer
        this._native.setEventCallback('connected', (gamepad) => {
            this.emit('gamepadconnected', { gamepad: this._wrapGamepad(gamepad) });
        });

        this._native.setEventCallback('disconnected', (gamepad) => {
            this._hapticActuators.delete(gamepad.index);
            this.emit('gamepaddisconnected', { gamepad: this._wrapGamepad(gamepad) });
        });
    }

    poll() {
        this._native.poll();
    }

    _wrapGamepad(nativeGamepad) {
        if (!nativeGamepad) return null;

        // Get or create haptic actuator
        let hapticActuator = this._hapticActuators.get(nativeGamepad.index);
        if (!hapticActuator && nativeGamepad.isController) {
            hapticActuator = new GamepadHapticActuator(
                this,
                nativeGamepad.index,
                nativeGamepad.isController
            );
            this._hapticActuators.set(nativeGamepad.index, hapticActuator);
        }

        // Look up mapping data
        let mappingData = this._guidToMapping.get(nativeGamepad.guid);

        // Only apply vendor/product matching to raw joysticks (isController=false)
        // Don't override SDL's built-in GameController mappings
        if (!mappingData && !nativeGamepad.isController && nativeGamepad.guid.length >= 20) {
            const vendorProduct = nativeGamepad.guid.substring(8, 20);
            const matches = this._vendorProductIndex.get(vendorProduct);

            if (matches && matches.length > 0) {
                const bestMatch = matches[0];

                // Log vendor/product match once
                if (!this._loggedVendorMatches.has(nativeGamepad.guid)) {
                    console.log(`Vendor/product match for ${nativeGamepad.guid}: using ${bestMatch.source} mapping`);
                    this._loggedVendorMatches.add(nativeGamepad.guid);
                }

                mappingData = {
                    name: bestMatch.name,
                    mapping: bestMatch.mapping,
                    source: bestMatch.source + ' (vendor/product match)',
                    guid: nativeGamepad.guid
                };
            }
        }

        return new Gamepad(nativeGamepad, hapticActuator, mappingData || null);
    }

    getGamepads() {
        const nativeGamepads = this._native.getGamepads();
        return nativeGamepads.map(gp => {
            if (gp === null) return null;
            return this._wrapGamepad(gp);
        });
    }

    startPolling(hz = 60) {
        if (this._pollInterval) {
            this.stopPolling();
        }
        const interval = Math.floor(1000 / hz);
        this._pollInterval = setInterval(() => this.poll(), interval);
    }

    stopPolling() {
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }
    }
}
