#ifndef GAMEPAD_MANAGER_H
#define GAMEPAD_MANAGER_H

#include <napi.h>
#include <SDL.h>
#include <vector>
#include <map>
#include <set>
#include <string>
#include <array>

namespace gamepad {

struct GamepadState {
    SDL_JoystickID instance_id;
    std::string id;              // Controller name
    std::string guid;            // SDL GUID
    int index;                   // Gamepad index
    bool is_controller;          // true = SDL_GameController, false = SDL_Joystick

    // Standard Gamepad API state
    std::array<bool, 17> buttons;
    std::array<float, 6> axes;
    bool connected;

    void* device;                // SDL_GameController* or SDL_Joystick*
};

class GamepadManager : public Napi::ObjectWrap<GamepadManager> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    static Napi::FunctionReference constructor;

    GamepadManager(const Napi::CallbackInfo& info);
    ~GamepadManager();

    // N-API Methods
    Napi::Value GetGamepads(const Napi::CallbackInfo& info);
    Napi::Value Poll(const Napi::CallbackInfo& info);
    Napi::Value PlayVibration(const Napi::CallbackInfo& info);
    Napi::Value StopVibration(const Napi::CallbackInfo& info);
    Napi::Value SetEventCallback(const Napi::CallbackInfo& info);
    Napi::Value AddControllerMapping(const Napi::CallbackInfo& info);

private:
    void ScanDevices();
    void AddController(int device_index);
    void AddJoystick(int device_index);
    void RemoveDevice(SDL_JoystickID instance_id);
    void HandleEvent(const SDL_Event& event);
    void UpdateControllerState(GamepadState& state, const SDL_Event& event);
    void UpdateJoystickState(GamepadState& state, const SDL_Event& event);
    std::string GetGUIDString(SDL_JoystickGUID guid);

    std::map<SDL_JoystickID, GamepadState> gamepads_;
    int next_index_;

    // Event callbacks
    Napi::FunctionReference on_connected_;
    Napi::FunctionReference on_disconnected_;

    void EmitConnected(const GamepadState& state);
    void EmitDisconnected(const GamepadState& state);
};

} // namespace gamepad

#endif // GAMEPAD_MANAGER_H
