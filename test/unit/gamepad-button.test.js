import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GamepadButton } from '../../src/javascript/Gamepad.js';

describe('GamepadButton', () => {
    describe('constructor', () => {
        it('should create button with default values', () => {
            const button = new GamepadButton();

            assert.strictEqual(button.pressed, false);
            assert.strictEqual(button.touched, false);
            assert.strictEqual(button.value, 0.0);
        });

        it('should create pressed button with correct values', () => {
            const button = new GamepadButton(true, 1.0);

            assert.strictEqual(button.pressed, true);
            assert.strictEqual(button.touched, true);
            assert.strictEqual(button.value, 1.0);
        });

        it('should create partially pressed button', () => {
            const button = new GamepadButton(false, 0.5);

            assert.strictEqual(button.pressed, false);
            assert.strictEqual(button.touched, false);
            assert.strictEqual(button.value, 0.5);
        });

        it('should set touched=true when pressed=true', () => {
            const button = new GamepadButton(true, 0.8);

            assert.strictEqual(button.touched, true);
        });
    });

    describe('W3C Gamepad API compliance', () => {
        it('should have all required properties', () => {
            const button = new GamepadButton(true, 1.0);

            assert.ok('pressed' in button);
            assert.ok('touched' in button);
            assert.ok('value' in button);
        });

        it('pressed should be boolean', () => {
            const button = new GamepadButton(true, 1.0);
            assert.strictEqual(typeof button.pressed, 'boolean');
        });

        it('touched should be boolean', () => {
            const button = new GamepadButton(true, 1.0);
            assert.strictEqual(typeof button.touched, 'boolean');
        });

        it('value should be number', () => {
            const button = new GamepadButton(true, 1.0);
            assert.strictEqual(typeof button.value, 'number');
        });

        it('value should be between 0.0 and 1.0', () => {
            const button = new GamepadButton(true, 1.0);
            assert.ok(button.value >= 0.0);
            assert.ok(button.value <= 1.0);
        });
    });
});
