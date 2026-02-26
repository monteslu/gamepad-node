import defaultSdl from '@kmamal/sdl';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let sdl = defaultSdl;
const loadedInstances = new WeakSet();

function loadMappings(sdlInstance) {
    if (loadedInstances.has(sdlInstance)) return;
    const dbPath = path.join(__dirname, 'controllers', 'gamecontrollerdb.txt');
    try {
        const dbText = fs.readFileSync(dbPath, 'utf-8');
        const mappings = dbText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .filter(line => !line.includes(',crc:'));

        if (mappings.length > 0) {
            sdlInstance.controller.addMappings(mappings);
            console.log(`Loaded ${mappings.length} SDL controller mappings from gamecontrollerdb.txt`);
        }
    } catch (err) {
        console.warn('Failed to load SDL controller database:', err.message);
    }
    loadedInstances.add(sdlInstance);
}

// Load mappings for the default instance immediately
loadMappings(sdl);

export function setSdl(externalSdl) {
    sdl = externalSdl;
    loadMappings(sdl);
}

export function getSdl() {
    return sdl;
}

export default sdl;
