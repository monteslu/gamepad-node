# Controllers with Guaranteed Standard Mapping

**ALL controllers get `mapping: "standard"` in gamepad-node!** This document lists the controllers with database mappings.

## Mapping Coverage Summary

gamepad-node provides `mapping: "standard"` through a **4-tier architecture**:

### Tier 1: SDL2 Built-in Database
- **~500 controllers** - Baked into SDL2 library
- Xbox, PlayStation, Switch Pro, and other popular controllers
- Automatic standard mapping, no configuration needed

### Tier 2: SDL_GameControllerDB (Community Database)
- **macOS**: 307 controllers
- **Linux**: 695 controllers
- **Windows**: 844 controllers
- Loaded automatically at startup based on platform
- Community-maintained database from https://github.com/mdqinc/SDL_GameControllerDB

### Tier 3: EmulationStation Database (Retro/Arcade Controllers)
- **321 unique controllers** (listed below)
- **From Knulli**: 283 controllers
- **From Batocera**: 38 controllers
- Specialized retro gaming, arcade, and handheld controllers
- GPIO controllers, arcade IPAC boards, Wii remotes, etc.

### Tier 4: Intelligent Fallbacks
- Xbox 360 style (default)
- PlayStation 4 style (for Sony controllers)
- Covers everything else

**Total: ~2000+ controllers with guaranteed standard mapping!**

## Understanding Standard Mapping

The Gamepad API defines a **"standard" mapping** (W3C specification) with predictable button/axis indices:
- `gamepad.mapping === "standard"` → Buttons follow predictable layout (button 0 = A, button 1 = B, etc.)
- `gamepad.mapping === ""` → Raw hardware indices, unpredictable

**The Problem with Browsers:**
- Only ~20-30 recognized controllers get `mapping: "standard"`
- Unknown controllers get `mapping: ""` with random button indices
- Your game must implement per-controller configuration UI (bad UX)

**gamepad-node's Solution:**
Every controller gets `mapping: "standard"` through the 4-tier system above.

## Real-World Benefits

With `mapping: "standard"` guaranteed for ALL controllers:

- ✅ **No configuration UI needed** - Games work immediately with any controller
- ✅ **Arcade sticks** - Get standard layout instead of `mapping: ""` chaos
- ✅ **Retro USB controllers** - NES, SNES, etc. get proper button mapping
- ✅ **Racing wheels & flight sticks** - Consistent button/axis layout
- ✅ **Multi-player games** - Mix Xbox + arcade stick + retro controller, all work the same
- ✅ **Future controllers** - New/unknown controllers work immediately with fallback mapping

See [WHY_BETTER_THAN_BROWSERS.md](./WHY_BETTER_THAN_BROWSERS.md) for detailed comparison.

## Standard Button Layout

All controllers are mapped to this standard layout:

| Index | Button | Description |
|-------|--------|-------------|
| 0 | A | South button (Cross on PlayStation) |
| 1 | B | East button (Circle on PlayStation) |
| 2 | X | West button (Square on PlayStation) |
| 3 | Y | North button (Triangle on PlayStation) |
| 4 | LB | Left bumper (L1) |
| 5 | RB | Right bumper (R1) |
| 6 | LT | Left trigger (L2) |
| 7 | RT | Right trigger (R2) |
| 8 | SELECT | Back/Select/Share button |
| 9 | START | Start/Options button |
| 10 | L3 | Left stick click |
| 11 | R3 | Right stick click |
| 12 | UP | D-pad up |
| 13 | DOWN | D-pad down |
| 14 | LEFT | D-pad left |
| 15 | RIGHT | D-pad right |
| 16 | GUIDE | Home/Guide/PS button |

## Axes

| Index | Description |
|-------|-------------|
| 0 | Left stick X (-1 = left, 1 = right) |
| 1 | Left stick Y (-1 = up, 1 = down) |
| 2 | Right stick X |
| 3 | Right stick Y |

---

## Tier 3: EmulationStation Database Controllers

These 321 controllers are from the EmulationStation retro gaming databases (Knulli and Batocera). They provide mappings for specialized hardware not found in SDL_GameControllerDB.

