import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../src/javascript/controllers/db.json');
const outputPath = path.join(__dirname, '../MAPPED_CONTROLLERS.md');

console.log('Reading controller databases...');
const controllers = JSON.parse(readFileSync(dbPath, 'utf-8'));

// Load SDL platform mappings
const sdlMappings = {
  darwin: [],
  linux: [],
  win32: []
};

['darwin', 'linux', 'win32'].forEach(platform => {
  const sdlPath = path.join(__dirname, `../src/javascript/controllers/sdl_mappings_${platform}.json`);
  try {
    sdlMappings[platform] = JSON.parse(readFileSync(sdlPath, 'utf-8'));
  } catch (err) {
    console.warn(`Could not load SDL mappings for ${platform}`);
  }
});

// Group by source
const bySource = {
  knulli: [],
  batocera: [],
  unknown: []
};

controllers.forEach(c => {
  if (c.fromDB === 'knulli') {
    bySource.knulli.push(c);
  } else if (c.fromDB === 'batocera') {
    bySource.batocera.push(c);
  } else {
    bySource.unknown.push(c);
  }
});

// Generate markdown
let md = `# Controllers with Guaranteed Standard Mapping

**ALL controllers get \`mapping: "standard"\` in gamepad-node!** This document lists the controllers with database mappings.

## Mapping Coverage Summary

gamepad-node provides \`mapping: "standard"\` through a **4-tier architecture**:

### Tier 1: SDL2 Built-in Database
- **~500 controllers** - Baked into SDL2 library
- Xbox, PlayStation, Switch Pro, and other popular controllers
- Automatic standard mapping, no configuration needed

### Tier 2: SDL_GameControllerDB (Community Database)
- **macOS**: ${sdlMappings.darwin.length} controllers
- **Linux**: ${sdlMappings.linux.length} controllers
- **Windows**: ${sdlMappings.win32.length} controllers
- Loaded automatically at startup based on platform
- Community-maintained database from https://github.com/mdqinc/SDL_GameControllerDB

### Tier 3: EmulationStation Database (Retro/Arcade Controllers)
- **${controllers.length} unique controllers** (listed below)
- **From Knulli**: ${bySource.knulli.length} controllers
- **From Batocera**: ${bySource.batocera.length} controllers
- Specialized retro gaming, arcade, and handheld controllers
- GPIO controllers, arcade IPAC boards, Wii remotes, etc.

### Tier 4: Intelligent Fallbacks
- Xbox 360 style (default)
- PlayStation 4 style (for Sony controllers)
- Covers everything else

**Total: ~2000+ controllers with guaranteed standard mapping!**

## Understanding Standard Mapping

The Gamepad API defines a **"standard" mapping** (W3C specification) with predictable button/axis indices:
- \`gamepad.mapping === "standard"\` → Buttons follow predictable layout (button 0 = A, button 1 = B, etc.)
- \`gamepad.mapping === ""\` → Raw hardware indices, unpredictable

**The Problem with Browsers:**
- Only ~20-30 recognized controllers get \`mapping: "standard"\`
- Unknown controllers get \`mapping: ""\` with random button indices
- Your game must implement per-controller configuration UI (bad UX)

**gamepad-node's Solution:**
Every controller gets \`mapping: "standard"\` through the 4-tier system above.

## Real-World Benefits

With \`mapping: "standard"\` guaranteed for ALL controllers:

- ✅ **No configuration UI needed** - Games work immediately with any controller
- ✅ **Arcade sticks** - Get standard layout instead of \`mapping: ""\` chaos
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

`;

// Function to generate table for a group of controllers
function generateTable(controllers, title) {
  if (controllers.length === 0) return '';

  let table = `## ${title}\n\n`;
  table += `| Controller Name | GUID | Inputs |\n`;
  table += `|----------------|----------------------------------|--------|\n`;

  // Sort by name
  const sorted = [...controllers].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach(c => {
    const name = c.name.replace(/\|/g, '\\|'); // Escape pipes in names
    const guid = c.guid.length > 32 ? c.guid.substring(0, 32) : c.guid; // Show full GUID (32 chars)
    const inputs = c.input.length;
    table += `| ${name} | \`${guid}\` | ${inputs} |\n`;
  });

  table += '\n';
  return table;
}

// Generate tables for each source
md += `## Tier 3: EmulationStation Database Controllers\n\n`;
md += `These ${controllers.length} controllers are from the EmulationStation retro gaming databases (Knulli and Batocera). They provide mappings for specialized hardware not found in SDL_GameControllerDB.\n\n`;
md += generateTable(bySource.knulli, `Knulli EmulationStation (${bySource.knulli.length} controllers)`);
md += generateTable(bySource.batocera, `Batocera EmulationStation (${bySource.batocera.length} controllers)`);
if (bySource.unknown.length > 0) {
  md += generateTable(bySource.unknown, 'Other Sources');
}

// Add fallback section
md += `---

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

\`\`\`bash
# Run the mapping test
npm run test:mapping

# Or use the interactive CLI tester
node bin/cli.js
\`\`\`

The test will show:
- ✅ Database mapping found (uses EmulationStation config)
- ⚠️ No database mapping (uses fallback)
- Controller type (SDL_GameController or SDL_Joystick)

## Adding New Controllers

To add support for a new controller:

1. Connect your controller
2. Run \`npm run test:mapping\` to get the GUID
3. Add an entry to \`src/javascript/controllers/db.json\`:

\`\`\`json
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
\`\`\`

4. Run this script to regenerate this document:

\`\`\`bash
node scripts/generate-controller-list.mjs
\`\`\`

Pull requests welcome!

---

*Generated from:*
- *SDL_GameControllerDB: ${sdlMappings.darwin.length + sdlMappings.linux.length + sdlMappings.win32.length} total mappings (${sdlMappings.darwin.length} macOS, ${sdlMappings.linux.length} Linux, ${sdlMappings.win32.length} Windows)*
- *EmulationStation: ${controllers.length} controller definitions (${bySource.knulli.length} Knulli, ${bySource.batocera.length} Batocera)*
- *Last updated: ${new Date().toISOString().split('T')[0]}*
`;

// Write output
writeFileSync(outputPath, md);
console.log(`✅ Generated ${outputPath}`);
console.log(`   SDL mappings: darwin=${sdlMappings.darwin.length}, linux=${sdlMappings.linux.length}, win32=${sdlMappings.win32.length}`);
console.log(`   EmulationStation controllers: ${controllers.length}`);
console.log(`   - Knulli: ${bySource.knulli.length}`);
console.log(`   - Batocera: ${bySource.batocera.length}`);
console.log(`   - Other: ${bySource.unknown.length}`);
