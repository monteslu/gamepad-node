#!/usr/bin/env node
import blessed from 'blessed';
import { installNavigatorShim } from '../index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

installNavigatorShim();

// Create screen
const screen = blessed.screen({
    smartCSR: true,
    title: `Gamepad Tester v${pkg.version}`,
    fullUnicode: true
});

// Header box
const headerText = `GAMEPAD TESTER v${pkg.version}`;
const headerWidth = 33;
const padding = Math.floor((headerWidth - 2 - headerText.length) / 2);
const headerLine = `║${' '.repeat(padding)}${headerText}${' '.repeat(headerWidth - 2 - padding - headerText.length)}║`;

const header = blessed.box({
    top: 0,
    left: 'center',
    width: '100%',
    height: 3,
    content: `{center}{bold}{cyan-fg}╔═══════════════════════════════╗\n${headerLine}\n╚═══════════════════════════════╝{/}`,
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
    height: 1,
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
    const top = 4 + (index * 25);

    const box = blessed.box({
        top,
        left: 0,
        width: '100%',
        height: 24,
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
screen.key(['r'], async () => {
    const gamepads = navigator.getGamepads().filter(gp => gp !== null);
    let rumbledCount = 0;

    for (const gamepad of gamepads) {
        if (gamepad.vibrationActuator) {
            rumbledCount++;
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                duration: 500,
                strongMagnitude: 1.0,
                weakMagnitude: 0.8
            });
        }
    }

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
    const hasRumble = gamepad.vibrationActuator !== null;
    const rumbleInfo = hasRumble ? ' {magenta-fg}[Rumble: R key]{/}' : ' {gray-fg}[No Rumble]{/}';
    lines.push(`{bold}{green-fg}Controller ${gamepad.index}: ${gamepad.id}${rumbleInfo}{/}`);

    // Show raw data from native layer if available
    if (gamepad._native) {
        const type = gamepad._native.isController ? 'SDL_GameController' : 'SDL_Joystick';
        const mappingInfo = gamepad._mappingSource ? ` ({yellow-fg}${gamepad._mappingSource} mapping{/})` : '';
        lines.push(`{cyan-fg}${type} | ${gamepad._native.buttons.length} buttons, ${gamepad._native.axes.length} axes{/}`);
        lines.push(`{cyan-fg}${gamepad._native.guid}${mappingInfo}{/}`);
    }

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

    // Shoulder and stick buttons combined
    const lb = gamepad.buttons[4]?.pressed ? '{green-fg}{bold}[LB]{/}' : '{gray-fg}[LB]{/}';
    const rb = gamepad.buttons[5]?.pressed ? '{green-fg}{bold}[RB]{/}' : '{gray-fg}[RB]{/}';
    const l3Btn = buttonState('L3', gamepad.buttons[10]);
    const r3Btn = buttonState('R3', gamepad.buttons[11]);
    lines.push(`        ${lb} ${l3Btn}            ${r3Btn} ${rb}`);

    // Center buttons (SELECT, START, GUIDE)
    const selBtn = buttonState('SELECT', gamepad.buttons[8]);
    const startBtn = buttonState('START', gamepad.buttons[9]);
    const guideBtn = buttonState('GUIDE', gamepad.buttons[16]);
    lines.push(`        ${selBtn}  ${guideBtn}  ${startBtn}`);
    lines.push('');

    // Main layout - D-Pad on left, buttons on right
    lines.push('    D-Pad');

    const dpadUp = gamepad.buttons[12]?.pressed;
    const dpadDown = gamepad.buttons[13]?.pressed;
    const dpadLeft = gamepad.buttons[14]?.pressed;
    const dpadRight = gamepad.buttons[15]?.pressed;

    const upChar = dpadUp ? '{green-fg}{bold}▲{/}' : '{gray-fg}△{/}';
    const downChar = dpadDown ? '{green-fg}{bold}▼{/}' : '{gray-fg}▽{/}';
    const leftChar = dpadLeft ? '{green-fg}{bold}◀{/}' : '{gray-fg}◁{/}';
    const rightChar = dpadRight ? '{green-fg}{bold}▶{/}' : '{gray-fg}▷{/}';

    const nBtn = buttonChar('N', gamepad.buttons[3]);  // North (top)
    const eBtn = buttonChar('E', gamepad.buttons[1]);  // East (right)
    const sBtn = buttonChar('S', gamepad.buttons[0]);  // South (bottom)
    const wBtn = buttonChar('W', gamepad.buttons[2]);  // West (left)

    lines.push(`  ┌───┬───┬───┐`);
    lines.push(`  │   │ ${upChar} │   │            Face Buttons (positional)`);
    lines.push(`  ├───┼───┼───┤                 ${nBtn}`);
    lines.push(`  │ ${leftChar} │   │ ${rightChar} │            ${wBtn}       ${eBtn}`);
    lines.push(`  ├───┼───┼───┤                 ${sBtn}`);
    lines.push(`  │   │ ${downChar} │   │`);
    lines.push(`  └───┴───┴───┘`);

    // Analog sticks visualization
    lines.push('   Left Stick              Right Stick');
    lines.push(`   (${leftStickX.toFixed(2)}, ${leftStickY.toFixed(2)})           (${rightStickX.toFixed(2)}, ${rightStickY.toFixed(2)})`);
    for (let row = 0; row < 5; row++) {
        const leftLine = createStickRow(leftStickX, leftStickY, row);
        const rightLine = createStickRow(rightStickX, rightStickY, row);
        lines.push(`   ${leftLine}               ${rightLine}`);
    }

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
    return `{${color}-fg}[${name}]{/}`;
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
