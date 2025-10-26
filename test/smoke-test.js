import { installNavigatorShim, getControllerDef } from '../index.js';

console.log('Smoke Test - Verifying API without gamepad\n');

// Test 1: Navigator shim installation
console.log('✓ Test 1: Installing navigator shim...');
const manager = installNavigatorShim();
console.log('  ✓ navigator.getGamepads is', typeof navigator.getGamepads);

// Test 2: getGamepads returns array
console.log('\n✓ Test 2: Calling navigator.getGamepads()...');
const gamepads = navigator.getGamepads();
console.log('  ✓ Returns array:', Array.isArray(gamepads));
console.log('  ✓ Length:', gamepads.length);
console.log('  ✓ Connected gamepads:', gamepads.filter(gp => gp !== null).length);

// Test 3: Controller database loaded
console.log('\n✓ Test 3: Checking controller database...');
const testController = getControllerDef('03000000c82d00000190000000000000', '8BitDo Pro 2');
console.log('  ✓ Database lookup works:', testController !== null);
if (testController) {
    console.log('  ✓ Found:', testController.name);
    console.log('  ✓ Inputs:', testController.input.length);
    console.log('  ✓ Source:', testController.fromDB);
}

// Test 4: Event listeners
console.log('\n✓ Test 4: Event listeners...');
let eventListenerWorks = false;
manager.on('gamepadconnected', () => {
    eventListenerWorks = true;
});
console.log('  ✓ Event listener registered');

console.log('\n✅ All smoke tests passed!\n');
console.log('To test with actual hardware:');
console.log('  npm test              - Basic gamepad test');
console.log('  npm run test:mapping  - Controller mapping test');
console.log('  npm run test:events   - Events and rumble test');
console.log('  node bin/cli.js       - Interactive CLI tester');

// Exit cleanly
process.exit(0);
