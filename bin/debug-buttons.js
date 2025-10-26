#!/usr/bin/env node
import { installNavigatorShim } from '../index.js';

installNavigatorShim();

console.log('Gamepad Debug Utility');
console.log('Press buttons on your controller...\n');

let lastState = null;

setInterval(() => {
    const gamepads = navigator.getGamepads().filter(gp => gp !== null);

    if (gamepads.length === 0) {
        return;
    }

    const gamepad = gamepads[0];

    // Build current state string
    const rawButtons = gamepad._native ? gamepad._native.buttons.map(b => b ? 1 : 0) : [];
    const rawAxes = gamepad._native ? gamepad._native.axes.map(a => a.toFixed(2)) : [];
    const mappedButtons = gamepad.buttons.map(b => b?.pressed ? 1 : 0);
    const mappedAxes = gamepad.axes.map(a => a.toFixed(2));

    const currentState = JSON.stringify({ rawButtons, rawAxes, mappedButtons, mappedAxes });

    // Only print when state changes
    if (currentState !== lastState) {
        console.log('\n--- Button State Changed ---');
        console.log('RAW buttons:    [' + rawButtons.join(',') + ']');
        console.log('RAW axes:       [' + rawAxes.join(',') + ']');
        console.log('MAPPED buttons: [' + mappedButtons.join(',') + ']');
        console.log('MAPPED axes:    [' + mappedAxes.join(',') + ']');

        lastState = currentState;
    }
}, 50); // Check every 50ms
