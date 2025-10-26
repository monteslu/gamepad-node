import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building comprehensive SDL controller mappings...\n');

// Step 1: Build master database by GUID
// Structure: { guid: { darwin: "mapping", linux: "mapping", win32: "mapping" } }
console.log('Step 1: Parsing SDL_GameControllerDB for all platforms...');

const masterDB = {};
const sdlDbPath = path.join(__dirname, 'gamecontrollerdb.txt');
const sdlText = fs.readFileSync(sdlDbPath, 'utf-8');

const platformMap = {
  'Windows': 'win32',
  'Mac OS X': 'darwin',
  'Linux': 'linux',
  'iOS': 'darwin',      // Treat iOS as darwin
  'Android': 'linux'    // Treat Android as linux
};

let totalLines = 0;
sdlText.split('\n').forEach(line => {
  line = line.trim();

  // Skip comments and empty lines
  if (!line || line.startsWith('#')) return;

  // SDL mapping format: GUID,Name,mappings...,platform:PlatformName,
  const parts = line.split(',');
  if (parts.length < 3) return;

  const guid = parts[0];
  const name = parts[1];

  // Find platform
  let platform = null;
  for (const part of parts) {
    if (part.startsWith('platform:')) {
      platform = part.substring(9);
      break;
    }
  }

  // Map to our OS names
  const os = platformMap[platform];
  if (!os) {
    console.log(`  ⚠️  Unknown platform: ${platform} for ${name}`);
    return;
  }

  // Initialize GUID entry if doesn't exist
  if (!masterDB[guid]) {
    masterDB[guid] = {
      darwin: null,
      linux: null,
      win32: null,
      name: name
    };
  }

  // Store the mapping for this OS (if duplicate, last one wins)
  masterDB[guid][os] = line;
  masterDB[guid].name = name;

  totalLines++;
});

console.log(`  Processed ${totalLines} SDL mappings`);
console.log(`  Found ${Object.keys(masterDB).length} unique GUIDs\n`);

// Show statistics
const stats = { darwin: 0, linux: 0, win32: 0 };
for (const entry of Object.values(masterDB)) {
  if (entry.darwin) stats.darwin++;
  if (entry.linux) stats.linux++;
  if (entry.win32) stats.win32++;
}
console.log('  Mappings per platform:');
console.log(`    darwin: ${stats.darwin}`);
console.log(`    linux: ${stats.linux}`);
console.log(`    win32: ${stats.win32}\n`);

// Step 2: Build vendor/product index for generating synthetic mappings
console.log('Step 2: Building vendor/product index for cross-platform matching...\n');

const vendorProductIndex = {};

for (const [guid, entry] of Object.entries(masterDB)) {
  if (guid.length >= 20) {
    const vendorProduct = guid.substring(8, 20);
    if (!vendorProductIndex[vendorProduct]) {
      vendorProductIndex[vendorProduct] = {
        darwin: [],
        linux: [],
        win32: []
      };
    }

    // Track all GUIDs for this vendor/product across platforms
    if (entry.darwin) vendorProductIndex[vendorProduct].darwin.push({ guid, mapping: entry.darwin });
    if (entry.linux) vendorProductIndex[vendorProduct].linux.push({ guid, mapping: entry.linux });
    if (entry.win32) vendorProductIndex[vendorProduct].win32.push({ guid, mapping: entry.win32 });
  }
}

console.log(`  Found ${Object.keys(vendorProductIndex).length} unique vendor/product IDs\n`);

// Step 3: Generate platform-specific JSON files with fallback and synthetic mappings
console.log('Step 3: Generating comprehensive platform JSON files with vendor/product fallbacks...\n');

