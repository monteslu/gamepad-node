# Web Gamepad API Community Mappings - Submission Guide

This guide provides ready-to-send emails and posts for submitting the community mappings proposal to W3C, WICG, and Chromium.

---

## Step 1: WICG Discourse (Start Here)

**Why start here:** WICG (Web Incubator Community Group) is where new web platform ideas get initial discussion before formal W3C proposals.

**URL:** https://discourse.wicg.io/
**Category:** New Topic → Web Platform

### WICG Post (Copy/Paste Ready)

**Title:**
```
[Proposal] Gamepad API: Opt-in Community Controller Mappings
```

**Body:**
```markdown
Hi everyone,

I'd like to propose an extension to the Gamepad API that would expand controller support from ~20-30 to 2100+ controllers while maintaining 100% backwards compatibility.

## The Problem

The current Gamepad API has a significant coverage gap:
- `mapping: "standard"` - Only ~20-30 browser-tested controllers
- `mapping: ""` - Everything else (unpredictable button layouts)

*These are the ONLY two values that exist in the current spec.*

This forces game developers to implement custom per-controller configuration UIs or limit their games to "Xbox controller required."

## The Proposal

Add **opt-in** support for community-maintained controller mappings from SDL_GameControllerDB.

Note: This proposal only affects controllers that currently have `mapping: ""`. Controllers with `mapping: "standard"` are completely untouched.

```javascript
// Default: current behavior (100% backwards compatible)
navigator.getGamepads()
// Returns: mapping is ONLY "standard" or ""

// Opt-in: include community mappings
navigator.getGamepads({ community: true })
// Returns: mapping can be "standard", "community", or ""
// "community" ONLY appears for controllers that would otherwise be ""
```

**Behavior:**
| Controller | Without option | With `{ community: true }` |
|-----------|---------------|---------------------------|
| Xbox | `"standard"` | `"standard"` (unchanged) |
| 8BitDo (in SDL DB) | `""` | `"community"` (upgraded!) |

## Key Design Principles

1. **100% Backwards Compatible** - Default behavior unchanged, opt-in only
2. **Priority Guarantee** - Browser-tested "standard" mappings always override "community"
3. **Zero Maintenance** - Community maintains SDL_GameControllerDB, not browser vendors
4. **Clear Disclaimer** - "community" = community-tested, not browser-tested

## Data Source

[SDL_GameControllerDB](https://github.com/mdqinc/SDL_GameControllerDB)
- 2,134 controller mappings
- ~500KB text file
- Used by SDL2, Unity, Godot, Unreal Engine
- 20+ years of community maintenance

## Benefits

**For Developers:**
- 2100+ usable controllers instead of ~20-30
- No need for custom configuration UIs
- Better out-of-box experience

**For Browser Vendors:**
- No physical testing required
- No maintenance burden
- Doesn't weaken "standard" quality bar

**For Users:**
- More controllers work out of the box
- Better gaming experience

## Implementation Impact

- Binary size: ~500KB (one-time)
- Performance: Negligible (one-time parse)
- Security: None (static mapping data)
- Fingerprinting: None (no new data exposed)

## Example Usage

```javascript
const gamepad = navigator.getGamepads({ community: true })[0];

if (gamepad.mapping === "standard" || gamepad.mapping === "community") {
    // Works for 2100+ controllers!
    if (gamepad.buttons[0].pressed) jump();
} else {
    // Only truly unknown controllers need config
    showControllerConfigScreen();
}
```

## Reference Implementation

I've built a working implementation in Node.js using SDL2 + gamecontrollerdb.txt:
https://github.com/monteslu/gamepad-node

The project successfully supports 2100+ controllers with standardized button mappings, demonstrating feasibility.

## Full Proposal

Complete technical specification with WebIDL, implementation plan, and Chromium integration details:
[Link to web_gamepad_api_suggestions.md in your repo]

## Questions for Discussion

1. Is the opt-in approach the right design?
2. Should we support other community databases beyond SDL?
3. What's the right update cadence for community mappings?

Looking forward to feedback!

---

**Related Links:**
- W3C Gamepad API Spec: https://w3c.github.io/gamepad/
- SDL_GameControllerDB: https://github.com/mdqinc/SDL_GameControllerDB
- Reference Implementation: https://github.com/monteslu/gamepad-node

**Author:** Luis Montes
**Contact:** [Your email or GitHub @monteslu]
```

