#include <napi.h>
#include "gamepad_manager.h"

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return gamepad::GamepadManager::Init(env, exports);
}

NODE_API_MODULE(gamepad_native, Init)
