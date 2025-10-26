import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Download SDL first if not present
const sdlDir = path.join(rootDir, 'sdl');
if (!fs.existsSync(sdlDir)) {
	console.log('SDL not found, downloading...');
	execSync('node scripts/download-sdl.mjs', { cwd: rootDir, stdio: 'inherit' });
}

// Get SDL paths from our downloaded SDL
const SDL_INC = path.join(sdlDir, 'include');
const SDL_LIB = path.join(sdlDir, 'lib');

console.log('Building native addon...');
console.log(`SDL_INC=${SDL_INC}`);
console.log(`SDL_LIB=${SDL_LIB}`);

try {
	execSync('npx node-gyp rebuild', {
		cwd: rootDir,
		stdio: 'inherit',
		env: {
			...process.env,
			SDL_INC,
			SDL_LIB,
		}
	});

	// Copy SDL libraries to build directory
	console.log('Copying SDL libraries...');
	const buildLib = path.join(rootDir, 'build', 'Release');

	if (process.platform === 'darwin') {
		execSync(`cp -P ${SDL_LIB}/*.dylib ${buildLib}/ 2>/dev/null || true`, { cwd: rootDir });
	} else if (process.platform === 'linux') {
		execSync(`cp -P ${SDL_LIB}/*.so* ${buildLib}/ 2>/dev/null || true`, { cwd: rootDir });
	} else if (process.platform === 'win32') {
		execSync(`copy "${SDL_LIB}\\*.dll" "${buildLib}\\" 2>nul || echo.`, { cwd: rootDir, shell: 'cmd' });
	}

	console.log('Build completed successfully');
} catch (error) {
	console.error('Build failed:', error.message);
	process.exit(1);
}