**After posting:**
- Monitor responses for 1-2 weeks
- Address concerns and iterate
- If positive reception, proceed to W3C and Chromium

---

## Step 2: Chromium Bug Report

**Why:** Get Chromium's attention and gauge implementation interest.

**URL:** https://bugs.chromium.org/p/chromium/issues/entry
**Component:** Blink>GamepadAPI

### Chromium Bug (Copy/Paste Ready)

**Summary:**
```
[Feature Request] Add opt-in support for SDL_GameControllerDB community controller mappings
```

**Component:**
```
Blink>GamepadAPI
```

**Type:**
```
Feature
```

**Priority:**
```
P3
```

**Description:**
```
## Summary

Add opt-in support for community-maintained controller mappings (SDL_GameControllerDB) to expand gamepad support from ~20-30 controllers to 2100+ controllers.

Note: This proposal only affects controllers that currently have `mapping: ""`. Controllers with `mapping: "standard"` are completely untouched.

## Current Limitation

The Gamepad API currently only provides `mapping: "standard"` for ~20-30 Chrome-tested controllers. All other controllers get `mapping: ""` with unpredictable button layouts.

*Note: These are the ONLY two values that exist in the current W3C spec.*

Impact:
- Game developers must implement custom per-controller configuration UIs
- Many controllers are unusable without workarounds
- Web gaming limited to "Xbox controller required"

## Proposed Solution

Extend `navigator.getGamepads()` with an optional parameter:

```javascript
// Default: current behavior (backwards compatible)
navigator.getGamepads()

// Opt-in: include SDL_GameControllerDB mappings
navigator.getGamepads({ community: true })
```

Mapping priority:
1. "standard" - Chrome-tested (unchanged, highest priority)
2. "community" - SDL_GameControllerDB mapping (new, opt-in only)
3. "" - Unknown

## Implementation Overview

1. Bundle SDL_GameControllerDB (~500KB text)
   - Source: https://github.com/mdqinc/SDL_GameControllerDB
   - 2,134 controller mappings
   - Platform filtering (Windows/macOS/Linux/Android)

2. Extend Navigator.getGamepads() with options parameter

3. Ensure Chrome-tested "standard" mappings always override "community"

## Backwards Compatibility

 Default behavior unchanged (no breaking changes)
 Existing games work identically
 Community mappings never override Chrome-tested "standard" mappings
 Opt-in allows gradual adoption

## Benefits

- Game developers get 2100+ usable controllers instead of ~20-30
- Zero maintenance burden (community maintains database)
- No physical testing required
- Clear disclaimer (community-tested vs Chrome-tested)

## Similar Implementations

- SDL2 (C++) - Uses SDL_GameControllerDB natively
- Unity - Loads SDL mappings for gamepad support
- Godot Engine - Uses SDL_GameControllerDB

## Reference Implementation

Working Node.js implementation demonstrating feasibility:
https://github.com/monteslu/gamepad-node

## Full Proposal

Complete technical specification with WebIDL and implementation details:
[Link to web_gamepad_api_suggestions.md in your repo]

## WICG Discussion

Initial community discussion: [Link to WICG Discourse thread once posted]

## Estimated Implementation Timeline

- Implementation: 2-3 weeks
- Testing & review: 2-3 weeks
- Flag rollout: 1-2 milestones
- Stable release: ~3 milestones

## Size Impact

- Binary size: ~500KB (compressed text)
- Memory: Loaded on-demand
- Performance: Negligible

## Request

Would appreciate Chrome team's feedback on:
1. Is this the right approach?
2. Any concerns with bundling SDL_GameControllerDB?
3. Interest in reviewing an implementation CL?

Happy to provide more details or answer questions.

Thanks!
```