function generatePlatformJSON(platform, fallbackOrder) {
  const result = [];
  const seenGuids = new Set();

  for (const [guid, entry] of Object.entries(masterDB)) {
    // Try to find a mapping in priority order
    let selectedMapping = null;
    let selectedFrom = null;

    for (const os of fallbackOrder) {
      if (entry[os]) {
        selectedMapping = entry[os];
        selectedFrom = os;
        break;
      }
    }

    if (!selectedMapping) {
      console.log(`  ⚠️  No mapping found for GUID ${guid}, skipping`);
      continue;
    }

    // Parse name from mapping
    const parts = selectedMapping.split(',');
    const name = parts[1] || entry.name || 'Unknown';

    result.push({
      guid,
      name,
      mapping: selectedMapping,
      _source: selectedFrom  // For debugging
    });

    seenGuids.add(guid);
  }

  // Add synthetic mappings for vendor/product matches
  for (const [vendorProduct, platforms] of Object.entries(vendorProductIndex)) {
    // For each vendor/product, get a mapping from fallback order
    let sourceMapping = null;
    let sourceFrom = null;

    for (const os of fallbackOrder) {
      if (platforms[os] && platforms[os].length > 0) {
        sourceMapping = platforms[os][0].mapping; // Use first mapping
        sourceFrom = os;
        break;
      }
    }

    if (!sourceMapping) continue;

    // Generate synthetic mappings for ALL known GUIDs with this vendor/product
    for (const os of ['darwin', 'linux', 'win32']) {
      for (const item of platforms[os]) {
        if (!seenGuids.has(item.guid)) {
          // Parse source mapping to extract button layout
          const parts = sourceMapping.split(',');
          const buttonLayout = parts.slice(2).join(','); // Everything after name

          // Create synthetic mapping with this GUID but source button layout
          const syntheticMapping = `${item.guid},${parts[1]},${buttonLayout}`;

          result.push({
            guid: item.guid,
            name: parts[1],
            mapping: syntheticMapping,
            _source: sourceFrom + ' (synthetic)'
          });

          seenGuids.add(item.guid);
        }
      }
    }
  }

  return result;
}

// Generate darwin JSON
// Priority: darwin first, then linux, then win32
const darwinMappings = generatePlatformJSON('darwin', ['darwin', 'linux', 'win32']);
fs.writeFileSync(
  path.join(__dirname, 'sdl_mappings_darwin.json'),
  JSON.stringify(darwinMappings, null, 2)
);

const darwinSources = { darwin: 0, linux: 0, win32: 0 };
darwinMappings.forEach(m => darwinSources[m._source]++);
console.log(`  ✓ sdl_mappings_darwin.json (${darwinMappings.length} controllers)`);
console.log(`    darwin: ${darwinSources.darwin}, linux: ${darwinSources.linux}, win32: ${darwinSources.win32}`);

// Generate linux JSON
// Priority: linux first, then darwin, then win32
const linuxMappings = generatePlatformJSON('linux', ['linux', 'darwin', 'win32']);
fs.writeFileSync(
  path.join(__dirname, 'sdl_mappings_linux.json'),
  JSON.stringify(linuxMappings, null, 2)
);

const linuxSources = { darwin: 0, linux: 0, win32: 0 };
linuxMappings.forEach(m => linuxSources[m._source]++);
console.log(`\n  ✓ sdl_mappings_linux.json (${linuxMappings.length} controllers)`);
console.log(`    linux: ${linuxSources.linux}, darwin: ${linuxSources.darwin}, win32: ${linuxSources.win32}`);

// Generate win32 JSON
// Priority: win32 first, then linux, then darwin
const win32Mappings = generatePlatformJSON('win32', ['win32', 'linux', 'darwin']);
fs.writeFileSync(
  path.join(__dirname, 'sdl_mappings_win32.json'),
  JSON.stringify(win32Mappings, null, 2)
);

const win32Sources = { darwin: 0, linux: 0, win32: 0 };
win32Mappings.forEach(m => win32Sources[m._source]++);
console.log(`\n  ✓ sdl_mappings_win32.json (${win32Mappings.length} controllers)`);
console.log(`    win32: ${win32Sources.win32}, linux: ${win32Sources.linux}, darwin: ${win32Sources.darwin}`);

console.log('\n✅ Comprehensive SDL mapping JSON files created!');
console.log(`   Each platform file contains ALL ${Object.keys(masterDB).length} unique GUIDs`);
console.log('   with platform-specific mappings preferred and cross-platform fallbacks included.');
