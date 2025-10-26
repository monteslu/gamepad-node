# Controllers with Guaranteed Standard Mapping

**ALL controllers get `mapping: "standard"` in gamepad-node!** This document lists the controllers with database mappings.

## Mapping Coverage Summary

gamepad-node provides `mapping: "standard"` through a **4-tier architecture**:

### Tier 1: SDL2 Built-in Database
- **~500 controllers** - Baked into SDL2 library
- Xbox, PlayStation, Switch Pro, and other popular controllers
- Automatic standard mapping, no configuration needed

### Tier 2: SDL_GameControllerDB (Community Database)
- **macOS**: 2108 controllers
- **Linux**: 2108 controllers
- **Windows**: 2108 controllers
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
|----------------|----------------------------------|--------|
| . MAYFLASH Arcade Fightstick F500 V2 | `03000000790000001c18000011010000` | 19 |
| 6B controller | `03000000a30c00002400000011010000` | 13 |
| 8Bitdo             8Bitdo NES30 Arcade | `03000000c82d00000310000011010000` | 15 |
| 8Bitdo  8BitDo M30 gamepad | `03000000c82d00000650000011010000` | 15 |
| 8Bitdo  8BitDo M30 Modkit | `03000000c82d00000150000011010000` | 13 |
| 8Bitdo  8BitDo N30 Pro 2 | `03000000c82d00001590000011010000` | 21 |
| 8BitDo 8BitDo Pro 2 | `03000000c82d00000660000011010000` | 21 |
| 8BitDo 8BitDo Ultimate wireless Controller for PC | `03000000c82d00001330000011010000` | 21 |
| 8BitDo 8BitDo Ultimate wireless Controller for PC | `03000000c82d00001230000011010000` | 21 |
| 8Bitdo FC30 Pro | `05000000c82d00001038000000010000` | 21 |
| 8Bitdo FC30 Pro    8Bitdo FC30 Pro | `03000000c82d00000090000011010000` | 21 |
| 8Bitdo JoyStick    8Bitdo Joy | `03000000008000000210000011010000` | 15 |
| 8BitDo Lite gamepad | `050000005e040000e002000003090000` | 21 |
| 8BitDo M30 gamepad | `05000000c82d00005106000000010000` | 15 |
| 8BitDo M30 gamepad | `050000005e0400008e02000030110000` | 17 |
| 8BitDo M30 Modkit | `05000000c82d00000151000000010000` | 13 |
| 8BitDo N30 Pro 2 | `05000000c82d00006528000000010000` | 21 |
| 8BitDo N64 Modkit | `05000000c82d00006928000000010000` | 18 |
| 8Bitdo NES30 Arcade | `05000000c82d00008010000000010000` | 15 |
| 8Bitdo NES30 Arcade(x) | `050000005e040000e002000003090000` | 17 |
| 8Bitdo NES30 GamePad | `05000000c82d00002028000000010000` | 13 |
| 8Bitdo NES30 Pro | `05000000c82d00002038000000010000` | 21 |
| 8Bitdo NES30 Pro   8Bitdo NES30 Pro | `03000000022000000090000011010000` | 21 |
| 8Bitdo NES30 Pro   8Bitdo NES30 Pro | `03000000021000000090000011010000` | 21 |
| 8BitDo Pro 2 | `05000000c82d00000660000000010000` | 21 |
| 8BitDo Pro 2 | `050000005e040000e002000003090000` | 21 |
| 8BitDo Pro 2 | `050000005e0400008e02000030110000` | 21 |
| 8Bitdo SF30 Pro | `050000005e040000e002000003090000` | 21 |
| 8Bitdo SF30 Pro | `05000000c82d00000060000000010000` | 19 |
| 8Bitdo SF30 Pro | `05000000c82d00000061000000010000` | 21 |
| 8Bitdo SF30 Pro   8Bitdo SF30 Pro | `03000000c82d00000060000011010000` | 21 |
| 8Bitdo SF30 Pro   8Bitdo SF30 Pro | `03000000c82d00000060000011010000` | 21 |
| 8Bitdo SF30 Pro   8Bitdo SN30 Pro | `03000000c82d00000160000011010000` | 21 |
| 8Bitdo SF30 Pro   8BitDo SN30 Pro+ | `03000000c82d00000260000011010000` | 21 |
| 8Bitdo SF30 Pro   8BitDo SN30 Pro+ | `03000000c82d00000260000011010000` | 21 |
| 8Bitdo SFC30 GamePad | `05000000c82d00003028000000010000` | 13 |
| 8BitDo SN30 Modkit | `05000000c82d00000351000000010000` | 13 |
| 8BitDo SN30 Pro+ | `050000005e040000e002000003090000` | 21 |
| 8BitDo SN30 Pro+ | `05000000c82d00000261000000010000` | 21 |
| 8Bitdo SNES30 GamePad(x) | `050000005e0400008e02000030110000` | 13 |
| 8BitDo Tech Co., Ltd. 8BitDo Zero 2 gamepad | `03000000c82d00001890000011010000` | 13 |
| 8BitDo Ultimate Wireless Controller | `03000000c82d00000631000014010000` | 21 |
| 8BitDo Ultimate Wireless Controller | `03000000c82d00000631000010010000` | 21 |
| 8BitDo Zero 2 gamepad | `05000000c82d00003032000000010000` | 13 |
| 8BitDo Zero 2 gamepad | `050000005e0400008e02000030110000` | 13 |
| 8Bitdo Zero GamePad | `05000000a00500003232000009010000` | 13 |
| A SPEED-LINK Competition Pro | `030000000b0400003365000000010000` | 9 |
| Afterglow Prismatic Wired Controller | `030000006f0e00003901000000430000` | 21 |
| Anbernic RG ARC-S Controller | `00000000000000000000000000000000` | 17 |
| Anbernic RG CubeXX Controller | `19000000010000000100000000010000` | 21 |
| Anbernic RG28XX Controller | `19000000010000000100000000010000` | 17 |
| Anbernic RG34XX Controller | `19000000010000000100000000010000` | 17 |
| Anbernic RG34XX-SP Controller | `19000000010000000100000000010000` | 21 |
| Anbernic RG35XX-H Controller | `19000000010000000100000000010000` | 21 |
| Anbernic RG35XX-Plus Controller | `19000000010000000100000000010000` | 17 |
| Anbernic RG35XX-Pro Controller | `19000000010000000100000000010000` | 21 |
| Anbernic RG35XX-SP Controller | `19000000010000000100000000010000` | 17 |
| Anbernic RG40XX-H Controller | `19000000010000000100000000010000` | 21 |
| Anbernic RG40XX-V Controller | `19000000010000000100000000010000` | 18 |
| ANBERNIC-keys | `19000000010000000100000000010000` | 21 |
| ASUS Gamepad TV500BG | `05000000050b00000045000040000000` | 21 |
| Atari Classic Controller | `03000000503200000110000000000000` | 11 |
| Baolian industry Co., Ltd TS-RT-JK | `03000000be3200001020000011010000` | 11 |
| Bensussen Deutsch & Associates,Inc.(BDA) NSW Spectra Wired Controller | `03000000d620000014a7000011010000` | 21 |
| Bigben Interactive Bigben Game Pad | `030000006b1400000209000011010000` | 21 |
| Bigben Interactive Revolution Unlimited Pro Controller | `030000006b140000100d000011010000` | 21 |
| Bluetooth Wireless Controller | `05000000102800000900000000010000` | 13 |
| Bluetooth Wireless Controller | `05000000102800000900000000010000` | 13 |
| Bluetooth Wireless Controller | `05000000203800000900000000010000` | 21 |
| Bluetooth Wireless Controller | `05000000801000000900000000010000` | 15 |
| Bluetooth Wireless Controller | `05000000a00500003232000001000000` | 13 |
| Broadcom Bluetooth Wireless  Joystick | `0500000042726f6164636f6d20426c00` | 21 |
| Brook P4 Wired Gamepad V1.6 | `03000000120c0000300c000011010000` | 21 |
| CHA1     CHA1 | `030000005a1c00002400000010010000` | 13 |
| CHA2     CHA2 | `030000005b1c00002500000010010000` | 13 |
| Core (Plus) Wired Controller | `03000000d620000011a7000011010000` | 21 |
| Deeplay-keys | `19000000010000000100000000010000` | 21 |
| DEvice SFR Controller | `030000006b14000001a0000010010000` | 21 |
| DragonRise Inc.   Generic   USB  Joystick | `03000000790000000600000010010000` | 21 |
| DragonRise Inc.   Generic   USB  Joystick | `03000000790000000600000010010000` | 21 |
| Driving Force GT | `030000006d0400009ac2000011010000` | 18 |
| Dual PSX-USB Adaptor | `03000000430b00000300000000010000` | 21 |
| ELAN TURBO PAD | `03000000341a00000302000010010000` | 21 |
| FC30               FC30  Joystick | `030000003512000011ab000010010000` | 13 |
| FGT Rumble Wheel | `030000004f04000051b6000010010000` | 17 |
| FUN R1 Player 1 | `03000000010000000100000001000000` | 13 |
| FUN R1 Player 2 | `03000000010000000100000001000000` | 12 |
| G25 Racing Wheel | `030000006d04000099c2000011010000` | 18 |
| G27 Racing Wheel | `030000006d0400009bc2000011010000` | 18 |
| g350_joypad | `190000004b4800000300000011010000` | 21 |
| GameForce ACE Gamepad | `0300000047616d65466f726365204100` | 21 |
| gameforce_gamepad | `19000000030000000300000002030000` | 19 |
| Gamepad | `0500000049190000020400001b010000` | 21 |
| Gasia Co.,Ltd PS(R) Gamepad | `030000004c0500006802000011810000` | 21 |
| Generic X-Box pad | `030000006b1400000506000014010000` | 21 |
| Generic X-Box pad | `030000000d0f0000a400000001010000` | 17 |
| Generic X-Box pad | `03000000790000009c18000001010000` | 16 |
| Generic X-Box pad | `03000000ff11000001f200002a000000` | 16 |
| Generic Xbox pad | `030000005e0400000a0b000005040000` | 21 |
| Generic Xbox pad | `030000006f0e0000b802000001010000` | 21 |
| Generic Xbox pad | `03000000632500008d05000003000000` | 21 |
| GO-Advance Gamepad | `190000004b4800000010000000010000` | 15 |
| GO-Advance Gamepad (rev 1.1) | `190000004b4800000010000001010000` | 17 |
| GO-Super Gamepad | `190000004b4800000011000000010000` | 21 |
| GO-Ultra Gamepad | `03000000474f2d556c74726120476100` | 19 |
| Google LLC Stadia Controller rev. A | `03000000d11800000094000011010000` | 21 |
| GPIO Controller 1 | `15000000010000000100000000010000` | 13 |
| GPIO Controller 2 | `15000000010000000200000000010000` | 13 |
| gpio-keys | `19000000010000000100000000010000` | 15 |
| GreenAsia Inc.    USB Joystick | `030000008f0e00000300000010010000` | 21 |
| HID 054c:0268 | `030000004c0500006802000011810000` | 21 |
| HID 0838:8918 | `03000000380800001889000011010000` | 15 |
| HJC Game GAMEPAD | `03000000c9110000f055000011010000` | 21 |
| HORI CO.,LTD. HORI Fighting Commander OCTA | `030000000d0f00006301000011010000` | 19 |
| HORI CO.,LTD. HORIPAD mini4 | `030000000d0f0000ee00000011010000` | 21 |
| HORI CO.,LTD. POKKEN CONTROLLER | `030000000d0f00009200000011010000` | 15 |
| idroid:con | `050000005c0a0000028500001b010000` | 21 |
| iNNEXT SNES Retro USB Controller | `03000000790000001100000010010000` | 13 |
| ipega Bluetooth Gamepad | `0500000049190000020400001b010000` | 19 |
| Joy-Con (L) | `050000007e0500000620000001000000` | 15 |
| Joy-Con (R) | `050000007e0500000720000001000000` | 15 |
| Keyboard | `-1` | 12 |
| Lic Pro Controller | `050000004c69632050726f20436f6e00` | 19 |
| Lic Pro Controller | `050000000d0f0000f600000001000000` | 21 |
| Licensed by Sony Computer Entertainment Guitar Hero5 for PlayStation (R) 3 | `03000000ba1200000001000010010000` | 11 |
| Logitech  Logitech MOMO Racing | `030000006d04000003ca000000010000` | 14 |
| Logitech G29 Driving Force Racing Wheel | `030000006d0400004fc2000011010000` | 18 |
| Logitech G920 Driving Force Racing Wheel | `030000006d04000062c2000011010000` | 18 |
| Logitech G923 Racing Wheel for PlayStation 4 and PC | `030000006d04000066c2000011010000` | 18 |
| Logitech Gamepad F310 | `030000006d0400001dc2000014400000` | 21 |
| Logitech Inc. WingMan RumblePad | `030000006d0400000ac2000010010000` | 19 |
| Logitech Logitech Driving Force | `030000006d04000094c2000000010000` | 18 |
| Logitech Logitech Driving Force Pro | `030000006d04000098c2000000010000` | 16 |
| Logitech Logitech RumblePad 2 USB | `030000006d04000018c2000010010000` | 21 |
| MD/Gen Control Pad | `050000007e0500001720000001800000` | 10 |
| Mega World | `03000000b50700000399000000010000` | 15 |
| Microntek USB Joystick | `03000000790000000600000010010000` | 21 |
| Microsoft SideWinder Force Feedback Wheel (USB) | `030000005e0400003400000000010000` | 12 |
| Microsoft SideWinder Precision Racing Wheel USB version 1.0 | `030000005e0400001a00000000010000` | 12 |
| Microsoft X-Box 360 pad | `030000005e0400008e02000020010000` | 21 |
| Microsoft X-Box 360 pad | `030000005e0400008e02000014010000` | 21 |
| Microsoft X-Box 360 pad | `030000005e0400008e02000072050000` | 19 |
| Microsoft X-Box 360 pad | `030000005e0400008e02000021010000` | 21 |
| Microsoft X-Box 360 pad | `030000005e0400008e02000010010000` | 21 |
| Microsoft X-Box One pad | `060000005e040000dd02000003020000` | 21 |
| Microsoft X-Box One pad | `060000005e040000ea0200000d050000` | 21 |
| Microsoft X-Box One pad | `060000005e040000120b000009050000` | 21 |
| Microsoft X-Box One pad | `060000005e040000120b00000f050000` | 21 |
| Microsoft X-Box One pad | `06000000c82d00000020000006010000` | 21 |
| Microsoft X-Box One pad | `0600000032150000290a000001010000` | 21 |
| Microsoft X-Box One pad | `06000000853200000806000003010000` | 21 |
| Microsoft X-Box One pad | `060000004f04000012d0000000010000` | 21 |
| Microsoft X-Box One pad | `060000005e040000120b000011050000` | 21 |
| Microsoft X-Box One pad | `060000000d0f00002101000001010000` | 18 |
| Microsoft Xbox 360 pad | `030000005e0400008e02000010010000` | 21 |
| Microsoft Xbox One pad (2015 firmware) | `030000005e040000dd02000003020000` | 21 |
| Microsoft Xbox One S pad | `030000005e040000ea02000001030000` | 17 |
| Microsoft Xbox One X pad | `030000005e040000120b000001050000` | 21 |
| Microsoft® Microsoft® SideWinder® Game Pad USB | `030000005e0400000700000000010000` | 15 |
| MOCUTE-056-M39-HID | `050000004d4f435554452d3035362d00` | 21 |
| N64 Controller | `050000007e0500001920000001800000` | 19 |
| NES30              NES30 Joystick | `03000000c82d000012ab000010010000` | 13 |
| Nintendo Co., Ltd. N64 Controller | `030000007e0500001920000011810000` | 19 |
| Nintendo Co., Ltd. Pro Controller | `030000007e0500000920000011810000` | 21 |
| Nintendo Co., Ltd. Pro Controller | `0300bb977e0500000920000011810000` | 21 |
| Nintendo Switch Combined Joy-Cons | `060000007e0500000820000000000000` | 21 |
| Nintendo Wii Remote | `050000007e050000060300001c3a0000` | 11 |
| Nintendo Wii Remote Classic Controller | `050000007e050000060300001c3a0000` | 15 |
| Nintendo Wii Remote Pro Controller | `050000007e0500003003000001000000` | 21 |
| Nintendo.Co.Ltd. Pro Controller | `030000007e0500000920000011810000` | 21 |
| NoName Generic USB Joystick | `030000001008000001e0000001010000` | 12 |
| NVIDIA Controller v01.04 | `05000000550900001472000001000000` | 21 |
| NVIDIA Corporation NVIDIA Controller v01.03 | `03000000550900001072000011010000` | 21 |
| odroidgo2_joypad | `19000000010000000100000001010000` | 15 |
| odroidgo2_joypad_v11 | `19000000010000000200000011000000` | 17 |
| odroidgo3_joypad | `19000000010000000100000001010000` | 19 |
| OpenSimHardware OSH PB Controller | `03000000091200000031000011010000` | 21 |
| OpenSimHardware OSH PB Controller | `03000000091200000031000011010000` | 17 |
| PCEngine PAD PCEngine PAD | `030000000d0f00003801000011010000` | 9 |
| PDP CO.,LTD. Faceoff Wired Pro Controller for Nintendo Switch | `030000006f0e00008001000011010000` | 21 |
| Performance Designed Products Versus Fighting Pad for PS3 | `030000006f0e00000901000011010000` | 15 |
| PiBoy DMG Controller | `15000000010000000100000000010000` | 17 |
| PLAYSTATION(R)3 Controller | `060000004c0500006802000000010000` | 21 |
| PLAYSTATION(R)3Conteroller-PANHAI | `05000000504c415953544154494f4e00` | 21 |
| PowerA Pro Ex | `03000000c62400001a53000000010000` | 21 |
| PowerA Xbox One wired controller | `03000000c62400003a54000001010000` | 21 |
| Powkiddy V20 Controler | `19000000330100009011000000000000` | 19 |
| Powkiddy V90s Controller | `19000000330100009011000000000000` | 15 |
| Powkiddy x55 Controller | `00000000000000000000000000000000` | 21 |
| Pro Controller | `050000007e0500000920000001000000` | 21 |
| Pro Controller | `050000007e0500000920000001800000` | 21 |
| PS3 Controller | `030000004c0500006802000011810000` | 21 |
| PS3/PC Gamepad | `03000000100800000300000010010000` | 15 |
| PS4 Controller | `030000004c050000c405000000016800` | 21 |
| ps5000-gamepad | `00000000000000000000000000000000` | 19 |
| Radica Gamester Reflex | `030000004c0e00000311000080000000` | 15 |
| Retro Bit Bluetooth Controller | `0500000049190000020400001b010000` | 15 |
| retrogame_joypad | `190000004b4800000111000000010000` | 21 |
| Retroid Pocket Controller | `03000000202000000130000001000000` | 21 |
| retroUSB NES RetroPort | `03000000d804000064f0000011010000` | 9 |
| RetroUSB.com SNES RetroPort | `0300000000f00000f100000000010000` | 13 |
| RG35XX Gamepad | `19000000010000000100000000010000` | 15 |
| Rock Candy Gamepad Wired Controller | `030000006f0e00001f01000000010000` | 21 |
| Saitek P990 Dual Analog Pad | `03000000a30600000b04000000010000` | 19 |
| Saitek PLC Cyborg Force Rumble Pad | `03000000a30600000cff000010010000` | 17 |
| SealieComputing N64 RetroPort | `03000000341200000400000000010000` | 17 |
| SFC30              SFC30 Joystick | `030000003512000021ab000010010000` | 13 |
| SFC30              SFC30 Joystick | `03000000c82d000021ab000010010000` | 13 |
| SHANWAN Android Gamepad | `03000000632500002605000010010000` | 21 |
| ShanWan PS(R) Ga`epad | `030000004c0500006802000010810000` | 21 |
| SHANWAN PS3 GamePad | `030000004c0500006802000010810000` | 21 |
| ShanWan USB GamePad | `03000000632500007505000011010000` | 21 |
| SNES30             SNES30 Joy | `03000000c82d000020ab000010010000` | 13 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000c405000011010000` | 21 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000c405000011810000` | 21 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000a00b000011010000` | 21 |
| Sony Computer Entertainment Wireless Controller | `030000004c050000a00b000011810000` | 21 |
| Sony Interactive Entertainment Controller | `030000004c050000da0c000011010000` | 15 |
| Sony Interactive Entertainment Game Controller | `050000004c050000cc09000000810000` | 19 |
| Sony Interactive Entertainment PC/PS3/Android Gamepad | `03000000120c0000160e000011010000` | 21 |
| Sony Interactive Entertainment Wireless Controller | `030000004c050000cc09000011010000` | 21 |
| Sony Interactive Entertainment Wireless Controller | `030000004c050000cc09000011810000` | 21 |
| Sony Interactive Entertainment Wireless Controller | `030000004c050000e60c000011810000` | 21 |
| Sony PLAYSTATION(R)3 Controller | `030000004c0500006802000011010000` | 21 |
| Sony PLAYSTATION(R)3 Controller | `050000004c0500006802000000000000` | 21 |
| Sony PLAYSTATION(R)3 Controller | `030000004c0500006802000011810000` | 21 |
| Sony PLAYSTATION(R)3 Controller | `050000004c0500006802000000800000` | 21 |
| StadiaJJPL-fc51 | `05000000d11800000094000000010000` | 21 |
| StadiaNT2K-2088 | `05000000d11800000094000000010000` | 21 |
| Steam Deck | `03000000de2800000512000011010000` | 21 |
| Steam Deck | `03000000de2800000512000010010000` | 20 |
| SteelSeries Stratus Duo | `03000000381000003014000075010000` | 21 |
| stick | `19000000010000000100000000010000` | 13 |
| SWITCH CO.,LTD. Controller (Dinput) | `03000000632500007505000011010000` | 17 |
| SWITCH CO.,LTD. USB Gamepad | `03000000790000001100000011010000` | 13 |
| SWITCH CO.,LTD. USB Gamepad | `03000000632500007505000011010000` | 21 |
| SZMY-POWER CO.,LTD. GAMEPAD 3 TURBO | `030000008f0e00000d31000010010000` | 21 |
| SZMY-POWER CO.,LTD. PLAYSTATION(R)3 Controller | `030000004c0500006802000011810000` | 21 |
| THEC64 Joystick     THEC64 Joystick | `03000000591c00002400000010010000` | 13 |
| Thrustmaster Dual Trigger 3-in-1 | `030000004f04000023b3000000010000` | 21 |
| Thrustmaster F430 Cockpit Wireless | `030000004f0400005bb6000000010000` | 18 |
| Thrustmaster F430 Cockpit Wireless PS3 | `030000004f0400005cb6000000010000` | 18 |
| Thrustmaster F430 Force Feedback | `030000004f0400005ab6000010010000` | 16 |
| Thrustmaster Gamepad GP XID | `030000004f04000026b3000002040000` | 21 |
| Thrustmaster Thrustmaster Advance Racer | `030000004f04000096b6000000010000` | 18 |
| Thrustmaster Thrustmaster FFB Wheel | `030000004f0400005db6000000010000` | 16 |
| Thrustmaster Thrustmaster T150RS | `030000004f04000077b6000011010000` | 16 |
| Thrustmaster Thrustmaster T300RS Racing wheel | `030000004f0400006eb6000011010000` | 18 |
| Thrustmaster Thrustmaster T80 | `030000004f0400006ab6000010010000` | 18 |
| ThrustMaster, Inc. Ferrari 458 Spider | `030000004f04000071b6000000010000` | 16 |
| TRIMUI Brick Controller | `030000005e0400008e02000014010000` | 19 |
| TRIMUI Smart Pro Controller | `03000000000000000000000001000000` | 19 |
| Trooper V2     Trooper V2 | `03000000242e00006a38000010010000` | 9 |
| Twin USB Joystick | `03000000100800000100000010010000` | 19 |
| Ultimarc IPAC 2 Ultimarc IPAC 2 | `0300000009d200002004000011010000` | 15 |
| USB Downlo01.80 PS3/USB Corded Gamepad | `030000004c0500006802000011810000` | 21 |
| usb gamepad | `030000001008000001e5000010010000` | 15 |
| Usb Gamepad | `03000000c01100000055000011010000` | 21 |
| Usb Gamepad | `030000006b1400000055000011010000` | 19 |
| USB gamepad | `030000001f08000001e4000010010000` | 13 |
| USB,2-axis 8-button gamepad | `03000000830500006020000010010000` | 13 |
| Virtual gamepad | `03000000030000000300000002000000` | 13 |
| virtual spinner | `03000000010000000100000001000000` | 11 |
| Wii U GameCube Adapter Port 1 | `030000007e0500003703000000000000` | 17 |
| Wireless Controller | `050000004c050000c405000000810000` | 21 |
| Wireless Controller | `050000004c050000cc09000000010000` | 21 |
| Wireless Controller | `050000004c050000e60c000000810000` | 21 |
| Wireless Controller | `050000004c050000cc09000000810000` | 21 |
| Wireless Steam Controller | `03000000de2800004211000011010000` | 21 |
| Xarcade-to-Gamepad Device 1 | `03000000010000000100000004000000` | 13 |
| Xarcade-to-Gamepad Device 1 | `03000000010000000100000004000000` | 11 |
| Xarcade-to-Gamepad Device 2 | `03000000010000000100000004000000` | 13 |
| Xarcade-to-Gamepad Device 2 | `03000000010000000100000004000000` | 9 |
| Xbox 360 Wireless Receiver | `030000005e0400001907000000010000` | 21 |
| Xbox 360 Wireless Receiver (XBOX) | `030000005e040000a102000007010000` | 21 |
| Xbox Gamepad (userspace driver) | `0000000058626f782047616d65706100` | 21 |
| Xbox Gamepad (userspace driver) | `0000000058626f782047616d65706100` | 21 |
| Xbox Wireless Controller | `050000005e040000fd02000003090000` | 21 |
| Xbox Wireless Controller | `050000005e040000fd02000030110000` | 21 |
| Xbox Wireless Controller | `050000005e0400008e02000030110000` | 21 |
| XiaoMi Bluetooth Wireless GameController | `05000000172700004431000029010000` | 21 |
| Xin-Mo Xin-Mo Dual Arcade | `03000000c0160000e105000001010000` | 15 |
| xin-mo.com Xinmotek Controller | `03000000c0160000e105000010010000` | 15 |

