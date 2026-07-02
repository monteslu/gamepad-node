// Opt-in logging for gamepad-node.
//
// This library is imported deep inside host applications — including terminal renderers
// that own the screen, where ANY stray console write lands mid-frame and corrupts the
// display. So it is SILENT by default. Set GAMEPAD_NODE_DEBUG=1 to see controller
// connect/mapping detail (routed to stderr, so it never mixes with a host's stdout output).

const DEBUG = !!process.env.GAMEPAD_NODE_DEBUG;

export function debugLog(...args) {
  if (DEBUG) console.error('[gamepad-node]', ...args);
}

export function debugWarn(...args) {
  if (DEBUG) console.error('[gamepad-node]', ...args);
}
