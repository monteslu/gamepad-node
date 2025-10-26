import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import https from 'https';
import { extract } from 'tar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version;

// Detect platform
function getPlatform() {
	const platform = process.platform;
	const arch = process.arch;

	if (platform === 'darwin' && arch === 'x64') return 'darwin-x64';
	if (platform === 'darwin' && arch === 'arm64') return 'darwin-arm64';
	if (platform === 'linux' && arch === 'x64') return 'linux-x64';
	if (platform === 'linux' && arch === 'arm64') return 'linux-arm64';
	if (platform === 'win32' && arch === 'x64') return 'win32-x64';

	return null;
}

// Download file from URL
function downloadFile(url) {
	return new Promise((resolve, reject) => {
		https.get(url, { headers: { 'User-Agent': 'gamepad-node-installer' } }, (response) => {
			if (response.statusCode === 302 || response.statusCode === 301) {
				// Follow redirect
				downloadFile(response.headers.location).then(resolve).catch(reject);
				return;
			}

			if (response.statusCode !== 200) {
				reject(new Error(`Failed to download: ${response.statusCode}`));
				return;
			}

			const chunks = [];
			response.on('data', (chunk) => chunks.push(chunk));
			response.on('end', () => resolve(Buffer.concat(chunks)));
			response.on('error', reject);
		}).on('error', reject);
	});
}

// Try to download prebuilt binary
async function tryDownloadPrebuilt() {
	const platform = getPlatform();
	if (!platform) {
		console.log('Unsupported platform, building from source...');
		return false;
	}

	const assetName = `gamepad-node-v${version}-${platform}.tar.gz`;
	const url = `https://github.com/monteslu/gamepad-node/releases/download/v${version}/${assetName}`;
	console.log(`Attempting to download prebuilt binary for ${platform}...`);

	try {
		const buffer = await downloadFile(url);

		// Extract to build/Release
		const buildDir = path.join(rootDir, 'build', 'Release');
		fs.mkdirSync(buildDir, { recursive: true });

		// Save tarball temporarily
		const tmpFile = path.join(rootDir, 'tmp.tar.gz');
		fs.writeFileSync(tmpFile, buffer);

		// Extract
		await extract({
			file: tmpFile,
			cwd: buildDir,
		});

		// Clean up
		fs.unlinkSync(tmpFile);

		console.log('✓ Prebuilt binary installed successfully');
		return true;
	} catch (error) {
		console.log('Prebuilt binary not available:', error.message);
		return false;
	}
}

async function main() {
	// Check if build directory exists
	const buildDir = path.join(rootDir, 'build', 'Release');
	if (fs.existsSync(path.join(buildDir, 'gamepad_native.node'))) {
		console.log('Native addon already built');
		return;
	}

	// Try to download prebuilt binary
	const downloaded = await tryDownloadPrebuilt();

	if (!downloaded) {
		console.log('Building from source...');
		execSync('node scripts/build.mjs', { cwd: rootDir, stdio: 'inherit' });
	}
}

main().catch((error) => {
	console.error('Installation failed:', error);
	process.exit(1);
});
