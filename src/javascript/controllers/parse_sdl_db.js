import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sdlDbPath = path.join(__dirname, 'gamecontrollerdb.txt');
const sdlText = fs.readFileSync(sdlDbPath, 'utf-8');

const platforms = {
  'Windows': [],
  'Mac OS X': [],
  'Linux': [],
  'iOS': [],
  'Android': []
};

let totalMappings = 0;

sdlText.split('\n').forEach(line => {
  line = line.trim();

  // Skip comments and empty lines
  if (!line || line.startsWith('#')) return;

  // SDL mapping format:
  // GUID,Name,mappings...,platform:PlatformName,
  const parts = line.split(',');
  if (parts.length < 3) return;

  const guid = parts[0];
  const name = parts[1];

  // Find platform
  let platform = null;
  for (const part of parts) {
    if (part.startsWith('platform:')) {
      platform = part.substring(9); // Remove "platform:"
      break;
    }
  }

  if (!platform || !platforms[platform]) {
    console.log('Unknown or missing platform:', platform, 'for', name);
    return;
  }

  // Store the full SDL mapping string (SDL can parse it directly)
  platforms[platform].push({
    guid,
    name,
    mapping: line
  });

  totalMappings++;
});

console.log('\nSDL_GameControllerDB Statistics:');
console.log('=================================');
console.log('Total mappings:', totalMappings);
console.log('\nBy platform:');
Object.keys(platforms).forEach(platform => {
  console.log(`  ${platform}: ${platforms[platform].length}`);
});

// Write platform-specific JSON files
const outputFiles = {
  'Windows': 'sdl_mappings_win32.json',
  'Mac OS X': 'sdl_mappings_darwin.json',
  'Linux': 'sdl_mappings_linux.json',
  'iOS': 'sdl_mappings_ios.json',
  'Android': 'sdl_mappings_android.json'
};

console.log('\nWriting platform-specific JSON files:');
Object.keys(outputFiles).forEach(platform => {
  const filename = outputFiles[platform];
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, JSON.stringify(platforms[platform], null, 2));
  console.log(`  ✓ ${filename} (${platforms[platform].length} controllers)`);
});

console.log('\n✅ SDL mapping JSON files created');
