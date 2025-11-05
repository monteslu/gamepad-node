import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load controller database
const controllerList = require('./controllers/db.json');

// EmulationStation button map (POSITIONAL, not label-based!)
// 'b' = south position, 'a' = east position, 'y' = west position, 'x' = north position
const esButtonMap = {
  'b': 0,  // South position
  'a': 1,  // East position
  'y': 2,  // West position
  'x': 3,  // North position
  'pageup': 4,
  'pagedown': 5,
  'l2': 6,
  'r2': 7,
  'select': 8,
  'start': 9,
  'l3': 10,
  'r3': 11,
  'up': 12,
  'down': 13,
  'left': 14,
  'right': 15,
  'hotkey': 16,
};

const AXIS_THRESHOLD = 0.11;

/**
 * Check if db.json has a mapping for this controller
 * Checks in priority order: GUID, name, vendor/product
 */
export function hasDbJsonMapping(guid, name) {
  if (!guid || !name) return false;

  // 1. Check GUID exact match
  const guidMatch = controllerList.find(c => c.guid === guid);
  if (guidMatch) return true;

  // 2. Check name match (fuzzy - contains)
  const nameMatch = controllerList.find(c => {
    return c.name.toLowerCase().includes(name.toLowerCase()) ||
           name.toLowerCase().includes(c.name.toLowerCase());
  });
  if (nameMatch) return true;

  // 3. Check vendor/product match (characters 8-19 of GUID)
  if (guid.length >= 20) {
    const vendorProduct = guid.substring(8, 20);
    const vpMatch = controllerList.find(c => {
      if (c.guid.length >= 20) {
        return c.guid.substring(8, 20) === vendorProduct;
      }
      return false;
    });
    if (vpMatch) return true;
  }

  return false;
}

/**
 * Find controller definition from database by GUID and name
 */
export function getControllerDef(guid, name) {
  name = ('' + name).trim();

  // 1. Check by GUID + name (most accurate)
  const matchedGuidAndName = controllerList.filter((c) =>
    c.guid === guid && c.name === name
  );

  if (matchedGuidAndName.length === 1) {
    return matchedGuidAndName[0];
  }

  // Multiple matches with same GUID and name - pick longest input list
  if (matchedGuidAndName.length > 1) {
    let def = matchedGuidAndName[0];
    for (const c of matchedGuidAndName) {
      if (c.input.length > def.input.length) {
        def = c;
      }
    }
    return def;
  }

  // 2. Check by GUID only
  const matchedGuids = controllerList.filter((c) => c.guid === guid);
  if (matchedGuids.length > 0) {
    let def = matchedGuids[0];
    for (const c of matchedGuids) {
      if (c.input.length > def.input.length) {
        def = c;
      }
    }
    return def;
  }

  // 3. Check by name only
  const matchedNames = controllerList.filter((c) => c.name === name);
  if (matchedNames.length > 0) {
    let def = matchedNames[0];
    for (const c of matchedNames) {
      if (c.input.length > def.input.length) {
        def = c;
      }
    }
    return def;
  }

  // 4. Check by vendor/product ID (characters 8-19 of GUID)
  if (guid && guid.length >= 20) {
    const vendorProduct = guid.substring(8, 20);
    const matchedVendorProduct = controllerList.filter((c) => {
      return c.guid && c.guid.length >= 20 && c.guid.substring(8, 20) === vendorProduct;
    });

    if (matchedVendorProduct.length > 0) {
      console.log(`Vendor/product match for ${guid}: using mapping from ${matchedVendorProduct[0].guid}`);
      let def = matchedVendorProduct[0];
      for (const c of matchedVendorProduct) {
        if (c.input.length > def.input.length) {
          def = c;
        }
      }
      return def;
    }
  }

  return null;
}

/**
 * Create button/axis mapping from controller definition
 */
export function createJSMap(guid, name) {
  const def = getControllerDef(guid, name);

  if (!def) {
    return null;
  }

  // Build button mapping array: buttons[rawSDLIndex] = standardIndex
  const buttons = Array(17).fill(100); // 100 = unmapped
  const axes = [];

  def.input.forEach((i) => {
    if (i.type === 'button') {
      const btnId = parseInt(i.id, 10);
      const btnStdId = esButtonMap[i.name];
      if (btnStdId !== undefined) {
        buttons[btnId] = btnStdId;
      }
    } else if (i.type === 'axis') {
      const id = parseInt(i.id, 10);
      if (!axes[id]) {
        axes[id] = [];
      }
      axes[id].push({
        id,
        name: i.name,
        value: parseInt(i.value, 10),
        multiplier: parseInt(i.value, 10) * -1,
      });
    }
  });

  return {
    buttons,
    axes,
    def
  };
}

/**
 * Apply button mapping to raw joystick button state
 */
export function mapButtons(rawButtons, mapping) {
  if (!rawButtons) return [];
  if (!mapping) return rawButtons;

  const standardButtons = Array(17).fill(null).map(() => ({ pressed: false, value: 0 }));

  rawButtons.forEach((pressed, rawIndex) => {
    const standardIndex = mapping.buttons[rawIndex];
    if (standardIndex !== undefined && standardIndex !== 100) {
      standardButtons[standardIndex] = {
        pressed: pressed,
        touched: pressed,
        value: pressed ? 1.0 : 0.0
      };
    }
  });

  return standardButtons;
}