**Labels to add:**
- Type-Feature
- Blink-GamepadAPI
- Hotlist-Recharge

---

## Step 3: W3C WebApps Working Group

**Why:** Official standards body for Gamepad API

**URL:** https://lists.w3.org/Archives/Public/public-webapps/
**Subscribe first:** Send email to public-webapps-request@w3.org with subject "subscribe"

### W3C Email (Copy/Paste Ready)

**To:** public-webapps@w3.org
**Subject:** [Gamepad API] Proposal: Opt-in Community Controller Mappings

**Body:**
```
Hello WebApps WG,

I'd like to propose an extension to the Gamepad API specification to address a significant gap in controller support.

## Background

The current Gamepad API provides `mapping: "standard"` for only ~20-30 browser-tested controllers. All other controllers receive `mapping: ""` with unpredictable button layouts, forcing developers to implement custom per-controller configuration UIs.

## Proposal

Add opt-in support for community-maintained controller mappings from SDL_GameControllerDB:

```javascript
// Default: current behavior (100% backwards compatible)
navigator.getGamepads()

// Opt-in: include community mappings
navigator.getGamepads({ community: true })
```

## Key Design Principles

1. 100% Backwards Compatible - Default behavior unchanged
2. Priority Guarantee - Browser-tested "standard" always overrides "community"
3. Zero Vendor Maintenance - Community maintains the database
4. Clear Quality Levels - "standard" vs "community" vs ""

## Specification Changes

### WebIDL

```webidl
dictionary GamepadOptions {
    boolean community = false;
};

partial interface Navigator {
    sequence<Gamepad?> getGamepads(optional GamepadOptions options = {});
};

partial interface Gamepad {
    readonly attribute DOMString mapping;
    // Values: "standard" | "community" | ""
};
```

### Normative Text

The `mapping` attribute MUST be set according to the following priority:

1. If the user agent has a built-in mapping for the device, set to "standard"
2. Else, if the options.community is true and a community mapping exists, set to "community"
3. Else, set to "" (empty string)

Community mappings MUST NOT override built-in "standard" mappings.

## Implementation

Data source: SDL_GameControllerDB (https://github.com/mdqinc/SDL_GameControllerDB)
- 2,134 controller mappings (~500KB)
- Used by SDL2, Unity, Godot, Unreal Engine
- 20+ years of community maintenance

## Benefits

- Developers: 2100+ usable controllers instead of ~20-30
- Vendors: No testing/maintenance burden
- Users: More controllers work out of the box

## Security & Privacy

No new fingerprinting surface (controller GUID/name already exposed).
Static mapping data only (button index → button index).

## Community Discussion

WICG Discourse: [Link once posted]
Chromium Issue: [Link once filed]

## Reference Implementation

Working implementation in Node.js demonstrating feasibility:
https://github.com/monteslu/gamepad-node

## Full Proposal

Complete technical specification:
[Link to web_gamepad_api_suggestions.md in your repo]

## Request for Feedback

1. Is this the right approach for addressing the coverage gap?
2. Any concerns with the opt-in design?
3. Should this go through WICG incubation first?
4. Interest from implementers (Chrome, Firefox, Safari)?

I'm happy to work on a formal spec PR if there's interest.

Best regards,
Luis Montes
@monteslu

---
GitHub: https://github.com/monteslu
Project: https://github.com/monteslu/gamepad-node
```

---

## Step 4: Mozilla Standards Position

**Why:** Get Firefox team's input

**URL:** https://github.com/mozilla/standards-positions/issues/new

