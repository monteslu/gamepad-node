import { installNavigatorShim, getControllerDef } from '../index.js';

installNavigatorShim();

console.log('Controller Mapping Test');
console.log('=======================');
console.log('This test verifies that joystick devices get proper standard mapping');
console.log('Press Ctrl+C to exit\n');

let lastState = {};

setInterval(() => {
    const gamepads = navigator.getGamepads();

    gamepads.forEach((gp, idx) => {
        if (!gp) return;

        const key = `gp${idx}`;

        // On first detection or reconnection
        if (!lastState[key] || !lastState[key].connected) {
            console.log(`\n📋 Gamepad ${idx} Detected:`);
            console.log(`   Name: ${gp.id}`);
            console.log(`   Type: ${gp._native.isController ? 'SDL_GameController ✅' : 'SDL_Joystick (needs mapping)'}`);
            console.log(`   GUID: ${gp._native.guid}`);

            if (!gp._native.isController) {
                // Check if we have a mapping
                const def = getControllerDef(gp._native.guid, gp.id);
                if (def) {
                    console.log(`   ✅ Database mapping found: ${def.fromDB || 'unknown source'}`);
                    console.log(`   Mapped inputs: ${def.input.length}`);
                } else {
                    console.log(`   ⚠️  No database mapping, using fallback`);
                }

                if (gp._mapping) {
                    console.log(`   Button mapping: ${gp._mapping.buttons.filter(b => b !== 100).length} buttons mapped`);
                    console.log(`   Axis mapping: ${Object.keys(gp._mapping.axes || {}).length} axes mapped`);
                }
            }
            console.log('');
        }

        // Track button presses
        gp.buttons.forEach((btn, btnIdx) => {
            const btnKey = `${key}_btn${btnIdx}`;
            if (btn.pressed && !lastState[btnKey]) {
                const buttonNames = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT',
                                    'SELECT', 'START', 'L3', 'R3',
                                    'UP', 'DOWN', 'LEFT', 'RIGHT', 'GUIDE'];
                console.log(`   🎮 Button ${buttonNames[btnIdx] || btnIdx} pressed (standard index ${btnIdx})`);
            }
            lastState[btnKey] = btn.pressed;
        });

        // Track significant axis movement
        gp.axes.forEach((val, axisIdx) => {
            const axisKey = `${key}_axis${axisIdx}`;
            const lastVal = lastState[axisKey] || 0;
            if (Math.abs(val - lastVal) > 0.3) {
                const axisNames = ['Left X', 'Left Y', 'Right X', 'Right Y'];
                console.log(`   🕹️  ${axisNames[axisIdx] || `Axis ${axisIdx}`}: ${val.toFixed(2)}`);
            }
            lastState[axisKey] = val;
        });

        lastState[key] = { connected: true };
    });
}, 100);
