#include "gamepad_manager.h"
#include <cstring>

namespace gamepad {

Napi::FunctionReference GamepadManager::constructor;

// Standard Gamepad button mapping for SDL_GameController
enum StandardButton {
    BUTTON_A = 0,           // South
    BUTTON_B = 1,           // East
    BUTTON_X = 2,           // West
    BUTTON_Y = 3,           // North
    BUTTON_L1 = 4,          // Left shoulder
    BUTTON_R1 = 5,          // Right shoulder
    BUTTON_L2 = 6,          // Left trigger
    BUTTON_R2 = 7,          // Right trigger
    BUTTON_SELECT = 8,      // Back/Select
    BUTTON_START = 9,       // Start
    BUTTON_L3 = 10,         // Left stick
    BUTTON_R3 = 11,         // Right stick
    BUTTON_DPAD_UP = 12,
    BUTTON_DPAD_DOWN = 13,
    BUTTON_DPAD_LEFT = 14,
    BUTTON_DPAD_RIGHT = 15,
    BUTTON_GUIDE = 16       // Home/Guide
};

Napi::Object GamepadManager::Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "GamepadManager", {
        InstanceMethod("getGamepads", &GamepadManager::GetGamepads),
        InstanceMethod("poll", &GamepadManager::Poll),
        InstanceMethod("playVibration", &GamepadManager::PlayVibration),
        InstanceMethod("stopVibration", &GamepadManager::StopVibration),
        InstanceMethod("setEventCallback", &GamepadManager::SetEventCallback),
        InstanceMethod("addControllerMapping", &GamepadManager::AddControllerMapping),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("GamepadManager", func);
    return exports;
}

GamepadManager::GamepadManager(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<GamepadManager>(info), next_index_(0) {

    // Initialize SDL - VIDEO subsystem may be needed on macOS for proper device detection
    if (SDL_Init(SDL_INIT_JOYSTICK | SDL_INIT_GAMECONTROLLER | SDL_INIT_VIDEO) < 0) {
        Napi::Error::New(info.Env(), "Failed to initialize SDL").ThrowAsJavaScriptException();
        return;
    }

    // Force an initial joystick update on macOS
    SDL_JoystickUpdate();

    // Load gamecontrollerdb.txt if path provided
    if (info.Length() > 0 && info[0].IsString()) {
        std::string dbPath = info[0].As<Napi::String>().Utf8Value();
        int loaded = SDL_GameControllerAddMappingsFromFile(dbPath.c_str());

        if (loaded > 0) {
            printf("Loaded %d controller mappings from %s\n", loaded, dbPath.c_str());
        } else if (loaded < 0) {
            printf("Warning: Failed to load controller mappings from %s: %s\n",
                   dbPath.c_str(), SDL_GetError());
        }
    }

    // Give SDL time to enumerate devices and pump events
    SDL_Delay(100);
    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        HandleEvent(event);
    }

    // Scan for existing devices
    ScanDevices();
}

GamepadManager::~GamepadManager() {
    // Close all devices
    for (auto& pair : gamepads_) {
        GamepadState& state = pair.second;
        if (state.is_controller) {
            SDL_GameControllerClose((SDL_GameController*)state.device);
        } else {
            SDL_JoystickClose((SDL_Joystick*)state.device);
        }
    }

    SDL_Quit();
}

std::string GamepadManager::GetGUIDString(SDL_JoystickGUID guid) {
    char guid_str[33];
    SDL_JoystickGetGUIDString(guid, guid_str, sizeof(guid_str));
    return std::string(guid_str);
}

void GamepadManager::ScanDevices() {
    int num_joysticks = SDL_NumJoysticks();
    printf("ScanDevices: SDL_NumJoysticks() = %d\n", num_joysticks);

    for (int i = 0; i < num_joysticks; i++) {
        SDL_JoystickGUID guid = SDL_JoystickGetDeviceGUID(i);
        std::string guid_str = GetGUIDString(guid);
        bool is_controller = SDL_IsGameController(i);

        printf("Device %d: GUID=%s, SDL_IsGameController=%d\n",
               i, guid_str.c_str(), is_controller);

        if (is_controller) {
            printf("  -> Using SDL_GameController\n");
            AddController(i);
        } else {
            printf("  -> Using SDL_Joystick\n");
            AddJoystick(i);
        }
    }
}

void GamepadManager::AddController(int device_index) {
    SDL_GameController* controller = SDL_GameControllerOpen(device_index);
    if (!controller) {
        return;
    }

    SDL_Joystick* joystick = SDL_GameControllerGetJoystick(controller);
    SDL_JoystickID instance_id = SDL_JoystickInstanceID(joystick);

    // Check if already added
    if (gamepads_.find(instance_id) != gamepads_.end()) {
        SDL_GameControllerClose(controller);
        return;
    }

    GamepadState state;
    state.instance_id = instance_id;
    state.id = SDL_GameControllerName(controller);
    state.guid = GetGUIDString(SDL_JoystickGetGUID(joystick));
    state.index = next_index_++;
    state.is_controller = true;
    state.connected = true;
    state.device = controller;
    state.buttons.fill(false);
    state.axes.fill(0.0f);

    gamepads_[instance_id] = state;

    // Emit connected event
    EmitConnected(state);
}

void GamepadManager::AddJoystick(int device_index) {
    SDL_Joystick* joystick = SDL_JoystickOpen(device_index);
    if (!joystick) {
        return;
    }

    SDL_JoystickID instance_id = SDL_JoystickInstanceID(joystick);

    // Check if already added
    if (gamepads_.find(instance_id) != gamepads_.end()) {
        SDL_JoystickClose(joystick);
        return;
    }

    GamepadState state;
    state.instance_id = instance_id;
    state.id = SDL_JoystickName(joystick);
    state.guid = GetGUIDString(SDL_JoystickGetGUID(joystick));
    state.index = next_index_++;
    state.is_controller = false;
    state.connected = true;
    state.device = joystick;
    state.buttons.fill(false);
    state.axes.fill(0.0f);

    gamepads_[instance_id] = state;

    // Emit connected event
    EmitConnected(state);
}

void GamepadManager::RemoveDevice(SDL_JoystickID instance_id) {
    auto it = gamepads_.find(instance_id);
    if (it != gamepads_.end()) {
        GamepadState& state = it->second;

        // Emit disconnected event before removing
        EmitDisconnected(state);

        if (state.is_controller) {
            SDL_GameControllerClose((SDL_GameController*)state.device);
        } else {
            SDL_JoystickClose((SDL_Joystick*)state.device);
        }
        gamepads_.erase(it);
    }
}

void GamepadManager::UpdateControllerState(GamepadState& state, const SDL_Event& event) {
    // Note: state.device contains SDL_GameController* but we don't need it here
    // Button/axis updates come from the event structure

    if (event.type == SDL_CONTROLLERBUTTONDOWN || event.type == SDL_CONTROLLERBUTTONUP) {
        bool pressed = event.type == SDL_CONTROLLERBUTTONDOWN;

        // Map SDL controller button to standard gamepad button index
        switch (event.cbutton.button) {
            case SDL_CONTROLLER_BUTTON_A: state.buttons[BUTTON_A] = pressed; break;
            case SDL_CONTROLLER_BUTTON_B: state.buttons[BUTTON_B] = pressed; break;
            case SDL_CONTROLLER_BUTTON_X: state.buttons[BUTTON_X] = pressed; break;
            case SDL_CONTROLLER_BUTTON_Y: state.buttons[BUTTON_Y] = pressed; break;
            case SDL_CONTROLLER_BUTTON_LEFTSHOULDER: state.buttons[BUTTON_L1] = pressed; break;
            case SDL_CONTROLLER_BUTTON_RIGHTSHOULDER: state.buttons[BUTTON_R1] = pressed; break;
            case SDL_CONTROLLER_BUTTON_BACK: state.buttons[BUTTON_SELECT] = pressed; break;
            case SDL_CONTROLLER_BUTTON_START: state.buttons[BUTTON_START] = pressed; break;
            case SDL_CONTROLLER_BUTTON_LEFTSTICK: state.buttons[BUTTON_L3] = pressed; break;
            case SDL_CONTROLLER_BUTTON_RIGHTSTICK: state.buttons[BUTTON_R3] = pressed; break;
            case SDL_CONTROLLER_BUTTON_DPAD_UP: state.buttons[BUTTON_DPAD_UP] = pressed; break;
            case SDL_CONTROLLER_BUTTON_DPAD_DOWN: state.buttons[BUTTON_DPAD_DOWN] = pressed; break;
            case SDL_CONTROLLER_BUTTON_DPAD_LEFT: state.buttons[BUTTON_DPAD_LEFT] = pressed; break;
            case SDL_CONTROLLER_BUTTON_DPAD_RIGHT: state.buttons[BUTTON_DPAD_RIGHT] = pressed; break;
            case SDL_CONTROLLER_BUTTON_GUIDE: state.buttons[BUTTON_GUIDE] = pressed; break;
        }
    } else if (event.type == SDL_CONTROLLERAXISMOTION) {
        float value = event.caxis.value / 32768.0f; // Normalize to -1.0 to 1.0

        switch (event.caxis.axis) {
            case SDL_CONTROLLER_AXIS_LEFTX: state.axes[0] = value; break;
            case SDL_CONTROLLER_AXIS_LEFTY: state.axes[1] = value; break;
            case SDL_CONTROLLER_AXIS_RIGHTX: state.axes[2] = value; break;
            case SDL_CONTROLLER_AXIS_RIGHTY: state.axes[3] = value; break;
            case SDL_CONTROLLER_AXIS_TRIGGERLEFT:
                state.axes[4] = value;
                state.buttons[BUTTON_L2] = value > 0.11f;
                break;
            case SDL_CONTROLLER_AXIS_TRIGGERRIGHT:
                state.axes[5] = value;
                state.buttons[BUTTON_R2] = value > 0.11f;
                break;
        }
    }
}

void GamepadManager::UpdateJoystickState(GamepadState& state, const SDL_Event& event) {
    // For joysticks, we'll just store raw state
    // Mapping will be handled in JavaScript layer using controller database
    if (event.type == SDL_JOYBUTTONDOWN || event.type == SDL_JOYBUTTONUP) {
        bool pressed = event.type == SDL_JOYBUTTONDOWN;
        if (event.jbutton.button < 17) {
            state.buttons[event.jbutton.button] = pressed;
        }
    } else if (event.type == SDL_JOYAXISMOTION) {
        float value = event.jaxis.value / 32768.0f;
        if (event.jaxis.axis < 6) {
            state.axes[event.jaxis.axis] = value;
        }
    }
}

void GamepadManager::HandleEvent(const SDL_Event& event) {
    switch (event.type) {
        case SDL_CONTROLLERDEVICEADDED:
            AddController(event.cdevice.which);
            break;

        case SDL_JOYDEVICEADDED: {
            // Add as joystick only if SDL doesn't recognize it as a controller
            bool is_controller = SDL_IsGameController(event.jdevice.which);
            if (!is_controller) {
                AddJoystick(event.jdevice.which);
            }
            break;
        }

        case SDL_CONTROLLERDEVICEREMOVED:
        case SDL_JOYDEVICEREMOVED: {
            SDL_JoystickID instance_id = event.cdevice.which;
            RemoveDevice(instance_id);
            break;
        }

        case SDL_CONTROLLERBUTTONDOWN:
        case SDL_CONTROLLERBUTTONUP:
        case SDL_CONTROLLERAXISMOTION: {
            auto it = gamepads_.find(event.cbutton.which);
            if (it != gamepads_.end()) {
                UpdateControllerState(it->second, event);
            }
            break;
        }

        case SDL_JOYBUTTONDOWN:
        case SDL_JOYBUTTONUP:
        case SDL_JOYAXISMOTION: {
            auto it = gamepads_.find(event.jbutton.which);
            if (it != gamepads_.end()) {
                UpdateJoystickState(it->second, event);
            }
            break;
        }
    }
}

Napi::Value GamepadManager::Poll(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        HandleEvent(event);
    }

