import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../src/javascript/controllers/db.json');
const sdlTxtPath = path.join(__dirname, '../src/javascript/controllers/gamecontrollerdb.txt');
const outputPath = path.join(__dirname, '../docs/MAPPED_CONTROLLERS.md');

console.log('Reading controller databases...');

// Parse gamecontrollerdb.txt to get all SDL mappings with platform info
function parseSDLTxt() {
  const content = readFileSync(sdlTxtPath, 'utf-8');
  const lines = content.split('\n');
  const controllers = new Map(); // guid+name -> {name, guid, platforms: Set}

  for (const line of lines) {
    if (!line || line.startsWith('#') || !line.includes(',')) continue;

    const parts = line.split(',');
    if (parts.length < 3) continue;

    const guid = parts[0];
    const name = parts[1];

    // Extract platform
    let platform = null;
    for (const part of parts) {
      if (part.startsWith('platform:')) {
        platform = part.split(':')[1].trim();
        break;
      }
    }

    if (!platform) continue;

    // Normalize platform names
    const platformMap = {
      'Windows': 'Windows',
      'Mac OS X': 'macOS',
      'Linux': 'Linux',
      'Android': 'Android'
    };
    platform = platformMap[platform] || platform;

    const key = `${guid}:${name}`;
    if (!controllers.has(key)) {
      controllers.set(key, {
        name,
        guid,
        platforms: new Set(),
        source: 'SDL_GameControllerDB'
      });
    }
    controllers.get(key).platforms.add(platform);
  }

  return Array.from(controllers.values());
}

const sdlControllers = parseSDLTxt();
console.log(`Parsed ${sdlControllers.length} unique controllers from gamecontrollerdb.txt`);

// Load EmulationStation database
const esControllers = JSON.parse(readFileSync(dbPath, 'utf-8'));

// Group EmulationStation by source
const bySource = {
  knulli: [],
  batocera: [],
  unknown: []
};

esControllers.forEach(c => {
  if (c.fromDB === 'knulli') {
    bySource.knulli.push(c);
  } else if (c.fromDB === 'batocera') {
    bySource.batocera.push(c);
  } else {
    bySource.unknown.push(c);
  }
});

// Generate markdown
let md = `# Complete Controller Database

**ALL controllers get \`mapping: "standard"\` in gamepad-node!**

This document shows the complete database of all controllers with mappings, including:
- SDL_GameControllerDB community mappings
- EmulationStation retro/arcade controller configs

## Database Statistics

- **SDL_GameControllerDB**: ${sdlControllers.length} unique controllers across all platforms
- **EmulationStation (Knulli)**: ${bySource.knulli.length} controllers
- **EmulationStation (Batocera)**: ${bySource.batocera.length} controllers
- **Total**: ${sdlControllers.length + esControllers.length} controller mappings

## Mapping Architecture

gamepad-node provides \`mapping: "standard"\` through a **4-tier architecture**:

### Tier 1: SDL2 Built-in Database
- **~500 controllers** - Baked into SDL2 library
- Xbox, PlayStation, Switch Pro, and other popular controllers
- Automatic standard mapping, no configuration needed

### Tier 2: SDL_GameControllerDB (Community Database)
- **${sdlControllers.length} unique controllers** (listed below)
- Community-maintained from https://github.com/mdqinc/SDL_GameControllerDB
- Platform-specific mappings (Windows, macOS, Linux, Android)
- Loaded automatically at startup based on your platform

### Tier 3: EmulationStation Database (Retro/Arcade)
- **${esControllers.length} controllers** (listed below)
- Specialized retro gaming, arcade, and handheld controllers
- GPIO controllers, arcade IPAC boards, Wii remotes, etc.

### Tier 4: Intelligent Fallbacks
- Xbox 360 style (default)
- PlayStation 4 style (for Sony controllers)
- Covers everything else

---

## SDL_GameControllerDB Mappings (${sdlControllers.length} controllers)

| Controller Name | GUID | Win | macOS | Linux | Android |
|----------------|----------------------------------|:---:|:-----:|:-----:|:-------:|
`;

// Sort SDL controllers by name
const sortedSDL = sdlControllers.sort((a, b) => a.name.localeCompare(b.name));

sortedSDL.forEach(c => {
  const name = c.name.replace(/\|/g, '\\|');
  const win = c.platforms.has('Windows') ? '✓' : '';
  const mac = c.platforms.has('macOS') ? '✓' : '';
  const linux = c.platforms.has('Linux') ? '✓' : '';
  const android = c.platforms.has('Android') ? '✓' : '';
  md += `| ${name} | \`${c.guid}\` | ${win} | ${mac} | ${linux} | ${android} |\n`;
});

md += `\n---\n\n`;

// EmulationStation section
md += `## EmulationStation Database (${esControllers.length} controllers)\n\n`;
md += `These controllers are from EmulationStation retro gaming databases. They provide mappings for specialized hardware not found in SDL_GameControllerDB.\n\n`;

// Knulli controllers
if (bySource.knulli.length > 0) {
  md += `### Knulli EmulationStation (${bySource.knulli.length} controllers)\n\n`;
  md += `| Controller Name | GUID | Inputs |\n`;
  md += `|----------------|----------------------------------|--------|\n`;

  const sortedKnulli = bySource.knulli.sort((a, b) => a.name.localeCompare(b.name));
  sortedKnulli.forEach(c => {
    const name = c.name.replace(/\|/g, '\\|');
    md += `| ${name} | \`${c.guid}\` | ${c.input.length} |\n`;
  });

  md += '\n';
}

// Batocera controllers
if (bySource.batocera.length > 0) {
  md += `### Batocera EmulationStation (${bySource.batocera.length} controllers)\n\n`;
  md += `| Controller Name | GUID | Inputs |\n`;
  md += `|----------------|----------------------------------|--------|\n`;

  const sortedBatocera = bySource.batocera.sort((a, b) => a.name.localeCompare(b.name));
  sortedBatocera.forEach(c => {
    const name = c.name.replace(/\|/g, '\\|');
    md += `| ${name} | \`${c.guid}\` | ${c.input.length} |\n`;
  });

  md += '\n';
}

// Fallback section
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

---

## Testing Your Controller

To see if your controller is recognized and properly mapped:

\`\`\`bash
# Run the mapping test
npm run test:mapping

# Or use the interactive CLI tester
node bin/cli.js
\`\`\`

## Adding New Controllers

To add support for a new controller to the EmulationStation database:

1. Connect your controller
2. Run \`npm run test:mapping\` to get the GUID
3. Add an entry to \`src/javascript/controllers/db.json\`
4. Run \`npm run docs:controllers\` to regenerate this document

Pull requests welcome!

---

*Generated from:*
- *SDL_GameControllerDB: ${sdlControllers.length} unique controllers*
- *EmulationStation: ${esControllers.length} controller definitions (${bySource.knulli.length} Knulli, ${bySource.batocera.length} Batocera)*
- *Last updated: ${new Date().toISOString().split('T')[0]}*
`;

// Write output
writeFileSync(outputPath, md);
console.log(`✅ Generated ${outputPath}`);
console.log(`   SDL_GameControllerDB: ${sdlControllers.length} unique controllers`);
console.log(`   EmulationStation: ${esControllers.length} controllers`);
console.log(`   - Knulli: ${bySource.knulli.length}`);
console.log(`   - Batocera: ${bySource.batocera.length}`);
console.log(`   - Other: ${bySource.unknown.length}`);
