# Web Gamepad API: Community Mapping Support Proposal

This proposal adds opt-in support for community-maintained controller mappings (SDL_GameControllerDB) to the Gamepad API, expanding coverage from ~20-30 controllers to 2100+ controllers while maintaining 100% backwards compatibility.

---

## W3C Proposal: Gamepad API Community Mappings Extension

### The Problem

The current Gamepad API has a critical gap in controller support:

**Current State:**
- `mapping: "standard"` - Only ~20-30 browser-tested controllers
- `mapping: ""` - Everything else (2000+ controllers with unpredictable button layouts)

**Impact on Developers:**
- Games must implement per-controller configuration UIs (poor UX)
- Many controllers are unusable without custom workarounds
- Game engines build custom mapping layers (duplicated effort)

**Why Browsers Don't Add More "standard" Mappings:**
- Conservative quality bar (physical testing required)
- Maintenance burden for thousands of controllers
- Slow release cycles (6-8 weeks per new controller)

### Proposed Solution

Add opt-in support for community-maintained mappings from SDL_GameControllerDB.

Note: This proposal only affects controllers that currently have `mapping: ""`. Controllers that already work (with `mapping: "standard"`) are completely untouched.

```javascript
// Default behavior (100% backwards compatible)
navigator.getGamepads()
// Returns: mapping is ONLY "standard" or ""
// (These are the ONLY two values in the current spec)

// Opt-in to community mappings
navigator.getGamepads({ community: true })
// Returns: mapping can be "standard", "community", or ""
// "community" ONLY appears for controllers that would otherwise be ""
```

#### Behavior Table

| Controller Type | Default (no option) | With `{ community: true }` |
|----------------|---------------------|----------------------------|
| Xbox controller | `"standard"` | `"standard"`  (unchanged) |
| PlayStation controller | `"standard"` | `"standard"`  (unchanged) |
| 8BitDo (in SDL DB) | `""`  | `"community"`  (upgraded!) |
| Arcade stick (in SDL DB) | `""`  | `"community"`  (upgraded!) |
| Brand new controller | `""` | `""` (not in any DB) |

Controllers with `mapping: "standard"` never change. This proposal only fills gaps for controllers that are currently unusable (`mapping: ""`).

### Technical Specification

#### 1. Extended `getGamepads()` Method

```webidl
dictionary GamepadOptions {
    boolean community = false;
};

partial interface Navigator {
    sequence<Gamepad?> getGamepads(optional GamepadOptions options = {});
};
```

#### 2. Mapping Values

```javascript
interface Gamepad {
    // ... existing properties ...

    readonly attribute DOMString mapping;
    // Possible values:
    // - "standard"   - Browser-tested, guaranteed quality
    // - "community"  - Community-tested (SDL_GameControllerDB)
    // - ""          - Unknown controller
};
```

#### 3. Backwards Compatibility Guarantee

**Without opt-in (default):**
```javascript
navigator.getGamepads()
// Behavior identical to current implementation
// mapping is ONLY "standard" or ""
// Zero breaking changes
```

**With opt-in:**
```javascript
navigator.getGamepads({ community: true })
// NEW: mapping can be "standard", "community", or ""
// Browser-tested "standard" always takes priority over "community"
```

### Implementation Details

#### Data Source

Bundle SDL_GameControllerDB from https://github.com/mdqinc/SDL_GameControllerDB

**Stats:**
- File size: ~500KB (minified text)
- Controllers: 2,134 mappings
- Platforms: Windows, macOS, Linux, Android
- Maintenance: Community-maintained, updated regularly

#### Loading Strategy

```cpp
// Pseudocode - Shows that "standard" is never replaced
std::string GetGamepadMapping(GUID guid, bool use_community) {
    // 1. Check browser-tested mappings FIRST
    //    If found, return "standard" immediately
    //    Community mappings are NEVER checked for these controllers
    if (builtin_mappings.contains(guid)) {
        return "standard";  // Done! Community DB not consulted.
    }

    // 2. Controller doesn't have "standard" mapping
    //    ONLY NOW do we check community mappings (if opted-in)
    if (use_community && sdl_gamecontrollerdb.contains(guid)) {
        return "community";  // Upgrade from "" to "community"
    }

    // 3. Unknown - no mapping in any database
    return "";  // Same as current behavior
}
```

