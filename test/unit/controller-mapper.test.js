import { describe, it } from 'node:test';
import assert from 'node:assert';
import { mapButtons, mapAxes, getFallbackMapping } from '../../src/javascript/ControllerMapper.js';

describe('ControllerMapper', () => {
    describe('mapButtons', () => {
        it('should map raw buttons to standard layout', () => {
            // Mapping where raw button 1 -> standard button 0 (A)
            const jsMap = {
                buttons: [100, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
            };
            const rawButtons = [false, true, false, false]; // raw button 1 is pressed

            const result = mapButtons(rawButtons, jsMap);

            assert.strictEqual(result[0].pressed, true); // standard button 0 should be pressed
            assert.strictEqual(result[0].value, 1.0);
        });

        it('should handle unmapped buttons (100)', () => {
            const jsMap = {
                buttons: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
            };
            const rawButtons = [true, true, true];

            const result = mapButtons(rawButtons, jsMap);

            // All standard buttons should be unpressed
            result.forEach(btn => {
                assert.strictEqual(btn.pressed, false);
                assert.strictEqual(btn.value, 0.0);
            });
        });

        it('should create 17 standard buttons', () => {
            const jsMap = {
                buttons: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
            };
            const rawButtons = [false, false, false];

            const result = mapButtons(rawButtons, jsMap);

            assert.strictEqual(result.length, 17);
        });

        it('should handle triggers (buttons 6 and 7)', () => {
            const jsMap = {
                buttons: [100, 100, 100, 100, 100, 100, 6, 7]
            };
            const rawButtons = [false, false, false, false, false, false, true, true];

            const result = mapButtons(rawButtons, jsMap);

            assert.strictEqual(result[6].pressed, true); // LT
            assert.strictEqual(result[7].pressed, true); // RT
        });
    });

    describe('mapAxes', () => {
        it('should map raw axes to standard layout', () => {
            const jsMap = {
                axes: [
                    [{ id: 0, name: 'leftx', value: 1, multiplier: -1 }],
                    [{ id: 1, name: 'lefty', value: 1, multiplier: -1 }],
                    [{ id: 2, name: 'rightx', value: 1, multiplier: -1 }],
                    [{ id: 3, name: 'righty', value: 1, multiplier: -1 }]
                ]
            };
            const rawAxes = [0.5, -0.3, 0.8, 0.0];
            const buttons = Array(17).fill({ pressed: false, value: 0 });

            const result = mapAxes(rawAxes, jsMap, buttons);

            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], -0.5); // leftx with multiplier -1
            assert.strictEqual(result[1], 0.3);  // lefty with multiplier -1
        });

        it('should handle empty axes', () => {
            const jsMap = {
                axes: []
            };
            const rawAxes = [];
            const buttons = Array(17).fill({ pressed: false, value: 0 });

            const result = mapAxes(rawAxes, jsMap, buttons);

            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[0], 0.0);
            assert.strictEqual(result[1], 0.0);
            assert.strictEqual(result[2], 0.0);
            assert.strictEqual(result[3], 0.0);
        });

        it('should apply multiplier to axes', () => {
            const jsMap = {
                axes: [
                    [{ id: 0, name: 'leftx', value: 1, multiplier: -2 }]
                ]
            };
            const rawAxes = [0.5];
            const buttons = Array(17).fill({ pressed: false, value: 0 });

            const result = mapAxes(rawAxes, jsMap, buttons);

            // 0.5 * -2 = -1.0
            assert.strictEqual(result[0], -1.0);
        });
    });

    describe('getFallbackMapping', () => {
        it('should return valid mapping for unknown controller', () => {
            const mapping = getFallbackMapping('Unknown Controller XYZ');

            assert.ok(mapping);
            assert.ok(Array.isArray(mapping.buttons));
        });

        it('should have buttons array', () => {
            const mapping = getFallbackMapping('Test');

            assert.ok(Array.isArray(mapping.buttons));
            assert.ok(mapping.buttons.length > 0);
        });

        it('should detect Xbox-style controller', () => {
            const mapping = getFallbackMapping('Xbox 360 Controller');

            assert.ok(mapping);
            assert.ok(Array.isArray(mapping.buttons));
        });

        it('should detect PlayStation-style controller', () => {
            const mapping = getFallbackMapping('Sony DualShock 4');

            assert.ok(mapping);
            assert.ok(Array.isArray(mapping.buttons));
        });
    });

    describe('Standard button indices', () => {
        it('should map to correct W3C standard indices', () => {
            // W3C standard button indices:
            // 0: A/Cross, 1: B/Circle, 2: X/Square, 3: Y/Triangle
            // 4: LB, 5: RB, 6: LT, 7: RT
            // 8: SELECT, 9: START, 10: L3, 11: R3
            // 12: UP, 13: DOWN, 14: LEFT, 15: RIGHT, 16: GUIDE

            const jsMap = {
                buttons: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
            };
            const rawButtons = Array(17).fill(false);
            rawButtons[0] = true; // Press A button

            const result = mapButtons(rawButtons, jsMap);

            assert.strictEqual(result[0].pressed, true); // A
            assert.strictEqual(result.length, 17);
        });
    });

    describe('Axis indices', () => {
        it('should map to correct W3C standard axis indices', () => {
            // W3C standard axis indices:
            // 0: Left stick X, 1: Left stick Y
            // 2: Right stick X, 3: Right stick Y

            const jsMap = {
                axes: [
                    [{ id: 0, name: 'leftx', value: 1, multiplier: 1 }],
                    [{ id: 1, name: 'lefty', value: 1, multiplier: 1 }],
                    [{ id: 2, name: 'rightx', value: 1, multiplier: 1 }],
                    [{ id: 3, name: 'righty', value: 1, multiplier: 1 }]
                ]
            };
            const rawAxes = [0.5, -0.5, 1.0, -1.0];
            const buttons = Array(17).fill({ pressed: false, value: 0 });

            const result = mapAxes(rawAxes, jsMap, buttons);

            assert.strictEqual(result[0], 0.5);  // Left X
            assert.strictEqual(result[1], -0.5); // Left Y
            assert.strictEqual(result[2], 1.0);  // Right X
            assert.strictEqual(result[3], -1.0); // Right Y
        });
    });
});
