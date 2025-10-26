import sdl from '@kmamal/sdl';

console.log('SDL Controller Devices:', sdl.controller.devices.length);
console.log('SDL Joystick Devices:', sdl.joystick.devices.length);

// Test joysticks
for (const device of sdl.joystick.devices) {
    console.log('\nJoystick:', device.name);
    console.log('  GUID:', device.guid);

    const instance = sdl.joystick.openDevice(device);
    console.log('  Num Buttons:', instance.numButtons);
    console.log('  Num Axes:', instance.numAxes);

    setInterval(() => {
        console.log('\n--- Poll ---');
        console.log('Buttons:', instance.buttons);
        console.log('Axes:', instance.axes.map(a => a.toFixed(2)));
    }, 1000);

    break; // Only test first joystick
}
