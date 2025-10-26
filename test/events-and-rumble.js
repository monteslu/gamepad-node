import { installNavigatorShim } from '../index.js';

const manager = installNavigatorShim();

console.log('Gamepad Events & Rumble Test');
console.log('=============================');
console.log('Connect or disconnect a controller to test events');
console.log('Press A button to test rumble');
console.log('Press Ctrl+C to exit\n');

// Listen for gamepad connection events
manager.on('gamepadconnected', (event) => {
    console.log('✅ Gamepad Connected!');
    console.log(`   Name: ${event.gamepad.id}`);
    console.log(`   Index: ${event.gamepad.index}`);
    console.log(`   Has vibration: ${event.gamepad.vibrationActuator !== null}\n`);
});

manager.on('gamepaddisconnected', (event) => {
    console.log('❌ Gamepad Disconnected!');
    console.log(`   Name: ${event.gamepad.id}`);
    console.log(`   Index: ${event.gamepad.index}\n`);
});

// Main loop - check for button presses
setInterval(async () => {
    const gamepads = navigator.getGamepads();

    for (const gp of gamepads) {
        if (!gp) continue;

        // Test rumble when A button is pressed
        if (gp.buttons[0].pressed && gp.vibrationActuator) {
            console.log('💥 Playing rumble effect...');

            // Play dual-rumble effect
            const result = await gp.vibrationActuator.playEffect('dual-rumble', {
                duration: 200,           // 200ms
                strongMagnitude: 1.0,    // 100% strong motor
                weakMagnitude: 0.5       // 50% weak motor
            });

            console.log(`   Result: ${result}\n`);
        }
    }
}, 100);