    return env.Undefined();
}

Napi::Value GamepadManager::GetGamepads(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Array result = Napi::Array::New(env);

    // Create array with 4 slots (standard gamepad API returns array of 4)
    for (int i = 0; i < 4; i++) {
        result[i] = env.Null();
    }

    // Fill in connected gamepads
    for (auto& pair : gamepads_) {
        GamepadState& state = pair.second;
        if (!state.connected || state.index >= 4) continue;

        Napi::Object gamepad = Napi::Object::New(env);
        gamepad.Set("id", Napi::String::New(env, state.id));
        gamepad.Set("guid", Napi::String::New(env, state.guid));
        gamepad.Set("index", Napi::Number::New(env, state.index));
        gamepad.Set("connected", Napi::Boolean::New(env, state.connected));
        gamepad.Set("isController", Napi::Boolean::New(env, state.is_controller));

        // Buttons
        Napi::Array buttons = Napi::Array::New(env, 17);
        for (size_t i = 0; i < 17; i++) {
            buttons[i] = Napi::Boolean::New(env, state.buttons[i]);
        }
        gamepad.Set("buttons", buttons);

        // Axes
        Napi::Array axes = Napi::Array::New(env, 6);
        for (size_t i = 0; i < 6; i++) {
            axes[i] = Napi::Number::New(env, state.axes[i]);
        }
        gamepad.Set("axes", axes);

        result[state.index] = gamepad;
    }

    return result;
}

