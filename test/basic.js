import { installNavigatorShim } from '../index.js';

installNavigatorShim();

console.log('Gamepad Basic Test');
console.log('==================');
console.log('Waiting for gamepad... (press Ctrl+C to exit)');
console.log('');

setInterval(() => {
    const gamepads = navigator.getGamepads();
    const connected = gamepads.filter(gp => gp !== null);

    if (connected.length > 0) {
        console.clear();
        console.log('Gamepad Basic Test');
        console.log('==================\n');

        connected.forEach(gp => {
            console.log(`Gamepad ${gp.index}: ${gp.id}`);
            console.log(`  Connected: ${gp.connected}`);
            console.log(`  Mapping: ${gp.mapping}`);

            // Show pressed buttons
            const pressedButtons = [];
            const buttonNames = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT',
                                'SELECT', 'START', 'L3', 'R3',
                                'UP', 'DOWN', 'LEFT', 'RIGHT', 'GUIDE'];
            gp.buttons.forEach((btn, i) => {
                if (btn.pressed) {
                    pressedButtons.push(buttonNames[i] || `Button${i}`);
                }
            });

            if (pressedButtons.length > 0) {
                console.log(`  Buttons: ${pressedButtons.join(', ')}`);
            } else {
                console.log('  Buttons: (none pressed)');
            }

            // Show axes
            console.log(`  Left Stick:  (${gp.axes[0]?.toFixed(2)}, ${gp.axes[1]?.toFixed(2)})`);
            console.log(`  Right Stick: (${gp.axes[2]?.toFixed(2)}, ${gp.axes[3]?.toFixed(2)})`);
            console.log('');
        });

        console.log('Press Ctrl+C to exit');
    }
}, 100);
