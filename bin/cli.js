#!/usr/bin/env node
import blessed from 'blessed';
import { installNavigatorShim } from '../index.js';

installNavigatorShim();

// Create screen
const screen = blessed.screen({
    smartCSR: true,
    title: 'Gamepad Tester v1.0',
    fullUnicode: true
});

// Header box
const header = blessed.box({
    top: 0,
    left: 'center',
    width: '100%',
    height: 3,
    content: '{center}{bold}{cyan-fg}╔═══════════════════════════════╗\n║   GAMEPAD TESTER v1.0   ║\n╚═══════════════════════════════╝{/}',
    tags: true,
    style: {
        fg: 'cyan'
    }
});

// Status message
const statusBox = blessed.box({
    top: 3,
    left: 0,
    width: '100%',
    height: 3,
    content: '{yellow-fg}Waiting for controllers...{/}',
    tags: true,
    padding: { left: 2 }
});

// Rumble feedback box
const rumbleBox = blessed.box({
    top: 3,
    right: 0,
    width: 30,
    height: 3,
    content: '',
    tags: true,
    padding: { right: 2 },
    align: 'right'
});

screen.append(header);
screen.append(statusBox);
screen.append(rumbleBox);

// Controller display boxes (up to 4 controllers)
const controllerBoxes = [];

function createControllerBox(index) {
    const top = 6 + (index * 29);

    const box = blessed.box({
        top,
        left: 0,
        width: '100%',
        height: 28,
        border: { type: 'line' },
        style: {
            border: { fg: 'green' }
        },
        tags: true,
        hidden: true,
        padding: { left: 1, right: 1 }
    });

    screen.append(box);
    return box;
}

for (let i = 0; i < 4; i++) {
    controllerBoxes.push(createControllerBox(i));
}

// Update loop at 60 FPS
setInterval(() => {
    const gamepads = navigator.getGamepads().filter(gp => gp !== null);

    if (gamepads.length === 0) {
        statusBox.setContent('{yellow-fg}No gamepads connected. Connect a controller to begin. Press q or Ctrl+C to exit.{/}');
        controllerBoxes.forEach(box => box.hide());
    } else {
        statusBox.setContent(`{green-fg}${gamepads.length} controller(s) connected. Press R for rumble | Q or Ctrl+C to exit.{/}`);

        gamepads.forEach((gamepad, idx) => {
            if (idx < 4) {
                updateControllerDisplay(controllerBoxes[idx], gamepad);
                controllerBoxes[idx].show();
            }
        });

        // Hide unused boxes
        for (let i = gamepads.length; i < 4; i++) {
            controllerBoxes[i].hide();
        }
    }

    screen.render();
}, 16); // 60 FPS

// Rumble on 'r' key
screen.key(['r'], () => {
    const gamepads = navigator.getGamepads().filter(gp => gp !== null);
    let rumbledCount = 0;

    gamepads.forEach(gamepad => {
        if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
            gamepad.hapticActuators[0].playEffect('dual-rumble', {
                duration: 200,
                strongMagnitude: 1.0,
                weakMagnitude: 0.5
            });
            rumbledCount++;
        }
    });

    if (rumbledCount > 0) {
        rumbleBox.setContent(`{green-fg}{bold}Rumble! (${rumbledCount} controller${rumbledCount > 1 ? 's' : ''}){/}`);
        setTimeout(() => {
            rumbleBox.setContent('');
            screen.render();
        }, 500);
    } else {
        rumbleBox.setContent('{yellow-fg}No rumble available{/}');
        setTimeout(() => {
            rumbleBox.setContent('');
            screen.render();
        }, 1000);
    }

    screen.render();
});

// Quit on Escape, q, or Ctrl+C
screen.key(['escape', 'q', 'C-c'], () => {
    return process.exit(0);
});

screen.render();

