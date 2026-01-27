import { describe, it } from 'node:test';
import assert from 'node:assert';
import { installNavigatorShim } from '../../src/javascript/Navigator.js';

// NOTE: This test file is excluded from npm test:unit and test:coverage
// because it initializes SDL which hangs in test harness without event loop.
// Navigator is tested manually with real hardware via test/basic.js

describe('Navigator Shim', () => {
    describe('installNavigatorShim', () => {
        it('should install navigator.getGamepads on globalThis', () => {
            const manager = installNavigatorShim();

            assert.ok(globalThis.navigator);
            assert.ok(globalThis.navigator.getGamepads);
            assert.strictEqual(typeof globalThis.navigator.getGamepads, 'function');
        });

        it('should return GamepadManager instance', () => {
            const manager = installNavigatorShim();

            assert.ok(manager);
            assert.ok(manager.poll);
            assert.ok(manager.getGamepads);
        });
    });

    describe('navigator.getGamepads', () => {
        it('should return array', () => {
            installNavigatorShim();
            const gamepads = navigator.getGamepads();

            assert.ok(Array.isArray(gamepads));
            assert.ok(gamepads.length <= 4); // Max 4 gamepads
        });

        it('should handle disconnected gamepads as null', () => {
            installNavigatorShim();
            const gamepads = navigator.getGamepads();

            // Each gamepad is either null or a valid Gamepad object
            gamepads.forEach((gamepad) => {
                if (gamepad !== null) {
                    assert.ok('id' in gamepad);
                    assert.ok('buttons' in gamepad);
                    assert.ok('axes' in gamepad);
                }
            });
        });
    });

    describe('W3C Gamepad API compliance', () => {
        it('should match browser API signature', () => {
            installNavigatorShim();
            const gamepads = navigator.getGamepads();

            assert.ok(Array.isArray(gamepads));
            assert.ok('length' in gamepads);
            assert.strictEqual(typeof gamepads.length, 'number');
        });

        it('getGamepads should be callable multiple times', () => {
            installNavigatorShim();
            const gamepads1 = navigator.getGamepads();
            const gamepads2 = navigator.getGamepads();

            assert.ok(gamepads1);
            assert.ok(gamepads2);
            assert.ok(Array.isArray(gamepads1));
            assert.ok(Array.isArray(gamepads2));
        });
    });
});