## Batocera EmulationStation (38 controllers)

| Controller Name | GUID | Inputs |
|----------------|----------------------------------|--------|
| 4dapter Retro Controller Adapter | `03000000412300003680000001010000` | 17 |
| 8BitDo 64 BT | `05000000c82d00001930000001000000` | 19 |
| 8BitDo 8BitDo 64 Bluetooth Controller | `03000000c82d00001930000011010000` | 19 |
| 8BitDo 8BitDo Ultimate Wired Controller | `03000000c82d00001130000011010000` | 21 |
| 8BitDo Micro gamepad | `05000000c82d00002090000000010000` | 15 |
| 8BitDo Ultimate 2 Wireless Controller | `03000000c82d00000b31000014010000` | 21 |
| 8BitDo Ultimate 2C Wireless Controller | `03000000c82d00000a31000014010000` | 21 |
| Anbernic pad | `00000000416e6265726e696320706100` | 21 |
| AYN Odin2 Gamepad | `03000000202000000130000001000000` | 21 |
| Baolian industry Co., Ltd TS-UAIB-V1 GKM HUB | `03000000be3200003214000011010000` | 19 |
| Broadcom Bluetooth Wireless Joystick | `0500000042726f6164636f6d20426c00` | 21 |
| GameForce ACE Gamepad | `0300000000000000ce0a000001000000` | 21 |
| Generic X-Box pad | `030000000d0f00003e01000015010000` | 18 |
| Lenovo Legion Controller for Windows | `03000000ef1700008261000000010000` | 21 |
| Logitech  PRO Racing Wheel | `030000006d04000072c2000011010000` | 18 |
| Logitech G923 Racing Wheel for Xbox One and PC | `030000006d0400006ec2000011010000` | 18 |
| Logitech Gamepad F710 | `030000006d0400001fc2000005030000` | 21 |
| Logitech Logitech Racing Wheel | `030000006d04000004ca000010010000` | 16 |
| MICREAL USB Controller1 | `03000000140300000122000011010000` | 15 |
| MICREAL USB Controller2 | `03000000140300000222000011010000` | 15 |
| Micro Star International Xbox360 Controller for Windows | `03000000b00d00000119000067010000` | 21 |
| Microsoft Xbox Controller | `060000005e040000dd02000003020000` | 21 |
| Microsoft Xbox Controller | `060000005e040000120b00000f050000` | 21 |
| Microsoft Xbox Controller | `06000000c62400003a54000001010000` | 21 |
| ps5000-gamepad | `000000007073353030302d67616d6500` | 15 |
| SPEEDLINK COMPETITION PRO Game Controller for Android | `03000000790000001c18000011010000` | 9 |
| Thrustmaster Thrustmaster Racing Wheel FFB | `030000004f04000096b6000011010000` | 18 |
| Xbox 360 Wireless Receiver | `030000005e040000a102000000010000` | 14 |
| XBOX Game Device | `030000009d070000080a000010010000` | 16 |
| Xbox Wireless Controller | `050000005e040000130b000015050000` | 21 |
| Xbox Wireless Controller | `050000005e040000200b000013050000` | 21 |
| Xbox Wireless Controller | `050000005e040000200b000023050000` | 21 |
| Xtension 2P Player 1 | `0000000010ba00008ace000000000000` | 13 |
| Xtension 2P Player 2 | `0000000010ba00008ace000000000000` | 13 |
| Xtension 4P Player 1 | `0000000010ba00008ace000000000000` | 13 |
| Xtension 4P Player 2 | `0000000010ba00008ace000000000000` | 13 |
| Xtension 4P Player 3 | `0000000010ba00008ace000000000000` | 11 |
| Xtension 4P Player 4 | `0000000010ba00008ace000000000000` | 11 |

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
- *SDL_GameControllerDB: 6324 total mappings (2108 macOS, 2108 Linux, 2108 Windows)*
- *EmulationStation: 321 controller definitions (283 Knulli, 38 Batocera)*
- *Last updated: 2025-10-26*