**Critical guarantee:** The `builtin_mappings.contains()` check happens FIRST. Community mappings are never even consulted for controllers that have `mapping: "standard"`.

#### Platform Filtering

SDL_GameControllerDB includes platform tags:
```
# Windows
03000000c82d00000160000000000000,8BitDo SN30 Pro,...,platform:Windows,
# macOS
03000000c82d00000160000000000000,8BitDo SN30 Pro,...,platform:Mac OS X,
# Linux
03000000c82d00000160000000000000,8BitDo SN30 Pro,...,platform:Linux,
```

Browsers should filter mappings by current platform to avoid incorrect mappings.

### Benefits

#### For Game Developers

**Before:**
```javascript
const gamepad = navigator.getGamepads()[0];
if (gamepad.mapping === "standard") {
    // Works for ~20-30 controllers
    handleStandardGamepad(gamepad);
} else {
    // mapping === "" - unusable without custom mapping
    showControllerConfigScreen();  // Poor UX
}
```

**After:**
```javascript
const gamepad = navigator.getGamepads({ community: true })[0];
if (gamepad.mapping === "standard" || gamepad.mapping === "community") {
    // Works for 2100+ controllers!
    handleStandardGamepad(gamepad);
} else {
    // Only truly unknown controllers need config
    showControllerConfigScreen();
}
```

#### For Game Engines

Engines like Phaser, Three.js, Babylon.js can:
- Enable `{ community: true }` by default in future versions
- Provide developer options to disable if needed
- Gradually adopt without breaking existing games

#### For Browser Vendors

-  Zero maintenance burden (community maintains SDL_GameControllerDB)
-  No physical testing required
-  Clear disclaimer (`"community"` = community-tested)
-  Doesn't weaken `"standard"` quality bar
-  100% backwards compatible
-  Single 500KB file, loaded on-demand

### Security & Privacy Considerations

**No new fingerprinting surface:**
- Controller GUID/name already exposed in existing API
- Community mappings don't expose additional information
- Opt-in nature prevents unexpected behavior

**No security implications:**
- Mapping data is static text (button index → button index)
- No executable code
- No network requests
- Sandboxed to gamepad API behavior

### Migration Path

**Phase 1: Opt-in (Year 1)**
- New games use `{ community: true }`
- Existing games unchanged
- Game engines evaluate adoption

**Phase 2: Ecosystem Adoption (Years 2-3)**
- Game engines add `{ community: true }` as default
- Provide opt-out for edge cases
- Documentation updated

**Phase 3: Future Consideration**
- If widely adopted with no issues, consider making community mappings default
- Would require separate W3C proposal
- Not part of this proposal

### Open Questions

1. **Update frequency:** How often should browsers update SDL_GameControllerDB?
   - Proposal: Quarterly updates via browser update cycle

2. **Custom mappings:** Should we support user-provided mappings?
   - Out of scope for this proposal
   - Could be future extension

3. **Mapping quality feedback:** How to report bad community mappings?
   - Direct users to SDL_GameControllerDB GitHub issues
   - Browser vendors not responsible for community mapping quality

---

## Chromium Bug Report Template

### Title
[Feature Request] Add opt-in support for SDL_GameControllerDB community controller mappings

### Component
Blink>GamepadAPI

### Type
Feature

### Priority
P3 (Enhancement)

### Description

**Summary:**
Add opt-in support for community-maintained controller mappings (SDL_GameControllerDB) to expand gamepad support from ~20-30 controllers to 2100+ controllers.

Note: This proposal only affects controllers that currently have `mapping: ""`. Controllers with `mapping: "standard"` are completely untouched.