**Title:**
```
Gamepad API: Community Controller Mappings Extension
```

**Body:**
```markdown
## Summary

Extend the Gamepad API with opt-in support for community-maintained controller mappings (SDL_GameControllerDB), expanding coverage from ~20-30 to 2100+ controllers.

## Specification

Proposed extension to W3C Gamepad API:
[Link to web_gamepad_api_suggestions.md]

## Key Changes

```javascript
// New opt-in parameter
navigator.getGamepads({ community: true })
```

Mapping values:
- `"standard"` - Browser-tested (unchanged)
- `"community"` - SDL_GameControllerDB (new, opt-in only)
- `""` - Unknown

## Rationale

Current API only provides `mapping: "standard"` for ~20-30 controllers. This proposal adds 2100+ community-tested mappings while:
- Maintaining 100% backwards compatibility
- Preserving browser-tested "standard" quality bar
- Requiring zero maintenance from browser vendors

## Implementation

Bundle SDL_GameControllerDB (~500KB):
https://github.com/mdqinc/SDL_GameControllerDB

## Reference Implementation

Working implementation in Node.js:
https://github.com/monteslu/gamepad-node

## Community Discussion

- WICG: [Link once posted]
- Chromium: [Link once filed]
- W3C WebApps: [Link once posted]

## Request

Mozilla's position on:
1. The overall approach (opt-in community mappings)
2. Bundling SDL_GameControllerDB in browsers
3. New "community" mapping value
4. Interest in implementation

## Links

- W3C Gamepad API: https://w3c.github.io/gamepad/
- SDL_GameControllerDB: https://github.com/mdqinc/SDL_GameControllerDB
```

**Labels:**
- topic: gaming
- venue: W3C

---

## Step 5: WebKit Standards Position

**Why:** Get Safari team's input

**URL:** https://github.com/WebKit/standards-positions/issues/new

**Title:**
```
Gamepad API: Community Controller Mappings Extension
```

**Body:**
```markdown
## Request for Position

**Title:** Gamepad API: Community Controller Mappings Extension
**Venue:** W3C WebApps WG
**Specification:** [Link to web_gamepad_api_suggestions.md]

## Summary

Extend the Gamepad API with opt-in support for community-maintained controller mappings, expanding coverage from ~20-30 to 2100+ controllers.

## Proposal

```javascript
navigator.getGamepads({ community: true })
```

Returns gamepads with mapping values:
- `"standard"` - Browser-tested (unchanged, highest priority)
- `"community"` - SDL_GameControllerDB (new, opt-in only)
- `""` - Unknown

## Key Features

- 100% backwards compatible (opt-in only)
- Browser-tested "standard" always overrides "community"
- Zero maintenance burden (community maintains database)
- ~500KB bundle size (SDL_GameControllerDB)

## Use Case

Game developers currently face ~20-30 supported controllers with `mapping: "standard"`. All others get `mapping: ""` requiring custom configuration UIs. This proposal enables 2100+ controllers to work out-of-box.

## Data Source

SDL_GameControllerDB: https://github.com/mdqinc/SDL_GameControllerDB
- Industry standard (used by SDL2, Unity, Godot)
- 20+ years of community maintenance
- 2,134 controller mappings

## Reference Implementation

Node.js implementation: https://github.com/monteslu/gamepad-node

## Related Discussions

- WICG: [Link]
- Chromium: [Link]
- Mozilla: [Link]
- W3C WebApps: [Link]

## Questions

1. WebKit's position on bundling community controller databases?
2. Concerns with the opt-in approach?
3. Interest in implementation?

Thank you for your consideration.
```

---

## Recommended Submission Order

1. **WICG Discourse** (Week 1)
   - Post and gather initial feedback
   - Iterate on design based on discussion
   - Build community support

2. **Chromium Bug** (Week 2)
   - File after positive WICG reception
   - Link to WICG discussion
   - Gauge implementation interest

