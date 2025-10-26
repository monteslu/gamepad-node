import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Gamepad, GamepadButton } from '../../src/javascript/Gamepad.js';

describe('Gamepad', () => {
    describe('constructor with SDL_GameController data', () => {
        it('should create gamepad from controller data', () => {
            const nativeData = {
                id: 'Xbox 360 Controller',
                index: 0,
                connected: true,
                isController: true,
                guid: '030000005e040000a102000000000000',
                buttons: [
                    { pressed: false, value: 0.0 }, // A
                    { pressed: true, value: 1.0 },  // B
                    { pressed: false, value: 0.0 }  // X
                ],
                axes: [0.0, 0.5, -0.3, 0.0]
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(gamepad.id, 'Xbox 360 Controller');
            assert.strictEqual(gamepad.index, 0);
            assert.strictEqual(gamepad.connected, true);
            assert.strictEqual(gamepad.mapping, 'standard');
        });

        it('should convert button objects correctly', () => {
            const nativeData = {
                id: 'Test Controller',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [
                    { pressed: true, value: 1.0 },
                    { pressed: false, value: 0.0 }
                ],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.ok(gamepad.buttons[0] instanceof GamepadButton);
            assert.strictEqual(gamepad.buttons[0].pressed, true);
            assert.strictEqual(gamepad.buttons[0].value, 1.0);
            assert.strictEqual(gamepad.buttons[1].pressed, false);
        });

        it('should only use first 4 axes', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6] // 6 axes
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(gamepad.axes.length, 4);
            assert.strictEqual(gamepad.axes[0], 0.1);
            assert.strictEqual(gamepad.axes[3], 0.4);
        });
    });

    describe('constructor with SDL_Joystick data', () => {
        it('should apply mapping to joystick data', () => {
            const nativeData = {
                id: 'Generic Joystick',
                index: 0,
                connected: true,
                isController: false,
                guid: '99999',
                buttons: [
                    { pressed: true, value: 1.0 },  // Raw button 0
                    { pressed: false, value: 0.0 }
                ],
                axes: [0.5, -0.5]
            };

            const gamepad = new Gamepad(nativeData);

            // Should have mapped buttons
            assert.ok(Array.isArray(gamepad.buttons));
            assert.strictEqual(gamepad.buttons.length, 17); // Standard button count
            assert.strictEqual(gamepad.mapping, 'standard');
        });

        it('should store mapping source', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: false,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const mappingData = {
                mapping: 'test,mapping,a:b0,b:b1',
                source: 'test-db'
            };

            const gamepad = new Gamepad(nativeData, null, mappingData);

            assert.strictEqual(gamepad._mappingSource, 'test-db');
        });
    });

    describe('W3C Gamepad API compliance', () => {
        it('should have all required properties', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.ok('id' in gamepad);
            assert.ok('index' in gamepad);
            assert.ok('connected' in gamepad);
            assert.ok('timestamp' in gamepad);
            assert.ok('mapping' in gamepad);
            assert.ok('axes' in gamepad);
            assert.ok('buttons' in gamepad);
        });

        it('id should be string', () => {
            const nativeData = {
                id: 'Test Controller',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(typeof gamepad.id, 'string');
        });

        it('index should be number', () => {
            const nativeData = {
                id: 'Test',
                index: 2,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(typeof gamepad.index, 'number');
            assert.strictEqual(gamepad.index, 2);
        });

        it('connected should be boolean', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(typeof gamepad.connected, 'boolean');
        });

        it('timestamp should be number', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(typeof gamepad.timestamp, 'number');
            assert.ok(gamepad.timestamp > 0);
        });

        it('mapping should be "standard"', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(gamepad.mapping, 'standard');
        });

        it('buttons should be array of GamepadButton', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [
                    { pressed: true, value: 1.0 }
                ],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.ok(Array.isArray(gamepad.buttons));
            assert.ok(gamepad.buttons[0] instanceof GamepadButton);
        });

        it('axes should be array of numbers', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: [0.5, -0.5]
            };

            const gamepad = new Gamepad(nativeData);

            assert.ok(Array.isArray(gamepad.axes));
            gamepad.axes.forEach(axis => {
                assert.strictEqual(typeof axis, 'number');
            });
        });
    });

    describe('haptic actuator', () => {
        it('should accept haptic actuator', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const mockHapticActuator = {
                playEffect: () => {},
                reset: () => {}
            };

            const gamepad = new Gamepad(nativeData, mockHapticActuator);

            assert.strictEqual(gamepad.vibrationActuator, mockHapticActuator);
        });

        it('should be null if no haptic actuator provided', () => {
            const nativeData = {
                id: 'Test',
                index: 0,
                connected: true,
                isController: true,
                guid: '12345',
                buttons: [],
                axes: []
            };

            const gamepad = new Gamepad(nativeData);

            assert.strictEqual(gamepad.vibrationActuator, null);
        });
    });
});