## Knulli EmulationStation (283 controllers)

| Controller Name | GUID | Inputs |
|----------------|------|--------|
| . MAYFLASH Arcade Fightstick F500 V2 | `0300000079000000...` | 19 |
| 6B controller | `03000000a30c0000...` | 13 |
| 8Bitdo             8Bitdo NES30 Arcade | `03000000c82d0000...` | 15 |
| 8Bitdo  8BitDo M30 gamepad | `03000000c82d0000...` | 15 |
| 8Bitdo  8BitDo M30 Modkit | `03000000c82d0000...` | 13 |
| 8Bitdo  8BitDo N30 Pro 2 | `03000000c82d0000...` | 21 |
| 8BitDo 8BitDo Pro 2 | `03000000c82d0000...` | 21 |
| 8BitDo 8BitDo Ultimate wireless Controller for PC | `03000000c82d0000...` | 21 |
| 8BitDo 8BitDo Ultimate wireless Controller for PC | `03000000c82d0000...` | 21 |
| 8Bitdo FC30 Pro | `05000000c82d0000...` | 21 |
| 8Bitdo FC30 Pro    8Bitdo FC30 Pro | `03000000c82d0000...` | 21 |
| 8Bitdo JoyStick    8Bitdo Joy | `0300000000800000...` | 15 |
| 8BitDo Lite gamepad | `050000005e040000...` | 21 |
| 8BitDo M30 gamepad | `05000000c82d0000...` | 15 |
| 8BitDo M30 gamepad | `050000005e040000...` | 17 |
| 8BitDo M30 Modkit | `05000000c82d0000...` | 13 |
| 8BitDo N30 Pro 2 | `05000000c82d0000...` | 21 |
| 8BitDo N64 Modkit | `05000000c82d0000...` | 18 |
| 8Bitdo NES30 Arcade | `05000000c82d0000...` | 15 |
| 8Bitdo NES30 Arcade(x) | `050000005e040000...` | 17 |
| 8Bitdo NES30 GamePad | `05000000c82d0000...` | 13 |
| 8Bitdo NES30 Pro | `05000000c82d0000...` | 21 |
| 8Bitdo NES30 Pro   8Bitdo NES30 Pro | `0300000002200000...` | 21 |
| 8Bitdo NES30 Pro   8Bitdo NES30 Pro | `0300000002100000...` | 21 |
| 8BitDo Pro 2 | `05000000c82d0000...` | 21 |
| 8BitDo Pro 2 | `050000005e040000...` | 21 |
| 8BitDo Pro 2 | `050000005e040000...` | 21 |
| 8Bitdo SF30 Pro | `050000005e040000...` | 21 |
| 8Bitdo SF30 Pro | `05000000c82d0000...` | 19 |
| 8Bitdo SF30 Pro | `05000000c82d0000...` | 21 |
| 8Bitdo SF30 Pro   8Bitdo SF30 Pro | `03000000c82d0000...` | 21 |
| 8Bitdo SF30 Pro   8Bitdo SF30 Pro | `03000000c82d0000...` | 21 |
| 8Bitdo SF30 Pro   8Bitdo SN30 Pro | `03000000c82d0000...` | 21 |
| 8Bitdo SF30 Pro   8BitDo SN30 Pro+ | `03000000c82d0000...` | 21 |
| 8Bitdo SF30 Pro   8BitDo SN30 Pro+ | `03000000c82d0000...` | 21 |
| 8Bitdo SFC30 GamePad | `05000000c82d0000...` | 13 |
| 8BitDo SN30 Modkit | `05000000c82d0000...` | 13 |
| 8BitDo SN30 Pro+ | `050000005e040000...` | 21 |
| 8BitDo SN30 Pro+ | `05000000c82d0000...` | 21 |
| 8Bitdo SNES30 GamePad(x) | `050000005e040000...` | 13 |
| 8BitDo Tech Co., Ltd. 8BitDo Zero 2 gamepad | `03000000c82d0000...` | 13 |
| 8BitDo Ultimate Wireless Controller | `03000000c82d0000...` | 21 |
| 8BitDo Ultimate Wireless Controller | `03000000c82d0000...` | 21 |
| 8BitDo Zero 2 gamepad | `05000000c82d0000...` | 13 |
| 8BitDo Zero 2 gamepad | `050000005e040000...` | 13 |
| 8Bitdo Zero GamePad | `05000000a0050000...` | 13 |
| A SPEED-LINK Competition Pro | `030000000b040000...` | 9 |
| Afterglow Prismatic Wired Controller | `030000006f0e0000...` | 21 |
| Anbernic RG ARC-S Controller | `0000000000000000...` | 17 |
| Anbernic RG CubeXX Controller | `1900000001000000...` | 21 |
| Anbernic RG28XX Controller | `1900000001000000...` | 17 |
| Anbernic RG34XX Controller | `1900000001000000...` | 17 |
| Anbernic RG34XX-SP Controller | `1900000001000000...` | 21 |
| Anbernic RG35XX-H Controller | `1900000001000000...` | 21 |
| Anbernic RG35XX-Plus Controller | `1900000001000000...` | 17 |
| Anbernic RG35XX-Pro Controller | `1900000001000000...` | 21 |
| Anbernic RG35XX-SP Controller | `1900000001000000...` | 17 |
| Anbernic RG40XX-H Controller | `1900000001000000...` | 21 |
| Anbernic RG40XX-V Controller | `1900000001000000...` | 18 |
| ANBERNIC-keys | `1900000001000000...` | 21 |
| ASUS Gamepad TV500BG | `05000000050b0000...` | 21 |
| Atari Classic Controller | `0300000050320000...` | 11 |
| Baolian industry Co., Ltd TS-RT-JK | `03000000be320000...` | 11 |
| Bensussen Deutsch & Associates,Inc.(BDA) NSW Spectra Wired Controller | `03000000d6200000...` | 21 |
| Bigben Interactive Bigben Game Pad | `030000006b140000...` | 21 |
| Bigben Interactive Revolution Unlimited Pro Controller | `030000006b140000...` | 21 |
| Bluetooth Wireless Controller | `0500000010280000...` | 13 |
| Bluetooth Wireless Controller | `0500000010280000...` | 13 |
| Bluetooth Wireless Controller | `0500000020380000...` | 21 |
| Bluetooth Wireless Controller | `0500000080100000...` | 15 |
| Bluetooth Wireless Controller | `05000000a0050000...` | 13 |
| Broadcom Bluetooth Wireless  Joystick | `0500000042726f61...` | 21 |
| Brook P4 Wired Gamepad V1.6 | `03000000120c0000...` | 21 |
| CHA1     CHA1 | `030000005a1c0000...` | 13 |
| CHA2     CHA2 | `030000005b1c0000...` | 13 |
| Core (Plus) Wired Controller | `03000000d6200000...` | 21 |
| Deeplay-keys | `1900000001000000...` | 21 |
| DEvice SFR Controller | `030000006b140000...` | 21 |
| DragonRise Inc.   Generic   USB  Joystick | `0300000079000000...` | 21 |
| DragonRise Inc.   Generic   USB  Joystick | `0300000079000000...` | 21 |
| Driving Force GT | `030000006d040000...` | 18 |
| Dual PSX-USB Adaptor | `03000000430b0000...` | 21 |
| ELAN TURBO PAD | `03000000341a0000...` | 21 |
| FC30               FC30  Joystick | `0300000035120000...` | 13 |
| FGT Rumble Wheel | `030000004f040000...` | 17 |
| FUN R1 Player 1 | `0300000001000000...` | 13 |
| FUN R1 Player 2 | `0300000001000000...` | 12 |
| G25 Racing Wheel | `030000006d040000...` | 18 |
| G27 Racing Wheel | `030000006d040000...` | 18 |
| g350_joypad | `190000004b480000...` | 21 |
| GameForce ACE Gamepad | `0300000047616d65...` | 21 |
| gameforce_gamepad | `1900000003000000...` | 19 |
| Gamepad | `0500000049190000...` | 21 |
| Gasia Co.,Ltd PS(R) Gamepad | `030000004c050000...` | 21 |
| Generic X-Box pad | `030000006b140000...` | 21 |
| Generic X-Box pad | `030000000d0f0000...` | 17 |
| Generic X-Box pad | `0300000079000000...` | 16 |
| Generic X-Box pad | `03000000ff110000...` | 16 |
| Generic Xbox pad | `030000005e040000...` | 21 |
| Generic Xbox pad | `030000006f0e0000...` | 21 |
| Generic Xbox pad | `0300000063250000...` | 21 |
| GO-Advance Gamepad | `190000004b480000...` | 15 |
| GO-Advance Gamepad (rev 1.1) | `190000004b480000...` | 17 |
| GO-Super Gamepad | `190000004b480000...` | 21 |
| GO-Ultra Gamepad | `03000000474f2d55...` | 19 |
| Google LLC Stadia Controller rev. A | `03000000d1180000...` | 21 |
| GPIO Controller 1 | `1500000001000000...` | 13 |
| GPIO Controller 2 | `1500000001000000...` | 13 |
| gpio-keys | `1900000001000000...` | 15 |
| GreenAsia Inc.    USB Joystick | `030000008f0e0000...` | 21 |
| HID 054c:0268 | `030000004c050000...` | 21 |
| HID 0838:8918 | `0300000038080000...` | 15 |
| HJC Game GAMEPAD | `03000000c9110000...` | 21 |
| HORI CO.,LTD. HORI Fighting Commander OCTA | `030000000d0f0000...` | 19 |
| HORI CO.,LTD. HORIPAD mini4 | `030000000d0f0000...` | 21 |
| HORI CO.,LTD. POKKEN CONTROLLER | `030000000d0f0000...` | 15 |
| idroid:con | `050000005c0a0000...` | 21 |
| iNNEXT SNES Retro USB Controller | `0300000079000000...` | 13 |
| ipega Bluetooth Gamepad | `0500000049190000...` | 19 |
| Joy-Con (L) | `050000007e050000...` | 15 |
| Joy-Con (R) | `050000007e050000...` | 15 |
| Keyboard | `-1...` | 12 |
| Lic Pro Controller | `050000004c696320...` | 19 |
| Lic Pro Controller | `050000000d0f0000...` | 21 |
| Licensed by Sony Computer Entertainment Guitar Hero5 for PlayStation (R) 3 | `03000000ba120000...` | 11 |
| Logitech  Logitech MOMO Racing | `030000006d040000...` | 14 |
| Logitech G29 Driving Force Racing Wheel | `030000006d040000...` | 18 |
| Logitech G920 Driving Force Racing Wheel | `030000006d040000...` | 18 |
| Logitech G923 Racing Wheel for PlayStation 4 and PC | `030000006d040000...` | 18 |
| Logitech Gamepad F310 | `030000006d040000...` | 21 |
| Logitech Inc. WingMan RumblePad | `030000006d040000...` | 19 |
| Logitech Logitech Driving Force | `030000006d040000...` | 18 |
| Logitech Logitech Driving Force Pro | `030000006d040000...` | 16 |
| Logitech Logitech RumblePad 2 USB | `030000006d040000...` | 21 |
| MD/Gen Control Pad | `050000007e050000...` | 10 |
| Mega World | `03000000b5070000...` | 15 |
| Microntek USB Joystick | `0300000079000000...` | 21 |
| Microsoft SideWinder Force Feedback Wheel (USB) | `030000005e040000...` | 12 |
| Microsoft SideWinder Precision Racing Wheel USB version 1.0 | `030000005e040000...` | 12 |
| Microsoft X-Box 360 pad | `030000005e040000...` | 21 |
| Microsoft X-Box 360 pad | `030000005e040000...` | 21 |
| Microsoft X-Box 360 pad | `030000005e040000...` | 19 |
| Microsoft X-Box 360 pad | `030000005e040000...` | 21 |
| Microsoft X-Box 360 pad | `030000005e040000...` | 21 |
| Microsoft X-Box One pad | `060000005e040000...` | 21 |
| Microsoft X-Box One pad | `060000005e040000...` | 21 |
| Microsoft X-Box One pad | `060000005e040000...` | 21 |
| Microsoft X-Box One pad | `060000005e040000...` | 21 |
| Microsoft X-Box One pad | `06000000c82d0000...` | 21 |
| Microsoft X-Box One pad | `0600000032150000...` | 21 |
| Microsoft X-Box One pad | `0600000085320000...` | 21 |
| Microsoft X-Box One pad | `060000004f040000...` | 21 |
| Microsoft X-Box One pad | `060000005e040000...` | 21 |
| Microsoft X-Box One pad | `060000000d0f0000...` | 18 |
| Microsoft Xbox 360 pad | `030000005e040000...` | 21 |
| Microsoft Xbox One pad (2015 firmware) | `030000005e040000...` | 21 |
| Microsoft Xbox One S pad | `030000005e040000...` | 17 |
| Microsoft Xbox One X pad | `030000005e040000...` | 21 |
| Microsoft® Microsoft® SideWinder® Game Pad USB | `030000005e040000...` | 15 |
| MOCUTE-056-M39-HID | `050000004d4f4355...` | 21 |
| N64 Controller | `050000007e050000...` | 19 |
| NES30              NES30 Joystick | `03000000c82d0000...` | 13 |
| Nintendo Co., Ltd. N64 Controller | `030000007e050000...` | 19 |
| Nintendo Co., Ltd. Pro Controller | `030000007e050000...` | 21 |
| Nintendo Co., Ltd. Pro Controller | `0300bb977e050000...` | 21 |
| Nintendo Switch Combined Joy-Cons | `060000007e050000...` | 21 |
| Nintendo Wii Remote | `050000007e050000...` | 11 |
| Nintendo Wii Remote Classic Controller | `050000007e050000...` | 15 |
| Nintendo Wii Remote Pro Controller | `050000007e050000...` | 21 |
| Nintendo.Co.Ltd. Pro Controller | `030000007e050000...` | 21 |
| NoName Generic USB Joystick | `0300000010080000...` | 12 |
| NVIDIA Controller v01.04 | `0500000055090000...` | 21 |
| NVIDIA Corporation NVIDIA Controller v01.03 | `0300000055090000...` | 21 |
| odroidgo2_joypad | `1900000001000000...` | 15 |
| odroidgo2_joypad_v11 | `1900000001000000...` | 17 |
| odroidgo3_joypad | `1900000001000000...` | 19 |
| OpenSimHardware OSH PB Controller | `0300000009120000...` | 21 |
| OpenSimHardware OSH PB Controller | `0300000009120000...` | 17 |
| PCEngine PAD PCEngine PAD | `030000000d0f0000...` | 9 |
| PDP CO.,LTD. Faceoff Wired Pro Controller for Nintendo Switch | `030000006f0e0000...` | 21 |
| Performance Designed Products Versus Fighting Pad for PS3 | `030000006f0e0000...` | 15 |
| PiBoy DMG Controller | `1500000001000000...` | 17 |
| PLAYSTATION(R)3 Controller | `060000004c050000...` | 21 |
| PLAYSTATION(R)3Conteroller-PANHAI | `05000000504c4159...` | 21 |
| PowerA Pro Ex | `03000000c6240000...` | 21 |
| PowerA Xbox One wired controller | `03000000c6240000...` | 21 |
| Powkiddy V20 Controler | `1900000033010000...` | 19 |
| Powkiddy V90s Controller | `1900000033010000...` | 15 |
| Powkiddy x55 Controller | `0000000000000000...` | 21 |
| Pro Controller | `050000007e050000...` | 21 |
| Pro Controller | `050000007e050000...` | 21 |
| PS3 Controller | `030000004c050000...` | 21 |
| PS3/PC Gamepad | `0300000010080000...` | 15 |
| PS4 Controller | `030000004c050000...` | 21 |
| ps5000-gamepad | `0000000000000000...` | 19 |
| Radica Gamester Reflex | `030000004c0e0000...` | 15 |
| Retro Bit Bluetooth Controller | `0500000049190000...` | 15 |
| retrogame_joypad | `190000004b480000...` | 21 |
| Retroid Pocket Controller | `0300000020200000...` | 21 |
| retroUSB NES RetroPort | `03000000d8040000...` | 9 |
| RetroUSB.com SNES RetroPort | `0300000000f00000...` | 13 |
| RG35XX Gamepad | `1900000001000000...` | 15 |
| Rock Candy Gamepad Wired Controller | `030000006f0e0000...` | 21 |
| Saitek P990 Dual Analog Pad | `03000000a3060000...` | 19 |
| Saitek PLC Cyborg Force Rumble Pad | `03000000a3060000...` | 17 |
| SealieComputing N64 RetroPort | `0300000034120000...` | 17 |
| SFC30              SFC30 Joystick | `0300000035120000...` | 13 |
| SFC30              SFC30 Joystick | `03000000c82d0000...` | 13 |
| SHANWAN Android Gamepad | `0300000063250000...` | 21 |
| ShanWan PS(R) Ga`epad | `030000004c050000...` | 21 |
| SHANWAN PS3 GamePad | `030000004c050000...` | 21 |
| ShanWan USB GamePad | `0300000063250000...` | 21 |
| SNES30             SNES30 Joy | `03000000c82d0000...` | 13 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000...` | 21 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000...` | 21 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000...` | 21 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000...` | 21 |
| Sony Interactive Entertainment Controller | `030000004c050000...` | 15 |
| Sony Interactive Entertainment Game Controller | `050000004c050000...` | 19 |
| Sony Interactive Entertainment PC/PS3/Android Gamepad | `03000000120c0000...` | 21 |
| Sony Interactive Entertainment Wireless Controller | `030000004c050000...` | 21 |
| Sony Interactive Entertainment Wireless Controller | `030000004c050000...` | 21 |
| Sony Interactive Entertainment Wireless Controller | `030000004c050000...` | 21 |
| Sony PLAYSTATION(R)3 Controller | `030000004c050000...` | 21 |
| Sony PLAYSTATION(R)3 Controller | `050000004c050000...` | 21 |
| Sony PLAYSTATION(R)3 Controller | `030000004c050000...` | 21 |
| Sony PLAYSTATION(R)3 Controller | `050000004c050000...` | 21 |
| StadiaJJPL-fc51 | `05000000d1180000...` | 21 |
| StadiaNT2K-2088 | `05000000d1180000...` | 21 |
| Steam Deck | `03000000de280000...` | 21 |
| Steam Deck | `03000000de280000...` | 20 |
| SteelSeries Stratus Duo | `0300000038100000...` | 21 |
| stick | `1900000001000000...` | 13 |
| SWITCH CO.,LTD. Controller (Dinput) | `0300000063250000...` | 17 |
| SWITCH CO.,LTD. USB Gamepad | `0300000079000000...` | 13 |
| SWITCH CO.,LTD. USB Gamepad | `0300000063250000...` | 21 |
| SZMY-POWER CO.,LTD. GAMEPAD 3 TURBO | `030000008f0e0000...` | 21 |
| SZMY-POWER CO.,LTD. PLAYSTATION(R)3 Controller | `030000004c050000...` | 21 |
| THEC64 Joystick     THEC64 Joystick | `03000000591c0000...` | 13 |
| Thrustmaster Dual Trigger 3-in-1 | `030000004f040000...` | 21 |
| Thrustmaster F430 Cockpit Wireless | `030000004f040000...` | 18 |
| Thrustmaster F430 Cockpit Wireless PS3 | `030000004f040000...` | 18 |
| Thrustmaster F430 Force Feedback | `030000004f040000...` | 16 |
| Thrustmaster Gamepad GP XID | `030000004f040000...` | 21 |
| Thrustmaster Thrustmaster Advance Racer | `030000004f040000...` | 18 |
| Thrustmaster Thrustmaster FFB Wheel | `030000004f040000...` | 16 |
| Thrustmaster Thrustmaster T150RS | `030000004f040000...` | 16 |
| Thrustmaster Thrustmaster T300RS Racing wheel | `030000004f040000...` | 18 |
| Thrustmaster Thrustmaster T80 | `030000004f040000...` | 18 |
| ThrustMaster, Inc. Ferrari 458 Spider | `030000004f040000...` | 16 |
| TRIMUI Brick Controller | `030000005e040000...` | 19 |
| TRIMUI Smart Pro Controller | `0300000000000000...` | 19 |
| Trooper V2     Trooper V2 | `03000000242e0000...` | 9 |
| Twin USB Joystick | `0300000010080000...` | 19 |
| Ultimarc IPAC 2 Ultimarc IPAC 2 | `0300000009d20000...` | 15 |
| USB Downlo01.80 PS3/USB Corded Gamepad | `030000004c050000...` | 21 |
| usb gamepad | `0300000010080000...` | 15 |
| Usb Gamepad | `03000000c0110000...` | 21 |
| Usb Gamepad | `030000006b140000...` | 19 |
| USB gamepad | `030000001f080000...` | 13 |
| USB,2-axis 8-button gamepad | `0300000083050000...` | 13 |
| Virtual gamepad | `0300000003000000...` | 13 |
| virtual spinner | `0300000001000000...` | 11 |
| Wii U GameCube Adapter Port 1 | `030000007e050000...` | 17 |
| Wireless Controller | `050000004c050000...` | 21 |
| Wireless Controller | `050000004c050000...` | 21 |
| Wireless Controller | `050000004c050000...` | 21 |
| Wireless Controller | `050000004c050000...` | 21 |
| Wireless Steam Controller | `03000000de280000...` | 21 |
| Xarcade-to-Gamepad Device 1 | `0300000001000000...` | 13 |
| Xarcade-to-Gamepad Device 1 | `0300000001000000...` | 11 |
| Xarcade-to-Gamepad Device 2 | `0300000001000000...` | 13 |
| Xarcade-to-Gamepad Device 2 | `0300000001000000...` | 9 |
| Xbox 360 Wireless Receiver | `030000005e040000...` | 21 |
| Xbox 360 Wireless Receiver (XBOX) | `030000005e040000...` | 21 |
| Xbox Gamepad (userspace driver) | `0000000058626f78...` | 21 |
| Xbox Gamepad (userspace driver) | `0000000058626f78...` | 21 |
| Xbox Wireless Controller | `050000005e040000...` | 21 |
| Xbox Wireless Controller | `050000005e040000...` | 21 |
| Xbox Wireless Controller | `050000005e040000...` | 21 |
| XiaoMi Bluetooth Wireless GameController | `0500000017270000...` | 21 |
| Xin-Mo Xin-Mo Dual Arcade | `03000000c0160000...` | 15 |
| xin-mo.com Xinmotek Controller | `03000000c0160000...` | 15 |

## Batocera EmulationStation (38 controllers)

| Controller Name | GUID | Inputs |
|----------------|------|--------|
| 4dapter Retro Controller Adapter | `0300000041230000...` | 17 |
| 8BitDo 64 BT | `05000000c82d0000...` | 19 |
| 8BitDo 8BitDo 64 Bluetooth Controller | `03000000c82d0000...` | 19 |
| 8BitDo 8BitDo Ultimate Wired Controller | `03000000c82d0000...` | 21 |
| 8BitDo Micro gamepad | `05000000c82d0000...` | 15 |
| 8BitDo Ultimate 2 Wireless Controller | `03000000c82d0000...` | 21 |
| 8BitDo Ultimate 2C Wireless Controller | `03000000c82d0000...` | 21 |
| Anbernic pad | `00000000416e6265...` | 21 |
| AYN Odin2 Gamepad | `0300000020200000...` | 21 |
| Baolian industry Co., Ltd TS-UAIB-V1 GKM HUB | `03000000be320000...` | 19 |
| Broadcom Bluetooth Wireless Joystick | `0500000042726f61...` | 21 |
| GameForce ACE Gamepad | `0300000000000000...` | 21 |
| Generic X-Box pad | `030000000d0f0000...` | 18 |
| Lenovo Legion Controller for Windows | `03000000ef170000...` | 21 |
| Logitech  PRO Racing Wheel | `030000006d040000...` | 18 |
| Logitech G923 Racing Wheel for Xbox One and PC | `030000006d040000...` | 18 |
| Logitech Gamepad F710 | `030000006d040000...` | 21 |
| Logitech Logitech Racing Wheel | `030000006d040000...` | 16 |
| MICREAL USB Controller1 | `0300000014030000...` | 15 |
| MICREAL USB Controller2 | `0300000014030000...` | 15 |
| Micro Star International Xbox360 Controller for Windows | `03000000b00d0000...` | 21 |
| Microsoft Xbox Controller | `060000005e040000...` | 21 |
| Microsoft Xbox Controller | `060000005e040000...` | 21 |
| Microsoft Xbox Controller | `06000000c6240000...` | 21 |
| ps5000-gamepad | `0000000070733530...` | 15 |
| SPEEDLINK COMPETITION PRO Game Controller for Android | `0300000079000000...` | 9 |
| Thrustmaster Thrustmaster Racing Wheel FFB | `030000004f040000...` | 18 |
| Xbox 360 Wireless Receiver | `030000005e040000...` | 14 |
| XBOX Game Device | `030000009d070000...` | 16 |
| Xbox Wireless Controller | `050000005e040000...` | 21 |
| Xbox Wireless Controller | `050000005e040000...` | 21 |
| Xbox Wireless Controller | `050000005e040000...` | 21 |
| Xtension 2P Player 1 | `0000000010ba0000...` | 13 |
| Xtension 2P Player 2 | `0000000010ba0000...` | 13 |
| Xtension 4P Player 1 | `0000000010ba0000...` | 13 |
| Xtension 4P Player 2 | `0000000010ba0000...` | 13 |
| Xtension 4P Player 3 | `0000000010ba0000...` | 11 |
| Xtension 4P Player 4 | `0000000010ba0000...` | 11 |

---

## Fallback Mappings (All Other Controllers)

**Every controller is supported!** Controllers not in the database above still work using intelligent fallback mappings:

### Xbox 360 Style (Default Fallback)
Used for controllers with "xbox", "360", or generic names:
- Standard Xbox button layout
- 2 analog sticks + triggers on axes 2 and 5

### PlayStation 4 Style (Sony Fallback)
Used for controllers with "sony", "ps4", or "dualshock" in the name:
- PlayStation button layout (Cross/Circle/Square/Triangle)
- 2 analog sticks + triggers on axes 2 and 5

### What This Means
- ✅ Your controller will work even if not listed above
- ✅ You'll get a reasonable standard button layout
- ✅ Database mappings provide more precise mapping when available

---

## Testing Your Controller

To see if your controller is recognized and properly mapped:

```bash
# Run the mapping test
npm run test:mapping

# Or use the interactive CLI tester
node bin/cli.js
```

The test will show:
- ✅ Database mapping found (uses EmulationStation config)
- ⚠️ No database mapping (uses fallback)
- Controller type (SDL_GameController or SDL_Joystick)

## Adding New Controllers

To add support for a new controller:

1. Connect your controller
2. Run `npm run test:mapping` to get the GUID
3. Add an entry to `src/javascript/controllers/db.json`:

```json
{
  "name": "My New Controller",
  "guid": "030000001234...",
  "input": [
    {"name": "a", "type": "button", "id": "0"},
    {"name": "b", "type": "button", "id": "1"},
    ...
  ],
  "fromDB": "custom"
}
```

4. Run this script to regenerate this document:

```bash
node scripts/generate-controller-list.mjs
```

Pull requests welcome!

---

*Generated from:*
- *SDL_GameControllerDB: 1846 total mappings (307 macOS, 695 Linux, 844 Windows)*
- *EmulationStation: 321 controller definitions (283 Knulli, 38 Batocera)*
- *Last updated: 2025-10-25*
