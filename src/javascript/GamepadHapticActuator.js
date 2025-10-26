export class GamepadHapticActuator {
    constructor(manager, gamepadIndex, isController) {
        this._manager = manager;
        this._gamepadIndex = gamepadIndex;
        this._isController = isController;
    }

    async playEffect(type, params = {}) {
        if (!this._isController) {
            throw new Error('Haptic effects only supported on game controllers');
        }

        if (type !== 'dual-rumble') {
            throw new Error('Only "dual-rumble" effect type is currently supported');
        }

        const {
            duration = 0,
            startDelay = 0,
            strongMagnitude = 0,
            weakMagnitude = 0
        } = params;

        // If there's a start delay, wait first
        if (startDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, startDelay));
        }

        // Play the vibration effect
        const success = this._manager._native.playVibration(
            this._gamepadIndex,
            duration,
            strongMagnitude,
            weakMagnitude
        );

        return success ? 'complete' : 'preempted';
    }

    async pulse(value, duration) {
        return this.playEffect('dual-rumble', {
            duration,
            strongMagnitude: value,
            weakMagnitude: value
        });
    }

    reset() {
        if (this._isController) {
            this._manager._native.stopVibration(this._gamepadIndex);
        }
        return Promise.resolve();
    }
}