**Motivation:**
The Gamepad API currently only provides `mapping: "standard"` for ~20-30 Chrome-tested controllers. All other controllers get `mapping: ""` with unpredictable button layouts, forcing game developers to implement custom per-controller configuration UIs.

**Current Spec Values:**
- `mapping: "standard"` - Only these two values exist today
- `mapping: ""` - Everything else

**Proposal:**
Extend `navigator.getGamepads()` with an optional parameter to include community mappings:

```javascript
// Default: current behavior (backwards compatible)
navigator.getGamepads()
// Returns: mapping is ONLY "standard" or ""

// Opt-in: include SDL_GameControllerDB mappings
navigator.getGamepads({ community: true })
// Returns: mapping can be "standard", "community", or ""
// "community" ONLY appears for controllers that would otherwise be ""
```

**Behavior Table:**

| Controller | Without option | With `{ community: true }` |
|-----------|---------------|---------------------------|
| Xbox | `"standard"` | `"standard"`  (no change) |
| PlayStation | `"standard"` | `"standard"`  (no change) |
| 8BitDo (in SDL DB) | `""`  | `"community"`  (upgraded) |
| Unknown gamepad | `""` | `""` (not in any DB) |

**Key:** Controllers with `"standard"` mapping are **never touched**. Community mappings only upgrade controllers from `""` to `"community"`.

**Implementation Plan:**

1. Bundle SDL_GameControllerDB (~500KB)
   - Source: https://github.com/mdqinc/SDL_GameControllerDB
   - 2,134 controller mappings
   - Platform filtering (Windows/macOS/Linux/Android)

2. Extend `Navigator.getGamepads()`
   ```cpp
   // In blink/modules/gamepad/navigator_gamepad.cc
   ScriptValue NavigatorGamepad::getGamepads(
       ScriptState* script_state,
       const GamepadOptions& options) {
       // ... existing code ...

       bool use_community = options.hasCommunity() && options.community();

       for (auto& device : devices) {
           String mapping = GetDeviceMapping(device, use_community);
           // ...
       }
   }
   ```

3. Priority logic (critical):
   ```cpp
   String GetDeviceMapping(Device& device, bool use_community) {
       // 1. Chrome-tested mappings ALWAYS first
       if (chrome_mappings_.Contains(device.guid)) {
           return "standard";
       }

       // 2. Community mappings only if opted-in
       if (use_community && sdl_db_.Contains(device.guid)) {
           return "community";
       }

       return "";  // Unknown
   }
   ```

**Backwards Compatibility:**
-  Default behavior unchanged (no breaking changes)
-  Existing games work identically
-  Community mappings never override Chrome-tested "standard" mappings
-  Opt-in nature allows gradual adoption

**Benefits:**
- Game developers get 2100+ usable controllers instead of ~20-30
- Zero maintenance burden (community maintains database)
- No physical testing required
- Clear disclaimer (community-tested vs Chrome-tested)
- Eliminates need for custom per-controller configuration UIs

**Similar Implementations:**
- SDL2 (C++) - Uses SDL_GameControllerDB natively
- Unity - Loads SDL mappings for gamepad support
- Godot Engine - Uses SDL_GameControllerDB
- Many Node.js gamepad libraries (including this project)

**Files to Modify:**
```
third_party/blink/renderer/modules/gamepad/
├── navigator_gamepad.h           # Add options parameter
├── navigator_gamepad.cc          # Implement community mapping logic
├── gamepad.idl                   # Extend WebIDL
└── gamepad_mapping_database.cc   # Add SDL database loading
```

**Resource Bundle:**
```
third_party/sdl_gamecontrollerdb/
└── gamecontrollerdb.txt          # Bundle SDL database
```

**Testing Plan:**
1. Unit tests: Verify priority (standard > community > empty)
2. Integration tests: Test opt-in behavior
3. Layout tests: Verify backwards compatibility
4. Platform tests: Windows/macOS/Linux filtering

**Size Impact:**
- Binary size: ~500KB (compressed text)
- Memory: Loaded on-demand when gamepad accessed
- Performance: One-time parse, negligible impact