3. **Mozilla Standards Position** (Week 2-3)
   - File concurrently with Chromium
   - Link to both WICG and Chromium

4. **WebKit Standards Position** (Week 2-3)
   - File concurrently
   - Coordinate cross-browser feedback

5. **W3C WebApps** (Week 3-4)
   - Post after community discussion settles
   - Include links to all feedback
   - Propose spec PR if positive reception

---

## Tips for Success

### Do's
-  Emphasize backwards compatibility
-  Show reference implementation
-  Acknowledge browser vendor concerns
-  Be responsive to feedback
-  Keep technical and factual
-  Link between discussions

### Don'ts
-  Don't push too hard initially
-  Don't ignore valid concerns
-  Don't claim "browsers are wrong"
-  Don't spam multiple venues at once
-  Don't get defensive

### Response Templates

**If asked "Does this change controllers that already work?"**
```
No, absolutely not. Controllers with mapping: "standard" are completely
untouched. The community database is ONLY consulted for controllers that
currently have mapping: "" (empty string).

Think of it this way:
- Xbox controller: "standard" → still "standard" (no change)
- 8BitDo (unknown): "" → "community" (upgraded!)

There's no way for this to affect working controllers because the check
for "standard" mappings happens FIRST. If Chrome already knows about
a controller, the SDL database isn't even consulted.
```

**If asked "Why not just add more standard mappings?"**
```
Great question! Browser vendors require physical testing for "standard"
mappings, which is impractical for 2000+ controllers. This proposal:
1. Preserves "standard" quality bar (no dilution)
2. Adds opt-in "community" tier for untested mappings
3. Gives developers choice: high-quality (20-30) vs broad-coverage (2100+)
```

**If concerned about security:**
```
Understood. Security analysis:
- No new fingerprinting (GUID/name already exposed)
- Static data only (button index mappings)
- No code execution
- Opt-in prevents unexpected behavior
- Can be disabled via enterprise policy
```

**If concerned about maintenance:**
```
That's exactly why we use SDL_GameControllerDB:
- Community maintains it (not browser vendors)
- 20+ years of proven maintenance
- Used by SDL2, Unity, Godot (billions of users)
- Quarterly browser updates (automatic)
- Vendors only review/merge, don't create mappings
```

---

## Success Metrics

**Short term (3 months):**
- [ ] Positive WICG discussion
- [ ] Chromium engineer engagement
- [ ] Mozilla/WebKit positions filed
- [ ] No major blockers identified

**Medium term (6-12 months):**
- [ ] Spec PR accepted (or incubation agreed)
- [ ] At least one browser commits to implementation
- [ ] Web Incubator CG adoption
- [ ] Game engine interest (Phaser, Three.js)

**Long term (1-2 years):**
- [ ] Implementation in Chrome/Firefox
- [ ] Web Platform Tests written
- [ ] MDN documentation
- [ ] Game engines adopt `{ community: true }`

---

## Fallback Plan

If browsers resist bundling SDL_GameControllerDB:

**Alternative: Loader API**
```javascript
// Browser provides API, developers load database
await navigator.gamepad.loadCommunityMappings(
    'https://cdn.example.com/gamecontrollerdb.txt'
);
```

This addresses:
- Bundle size concerns (developer chooses)
- Update frequency concerns (developer controls)
- Privacy concerns (explicit opt-in)

But loses:
- Out-of-box support
- Consistency across sites
- Ease of use

---

## Contact Information

**Project:** https://github.com/monteslu/gamepad-node
**Author:** Luis Montes (@monteslu)
**Email:** [Your email]

Feel free to reach out with questions or for clarification on any part of the proposal.

---

## Next Steps

1. Review and customize these templates with your contact info
2. Post to WICG Discourse first
3. Monitor discussion for 1-2 weeks
4. File browser positions based on reception
5. Iterate and refine based on feedback

Good luck! This is a solid proposal with real implementation backing it. 
