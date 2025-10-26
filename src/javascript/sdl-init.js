import sdl from '@kmamal/sdl';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load SDL mappings from gamecontrollerdb.txt BEFORE any device enumeration
const dbPath = path.join(__dirname, 'controllers', 'gamecontrollerdb.txt');

try {
    const dbText = fs.readFileSync(dbPath, 'utf-8');
    const mappings = dbText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // Skip empty lines and comments

    if (mappings.length > 0) {
        sdl.controller.addMappings(mappings);
        console.log(`Loaded ${mappings.length} SDL controller mappings from gamecontrollerdb.txt`);
    }
} catch (err) {
    console.warn('Failed to load SDL controller database:', err.message);
}

export default sdl;