Napi::Value GamepadManager::PlayVibration(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 4) {
        Napi::TypeError::New(env, "Expected 4 arguments: index, duration, strongMagnitude, weakMagnitude")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int gamepad_index = info[0].As<Napi::Number>().Int32Value();
    int duration = info[1].As<Napi::Number>().Int32Value();
    double strong = info[2].As<Napi::Number>().DoubleValue();
    double weak = info[3].As<Napi::Number>().DoubleValue();

    // Find gamepad by index
    GamepadState* target = nullptr;
    for (auto& pair : gamepads_) {
        if (pair.second.index == gamepad_index) {
            target = &pair.second;
            break;
        }
    }

    if (!target || !target->is_controller) {
        return Napi::Boolean::New(env, false);
    }

    SDL_GameController* controller = (SDL_GameController*)target->device;

    // Convert 0.0-1.0 range to 0-65535 range for SDL
    Uint16 low_freq = static_cast<Uint16>(weak * 65535);
    Uint16 high_freq = static_cast<Uint16>(strong * 65535);

    int result = SDL_GameControllerRumble(controller, low_freq, high_freq, duration);

    return Napi::Boolean::New(env, result == 0);
}

Napi::Value GamepadManager::StopVibration(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected gamepad index").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    int gamepad_index = info[0].As<Napi::Number>().Int32Value();

    // Find gamepad by index
    GamepadState* target = nullptr;
    for (auto& pair : gamepads_) {
        if (pair.second.index == gamepad_index) {
            target = &pair.second;
            break;
        }
    }

    if (!target || !target->is_controller) {
        return Napi::Boolean::New(env, false);
    }

    SDL_GameController* controller = (SDL_GameController*)target->device;
    int result = SDL_GameControllerRumble(controller, 0, 0, 0);

    return Napi::Boolean::New(env, result == 0);
}