**Web Platform Tests:**
```javascript
// wpt/gamepad/getGamepads-community-option.html
test(() => {
    const gamepads = navigator.getGamepads();
    // Should not include community mappings by default
}, "getGamepads() without options excludes community mappings");

test(() => {
    const gamepads = navigator.getGamepads({ community: true });
    // May include community mappings if available
}, "getGamepads({ community: true }) includes community mappings");

test(() => {
    // Test that "standard" always takes priority over "community"
}, "standard mappings take priority over community mappings");
```

**Documentation:**
- MDN: Update `Navigator.getGamepads()` documentation
- WebDev: Blog post about new feature
- Chromium: Release notes in changelog

**Risks:**
- **Low risk:** Opt-in design prevents breaking changes
- **Mitigation:** Extensive testing, gradual rollout via flag

**Timeline Estimate:**
- Implementation: 2-3 weeks
- Testing & review: 2-3 weeks
- Flag rollout: 1-2 milestones
- Stable release: M[next+3]

**Related Issues:**
- (Search existing Gamepad API issues)

**CC:**
- @chromium-gamepad-owners
- @blink-api-owners-gamepad

### Labels
- Type-Feature
- Blink-GamepadAPI
- Hotlist-Recharge (improves web gaming)

---

## Reference Implementation

See working implementation in this project:
- Native: SDL2 with gamecontrollerdb.txt loading
- JavaScript: Fallback mapping layer
- Architecture: 3-tier system (SDL → Database → Fallback)

**Key Files:**
- `src/native/gamepad_manager.cpp` - SDL database loading (line 61)
- `src/javascript/GamepadManager.js` - Mapping priority logic (line 68-70)
- `src/javascript/controllers/gamecontrollerdb.txt` - SDL database

**Proof of Concept:**
This project successfully uses SDL_GameControllerDB to support 2100+ controllers with `mapping: "standard"` in Node.js, demonstrating feasibility for browser implementation.

---

## FAQ

**Q: Does this change controllers that already work with `mapping: "standard"`?**
A: **No, absolutely not.** Controllers with `mapping: "standard"` are completely untouched. Community mappings are only consulted for controllers that currently have `mapping: ""`. This proposal only fills gaps, it doesn't change anything that already works.

**Q: Why not just add more "standard" mappings?**
A: Browser vendors require physical testing. Testing 2000+ controllers is impractical. Community mappings provide coverage without browser vendor burden.

**Q: Won't this break games that wrote custom mappings for `mapping: ""`?**
A: No. Default behavior is unchanged. Only games that opt-in with `{ community: true }` get community mappings.

**Q: What if SDL has a different mapping than Chrome for the same controller?**
A: Impossible. Chrome's "standard" mapping always takes priority. If Chrome has a built-in mapping, the SDL mapping is never consulted. There's no way for a community mapping to conflict with or override a "standard" mapping.

**Q: What if a community mapping is wrong?**
A: Report to SDL_GameControllerDB GitHub. Browsers update quarterly. "standard" mappings always override incorrect "community" mappings.

**Q: Why SDL_GameControllerDB specifically?**
A: Industry standard used by SDL2, Unity, Godot, UE4, and thousands of games. 20+ years of community maintenance.

**Q: Security implications?**
A: None. Static text mapping (button index → button index). No code execution, no network requests, no new fingerprinting surface.

**Q: Will this ever become default (non-opt-in)?**
A: Not in this proposal. Would require separate proposal after ecosystem validation (2-3 years).

---

## References

- W3C Gamepad API Spec: https://w3c.github.io/gamepad/
- SDL_GameControllerDB: https://github.com/mdqinc/SDL_GameControllerDB
- SDL2 Documentation: https://wiki.libsdl.org/CategoryGameController
- Chromium Gamepad Implementation: third_party/blink/renderer/modules/gamepad/

---

**Author:** Luis Montes (@monteslu)
**Date:** 2024-12-19
**License:** CC0 (Public Domain)
