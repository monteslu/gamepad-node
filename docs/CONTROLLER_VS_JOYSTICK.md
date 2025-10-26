# SDL_GameController vs SDL_Joystick Safety Specification

## Architecture Overview

gamepad-node uses a **dual-mode** approach to support both standard and non-standard controllers:

### 1. SDL_GameController (Preferred)
- Used when SDL recognizes the device as a standard game controller
- SDL loads community [gamecontrollerdb.txt](https://github.com/mdqinc/SDL_GameControllerDB) (2134 mappings) on startup
- Combined with SDL's built-in mappings (~1000 compiled-in) = 2100+ total supported controllers
- Provides **standard button/axis mapping** (A, B, X, Y, triggers, sticks, etc.)
- Supports **advanced features**: vibration, touchpads (PS4/PS5), sensors
- Maps to `state.is_controller = true`

### 2. SDL_Joystick (Fallback)
- Used when SDL doesn't recognize the device as a standard controller
- Provides **raw button/axis data** (remapped via JavaScript mapping layers)
- **No advanced features** (no vibration, no touchpads)
- Mapping priority:
  1. Vendor/product ID matching from SDL mappings (for cross-platform joystick support)
  2. EmulationStation database (321 controllers)
  3. Fallback (Xbox 360/PS4 style)
- Maps to `state.is_controller = false`

## Detection Order (CRITICAL FOR SAFETY)

```cpp
// In ScanDevices() - this order is CRITICAL
for (int i = 0; i < num_joysticks; i++) {
    SDL_JoystickGUID guid = SDL_JoystickGetDeviceGUID(i);
    std::string guid_str = GetGUIDString(guid);
    bool is_controller = SDL_IsGameController(i);

    if (is_controller) {
        AddController(i);  // ✅ Priority: Use controller if SDL recognizes it
    } else {
        AddJoystick(i);    // ⚠️ Fallback: Raw joystick with JavaScript mappings
    }
}
```

**Why this order matters:**
- SDL natively recognizes 2100+ controllers after loading gamecontrollerdb.txt
- SDL_GameController provides more features (vibration, platform-specific drivers)
- Only unknown devices fall back to joystick mode with JavaScript-based mapping

## Safety Checks (MUST BE ENFORCED)

### Rule: Never call SDL_GameController* functions on SDL_Joystick devices

All controller-specific functions MUST check `is_controller` flag:

### ✅ Current Safety Checks

#### Vibration/Rumble
```cpp
Napi::Value GamepadManager::PlayVibration(const Napi::CallbackInfo& info) {
    // ... find gamepad ...

    if (!target || !target->is_controller) {
        return Napi::Boolean::New(env, false);  // ✅ Safe return, no crash
    }

    SDL_GameController* controller = (SDL_GameController*)target->device;
    SDL_GameControllerRumble(controller, ...);  // Only called if is_controller = true
}
```

#### Device Cleanup
```cpp
void GamepadManager::RemoveDevice(SDL_JoystickID instance_id) {
    GamepadState& state = it->second;

    if (state.is_controller) {
        SDL_GameControllerClose((SDL_GameController*)state.device);  // ✅ Safe
    } else {
        SDL_JoystickClose((SDL_Joystick*)state.device);              // ✅ Safe
    }
}
```

### ✅ Future: Touchpad Support (Not Yet Implemented)

When implementing touchpads, MUST follow this pattern:

```cpp
void GamepadManager::UpdateControllerState(GamepadState& state, const SDL_Event& event) {
    // Only poll touchpad if this is a controller
    if (state.is_controller) {  // ✅ CRITICAL CHECK
        SDL_GameController* controller = (SDL_GameController*)state.device;

        int num_touchpads = SDL_GameControllerGetNumTouchpads(controller);
        // ... poll touchpad data ...
    }
    // If is_controller = false, touchpads will be empty array (safe default)
}
```

### ❌ UNSAFE CODE (Never Do This)

```cpp
// ❌ WRONG - Will crash if device is a joystick!
void GamepadManager::UpdateControllerState(GamepadState& state, const SDL_Event& event) {
    SDL_GameController* controller = (SDL_GameController*)state.device;
    SDL_GameControllerRumble(controller, ...);  // 💥 CRASH if is_controller = false
}
```

## JavaScript Layer Safety

The `is_controller` flag is exposed to JavaScript:

```javascript
const gamepad = navigator.getGamepads()[0];

if (gamepad._native.isController) {
    // Safe to use vibrationActuator
    await gamepad.vibrationActuator.playEffect('dual-rumble', {...});
} else {
    // This is a joystick - no haptic actuator
    console.log('Vibration not supported on this device');
}
```

### Mapping Layer in JavaScript

The JavaScript layer handles mapping for joysticks and some controllers:

```javascript
// In Gamepad.js constructor
if (native_data.isController && !hasSDLMapping) {
    // SDL_GameController - use data as-is
    this.buttons = native_data.buttons.map(...);
    this.axes = native_data.axes.slice(0, 4);
} else {
    // SDL_Joystick OR controller with our SDL mapping - apply manual mapping
    let jsMap;

    // 1. Check if we have SDL mapping from vendor/product match
    if (hasSDLMapping) {
        jsMap = parseSDLMapping(mappingData.mapping);
    } else {
        // 2. Look up in EmulationStation database
        jsMap = createJSMap(native_data.guid, native_data.id);
    }

    // 3. Fallback if no mapping found
    if (!jsMap) {
        jsMap = getFallbackMapping(native_data.id);
    }

    // Apply mapping
    this.buttons = mapButtons(native_data.buttons, jsMap);
    this.axes = mapAxes(native_data.axes, jsMap, this.buttons);
}
```

### Automatic Safety in GamepadHapticActuator

```javascript
export class GamepadHapticActuator {
    constructor(manager, gamepadIndex, isController) {
        this._isController = isController;  // ✅ Store the flag
    }

    async playEffect(type, params) {
        if (!this._isController) {  // ✅ Check before calling native
            throw new Error('Haptic effects only supported on game controllers');
        }
        // ... call native rumble function ...
    }
}
```

**Important:** Joystick devices won't even have a `vibrationActuator` created:

```javascript
// In GamepadManager._wrapGamepad()
if (!hapticActuator && nativeGamepad.isController) {  // ✅ Only create if controller
    hapticActuator = new GamepadHapticActuator(...);
}
```

### Vendor/Product Matching Safety

Vendor/product matching is only applied to joysticks to avoid overriding SDL's good controller mappings:

```javascript
// In GamepadManager._wrapGamepad()
let mappingData = this._guidToMapping.get(nativeGamepad.guid);

// Only apply vendor/product matching to raw joysticks (isController=false)
// Don't override SDL's built-in GameController mappings
if (!mappingData && !nativeGamepad.isController && nativeGamepad.guid.length >= 20) {
    const vendorProduct = nativeGamepad.guid.substring(8, 20);
    const matches = this._vendorProductIndex.get(vendorProduct);

    if (matches && matches.length > 0) {
        mappingData = matches[0];  // Use cross-platform mapping
    }
}
```

## Event Handling Safety

Both controllers and joysticks emit connection events safely:

```cpp
void GamepadManager::EmitConnected(const GamepadState& state) {
    // ... create gamepad object ...
    gamepad.Set("isController", Napi::Boolean::New(env, state.is_controller));
    // ✅ JavaScript can check this flag before using advanced features
}
```

## Summary: Safety Checklist

When adding new SDL_GameController-only features:

1. ✅ Add `is_controller` check before calling SDL function
2. ✅ Return safe default value if joystick (e.g., false, empty array, null)
3. ✅ Document the check in code comments
4. ✅ Test with both controller AND joystick devices
5. ✅ Expose `isController` flag to JavaScript if needed

## Examples of Controller-Only Features

| Feature | SDL Function | Safety Check Required |
|---------|--------------|----------------------|
| Vibration | `SDL_GameControllerRumble()` | ✅ Implemented |
| Touchpad | `SDL_GameControllerGetTouchpadFinger()` | ⚠️ Not yet implemented |
| LED | `SDL_GameControllerSetLED()` | ⚠️ Not yet implemented |
| Sensors | `SDL_GameControllerGetSensorData()` | ⚠️ Not yet implemented |
| Player Index | `SDL_GameControllerSetPlayerIndex()` | ⚠️ Not yet implemented |

## Testing Strategy

Always test with TWO devices:

1. **Standard Controller** (e.g., Xbox 360, PS4)
   - Should have `is_controller = true`
   - Should support vibration
   - Should support touchpad (PS4/PS5)

2. **Generic Joystick** (e.g., flight stick, arcade stick)
   - Should have `is_controller = false`
   - Should NOT crash when calling gamepad functions
   - Should return safe defaults (no vibration, no touchpad)

---

**Version:** 0.1.0
**Last Updated:** 2024-10-25