Napi::Value GamepadManager::SetEventCallback(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected 2 arguments: eventType, callback")
            .ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string event_type = info[0].As<Napi::String>().Utf8Value();
    Napi::Function callback = info[1].As<Napi::Function>();

    if (event_type == "connected") {
        on_connected_ = Napi::Persistent(callback);
    } else if (event_type == "disconnected") {
        on_disconnected_ = Napi::Persistent(callback);
    }

    return env.Undefined();
}

void GamepadManager::EmitConnected(const GamepadState& state) {
    if (on_connected_.IsEmpty()) {
        return;
    }

    Napi::Env env = on_connected_.Env();
    Napi::HandleScope scope(env);

    // Create gamepad object to pass to event
    Napi::Object gamepad = Napi::Object::New(env);
    gamepad.Set("id", Napi::String::New(env, state.id));
    gamepad.Set("guid", Napi::String::New(env, state.guid));
    gamepad.Set("index", Napi::Number::New(env, state.index));
    gamepad.Set("connected", Napi::Boolean::New(env, true));
    gamepad.Set("isController", Napi::Boolean::New(env, state.is_controller));

    // Call the callback
    on_connected_.Call({gamepad});
}

void GamepadManager::EmitDisconnected(const GamepadState& state) {
    if (on_disconnected_.IsEmpty()) {
        return;
    }

    Napi::Env env = on_disconnected_.Env();
    Napi::HandleScope scope(env);

    // Create gamepad object to pass to event
    Napi::Object gamepad = Napi::Object::New(env);
    gamepad.Set("id", Napi::String::New(env, state.id));
    gamepad.Set("guid", Napi::String::New(env, state.guid));
    gamepad.Set("index", Napi::Number::New(env, state.index));
    gamepad.Set("connected", Napi::Boolean::New(env, false));
    gamepad.Set("isController", Napi::Boolean::New(env, state.is_controller));

    // Call the callback
    on_disconnected_.Call({gamepad});
}

Napi::Value GamepadManager::AddControllerMapping(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected SDL mapping string as argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string mappingStr = info[0].As<Napi::String>().Utf8Value();
    int result = SDL_GameControllerAddMapping(mappingStr.c_str());

    return Napi::Boolean::New(env, result >= 0);
}

} // namespace gamepad