// Controller display update function
function updateControllerDisplay(box, gamepad) {
    const lines = [];

    // Header with detailed info
    const mappingInfo = gamepad._mappingSource ? ` ({yellow-fg}${gamepad._mappingSource} mapping{/})` : '';
    const hasRumble = gamepad.hapticActuators && gamepad.hapticActuators.length > 0;
    const rumbleInfo = hasRumble ? ' {magenta-fg}[Rumble: R key]{/}' : ' {gray-fg}[No Rumble]{/}';
    lines.push(`{bold}{green-fg}Controller ${gamepad.index}: ${gamepad.id}${mappingInfo}${rumbleInfo}{/}`);

    // Show raw data from native layer if available
    if (gamepad._native) {
        const type = gamepad._native.isController ? 'SDL_GameController' : 'SDL_Joystick';
        lines.push(`{cyan-fg}Type: ${type} | GUID: ${gamepad._native.guid}{/}`);
        lines.push(`{cyan-fg}Raw: ${gamepad._native.buttons.length} buttons, ${gamepad._native.axes.length} axes{/}`);
    }
    lines.push('');

    // Layout: Buttons (left column) | Sticks (middle) | D-Pad (right)
    const leftStickX = gamepad.axes[0] || 0;
    const leftStickY = gamepad.axes[1] || 0;
    const rightStickX = gamepad.axes[2] || 0;
    const rightStickY = gamepad.axes[3] || 0;

    // Triggers (as progress bars)
    const lt = gamepad.buttons[6]?.value || 0;
    const rt = gamepad.buttons[7]?.value || 0;
    const ltBar = createProgressBar(lt, 10);
    const rtBar = createProgressBar(rt, 10);
    lines.push(`     LT ${ltBar}        ${rtBar} RT`);

    // Shoulder buttons
    const lb = gamepad.buttons[4]?.pressed ? '{green-fg}{bold}[LB]●{/}' : '{gray-fg}[LB]○{/}';
    const rb = gamepad.buttons[5]?.pressed ? '{green-fg}{bold}[RB]●{/}' : '{gray-fg}[RB]○{/}';
    lines.push(`        ${lb}                            ${rb}`);
    lines.push('');

    // Center buttons (SELECT, START, GUIDE) and stick buttons (L3, R3)
    const selBtn = buttonState('SELECT', gamepad.buttons[8]);
    const startBtn = buttonState('START', gamepad.buttons[9]);
    const guideBtn = buttonState('GUIDE', gamepad.buttons[16]);
    const l3Btn = buttonState('L3', gamepad.buttons[10]);
    const r3Btn = buttonState('R3', gamepad.buttons[11]);
    lines.push(`        ${selBtn}  ${guideBtn}  ${startBtn}`);
    lines.push(`        ${l3Btn}            ${r3Btn}`);
    lines.push('');

    // Main layout - D-Pad on left, buttons on right
    lines.push('    D-Pad                                     Face Buttons');

    const dpadUp = gamepad.buttons[12]?.pressed;
    const dpadDown = gamepad.buttons[13]?.pressed;
    const dpadLeft = gamepad.buttons[14]?.pressed;
    const dpadRight = gamepad.buttons[15]?.pressed;

    const upChar = dpadUp ? '{green-fg}{bold}▲{/}' : '{gray-fg}△{/}';
    const downChar = dpadDown ? '{green-fg}{bold}▼{/}' : '{gray-fg}▽{/}';
    const leftChar = dpadLeft ? '{green-fg}{bold}◀{/}' : '{gray-fg}◁{/}';
    const rightChar = dpadRight ? '{green-fg}{bold}▶{/}' : '{gray-fg}▷{/}';

    const yBtn = buttonChar('Y', gamepad.buttons[3]);
    const bBtn = buttonChar('B', gamepad.buttons[1]);
    const aBtn = buttonChar('A', gamepad.buttons[0]);
    const xBtn = buttonChar('X', gamepad.buttons[2]);

    lines.push(`  ┌───┬───┬───┐                                      ${yBtn}`);
    lines.push(`  │   │ ${upChar} │   │                                ${xBtn}       ${bBtn}`);
    lines.push(`  ├───┼───┼───┤                                      ${aBtn}`);
    lines.push(`  │ ${leftChar} │   │ ${rightChar} │`);
    lines.push(`  ├───┼───┼───┤`);
    lines.push(`  │   │ ${downChar} │   │`);
    lines.push(`  └───┴───┴───┘`);
    lines.push('');

    // Analog sticks visualization
    lines.push('   Left Stick                      Right Stick');
    lines.push(`   (${leftStickX.toFixed(2)}, ${leftStickY.toFixed(2)})                     (${rightStickX.toFixed(2)}, ${rightStickY.toFixed(2)})`);
    for (let row = 0; row < 5; row++) {
        const leftLine = createStickRow(leftStickX, leftStickY, row);
        const rightLine = createStickRow(rightStickX, rightStickY, row);
        lines.push(`   ${leftLine}                  ${rightLine}`);
    }
    lines.push('');

    box.setContent(lines.join('\n'));
}

function buttonChar(label, button) {
    const pressed = button?.pressed || false;
    if (pressed) {
        return `{green-fg}{bold}(${label}){/}`;
    } else {
        return `{gray-fg}(${label}){/}`;
    }
}

function buttonState(name, button) {
    const pressed = button?.pressed || false;
    const color = pressed ? 'green' : 'gray';
    const symbol = pressed ? '●' : '○';
    return `{${color}-fg}[${name.padEnd(6)}] ${symbol}{/}`;
}

function createProgressBar(value, width) {
    const filled = Math.round(value * width);
    const empty = width - filled;
    if (filled > 0) {
        return `{green-fg}${'█'.repeat(filled)}{/}{gray-fg}${'░'.repeat(empty)}{/}`;
    }
    return `{gray-fg}${'░'.repeat(width)}{/}`;
}

function createStickRow(x, y, row) {
    const chars = [];
    for (let col = 0; col < 5; col++) {
        const gridX = (col - 2) / 2; // -1 to +1
        const gridY = (row - 2) / 2;
        const dist = Math.sqrt(Math.pow(gridX - x, 2) + Math.pow(gridY - y, 2));
        if (dist < 0.35) {
            chars.push('{green-fg}●{/}');
        } else if (col === 2 && row === 2) {
            chars.push('{yellow-fg}+{/}');
        } else {
            chars.push('{gray-fg}·{/}');
        }
    }
    return chars.join(' ');
}