/**
 * Apply axis mapping to raw joystick axes
 */
export function mapAxes(rawAxes, mapping, buttons) {
  if (!rawAxes) return [0, 0, 0, 0];
  if (!mapping || !mapping.axes) {
    return rawAxes.slice(0, 4); // Just return first 4 axes
  }

  const standardAxes = [0, 0, 0, 0]; // Left X, Left Y, Right X, Right Y

  rawAxes.forEach((value, axisIndex) => {
    const axisDefs = mapping.axes[axisIndex];
    if (!axisDefs) return;

    for (const axisDef of axisDefs) {
      const val = value * axisDef.multiplier;

      // For D-pad axes with direction specifiers (+/-), only process if raw value matches direction
      const isDpadAxis = ['dpleft', 'dpright', 'dpup', 'dpdown'].includes(axisDef.name);
      if (isDpadAxis && axisDef.value !== undefined) {
        // Check if raw axis value matches the expected direction
        if (axisDef.value < 0 && value >= 0) continue; // Expects negative, got positive/zero
        if (axisDef.value > 0 && value <= 0) continue; // Expects positive, got negative/zero
      }

      switch (axisDef.name) {
        case 'joystick1left':
        case 'leftx':
          standardAxes[0] = val;
          break;
        case 'joystick1up':
        case 'lefty':
          standardAxes[1] = val;
          break;
        case 'joystick2left':
        case 'rightx':
          standardAxes[2] = val;
          break;
        case 'joystick2up':
        case 'righty':
          standardAxes[3] = val;
          break;
        case 'l2':
        case 'lefttrigger':
          // Trigger as axis
          if (buttons && buttons[6]) {
            buttons[6].value = (val + 1) / 2;
            buttons[6].pressed = buttons[6].value > AXIS_THRESHOLD;
          }
          break;
        case 'r2':
        case 'righttrigger':
          // Trigger as axis
          if (buttons && buttons[7]) {
            buttons[7].value = (val + 1) / 2;
            buttons[7].pressed = buttons[7].value > AXIS_THRESHOLD;
          }
          break;
        case 'left':
        case 'dpleft':
          if (buttons) {
            buttons[14].pressed = Math.abs(val) > AXIS_THRESHOLD;
          }
          break;
        case 'right':
        case 'dpright':
          if (buttons) {
            buttons[15].pressed = Math.abs(val) > AXIS_THRESHOLD;
          }
          break;
        case 'up':
        case 'dpup':
          if (buttons) {
            buttons[12].pressed = Math.abs(val) > AXIS_THRESHOLD;
          }
          break;
        case 'down':
        case 'dpdown':
          if (buttons) {
            buttons[13].pressed = Math.abs(val) > AXIS_THRESHOLD;
          }
          break;
      }
    }
  });

  return standardAxes;
}

/**
 * Fallback mappings for common controllers that SDL doesn't recognize
 */
export const fallbackMappings = {
  // Xbox 360 pad knockoffs
  xbox360: {
    buttons: [
      0, // A
      1, // B
      2, // X
      3, // Y
      4, // LB
      5, // RB
      8, // SELECT (raw 6)
      9, // START (raw 7)
      16, // GUIDE (raw 8)
      10, // L3 (raw 9)
      11, // R3 (raw 10)
    ],
    axes: {
      0: [{ name: 'joystick1left', multiplier: 1 }],
      1: [{ name: 'joystick1up', multiplier: 1 }],
      2: [{ name: 'l2', multiplier: 1 }],
      3: [{ name: 'joystick2left', multiplier: 1 }],
      4: [{ name: 'joystick2up', multiplier: 1 }],
      5: [{ name: 'r2', multiplier: 1 }],
    }
  },
  // Sony PS4 DualShock 4
  ps4: {
    buttons: [
      0, // Cross (A)
      1, // Circle (B)
      3, // Triangle (Y) - note: swapped
      2, // Square (X) - note: swapped
      4, // L1
      5, // R1
      100, // unmapped
      100, // unmapped
      8, // Share
      9, // Options
      16, // PS button
      10, // L3
      11, // R3
    ],
    axes: {
      0: [{ name: 'joystick1left', multiplier: 1 }],
      1: [{ name: 'joystick1up', multiplier: 1 }],
      2: [{ name: 'l2', multiplier: 1 }],
      3: [{ name: 'joystick2left', multiplier: 1 }],
      4: [{ name: 'joystick2up', multiplier: 1 }],
      5: [{ name: 'r2', multiplier: 1 }],
    }
  }
};

/**
 * Get fallback mapping for common controllers
 */
export function getFallbackMapping(name) {
  const lcName = String(name).toLowerCase();

  if (lcName.includes('sony') || lcName.includes('ps4') || lcName.includes('dualshock')) {
    return fallbackMappings.ps4;
  }

  // Default to Xbox 360 style
  return fallbackMappings.xbox360;
}
