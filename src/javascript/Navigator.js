import { GamepadManager } from './GamepadManager.js';

let manager = null;

export function installNavigatorShim() {
    if (!globalThis.navigator) {
        globalThis.navigator = {};
    }

    if (!globalThis.window) {
        globalThis.window = globalThis;
    }

    if (!manager) {
        manager = new GamepadManager();

        // Forward events to window
        manager.on('gamepadconnected', (event) => {
            if (globalThis.window.dispatchEvent) {
                const customEvent = new CustomEvent('gamepadconnected', { detail: event });
                globalThis.window.dispatchEvent(customEvent);
            }
            // Also emit on global for addEventListener
            if (globalThis.addEventListener) {
                const customEvent = new CustomEvent('gamepadconnected', { detail: event });
                globalThis.dispatchEvent(customEvent);
            }
        });

        manager.on('gamepaddisconnected', (event) => {
            if (globalThis.window.dispatchEvent) {
                const customEvent = new CustomEvent('gamepaddisconnected', { detail: event });
                globalThis.window.dispatchEvent(customEvent);
            }
            // Also emit on global for addEventListener
            if (globalThis.addEventListener) {
                const customEvent = new CustomEvent('gamepaddisconnected', { detail: event });
                globalThis.dispatchEvent(customEvent);
            }
        });

        // Auto-poll at 60 Hz
        manager.startPolling(60);
    }

    globalThis.navigator.getGamepads = () => {
        manager.poll(); // Ensure we have latest state
        return manager.getGamepads();
    };

    return manager;
}

export function getManager() {
    return manager;
}
