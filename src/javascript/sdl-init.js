import defaultSdl from '@kmamal/sdl';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let sdl = defaultSdl;
const loadedInstances = new WeakSet();

// Opt-in logging. By default this module is silent: it's imported deep inside host apps
// (e.g. terminal renderers) where a stray console.log lands mid-frame and corrupts the
// display. Set GAMEPAD_NODE_DEBUG=1 to see mapping-load + error detail.
const DEBUG = !!process.env.GAMEPAD_NODE_DEBUG;

// Fields SDL's mapping parser doesn't understand and warns about ("SDL silent error:
// Unexpected controller element <field>") — strip them so the DB loads cleanly. crc/platform
// are metadata the modern community db carries; SDL 2.x doesn't need them for the mapping.
const UNSUPPORTED_FIELDS = /,(crc|platform|hint|type):[^,]*/g;

function loadMappings(sdlInstance) {
    if (loadedInstances.has(sdlInstance)) return;
    // Mark BEFORE loading so a re-entrant/duplicate call can't reload (and re-log).
    loadedInstances.add(sdlInstance);
    const dbPath = path.join(__dirname, 'controllers', 'gamecontrollerdb.txt');
    try {
        const dbText = fs.readFileSync(dbPath, 'utf-8');
        const mappings = dbText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.replace(UNSUPPORTED_FIELDS, ''));

        if (mappings.length > 0) {
            sdlInstance.controller.addMappings(mappings);
            if (DEBUG) console.error(`[gamepad-node] loaded ${mappings.length} controller mappings`);
        }
    } catch (err) {
        if (DEBUG) console.error('[gamepad-node] failed to load controller database:', err.message);
    }
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
