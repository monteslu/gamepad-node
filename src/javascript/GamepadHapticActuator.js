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
        const success = this._manager.playVibration(
            this._gamepadIndex,
            strongMagnitude,
            weakMagnitude,
            duration
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
            // Stop rumble by playing with 0 magnitude
            this._manager.playVibration(this._gamepadIndex, 0, 0, 0);
        }
        return Promise.resolve();
    }
}
