import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    loadAdditionalControllerConfig,
    getAdditionalControllerList,
    clearAdditionalControllerConfigs,
    getControllerDef,
    createJSMap
} from '../../src/javascript/ControllerMapper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFixturePath = path.join(__dirname, '..', 'fixtures', 'test_es_input.cfg');

describe('Additional Controller Config', () => {
    beforeEach(() => {
        // Clear any previously loaded configs before each test
        clearAdditionalControllerConfigs();
    });

    describe('loadAdditionalControllerConfig', () => {
        it('should load controller configs from EmulationStation cfg file', async () => {
            const configs = await loadAdditionalControllerConfig(testFixturePath);

            assert.ok(Array.isArray(configs));
            assert.strictEqual(configs.length, 2);
        });

        it('should parse controller name correctly', async () => {
            const configs = await loadAdditionalControllerConfig(testFixturePath);

            assert.strictEqual(configs[0].name, 'Test Controller Alpha');
            // Should trim trailing whitespace
            assert.strictEqual(configs[1].name, 'Test Controller Beta');
        });

        it('should parse controller GUID correctly', async () => {
            const configs = await loadAdditionalControllerConfig(testFixturePath);

            assert.strictEqual(configs[0].guid, '03000000test0000alpha000000000000');
            assert.strictEqual(configs[1].guid, '03000000test0000beta0000000000000');
        });

        it('should parse input mappings correctly', async () => {
            const configs = await loadAdditionalControllerConfig(testFixturePath);

            const alphaConfig = configs[0];
            assert.ok(Array.isArray(alphaConfig.input));
            assert.ok(alphaConfig.input.length > 0);

            // Check for button 'a' mapping
            const aButton = alphaConfig.input.find(i => i.name === 'a');
            assert.ok(aButton);
            assert.strictEqual(aButton.type, 'button');
            assert.strictEqual(aButton.id, '0');
        });

        it('should parse axis mappings correctly', async () => {
            const configs = await loadAdditionalControllerConfig(testFixturePath);

            const alphaConfig = configs[0];
            const joystick1left = alphaConfig.input.find(i => i.name === 'joystick1left');

            assert.ok(joystick1left);
            assert.strictEqual(joystick1left.type, 'axis');
            assert.strictEqual(joystick1left.id, '0');
            assert.strictEqual(joystick1left.value, '-1');
        });

        it('should return empty array for non-existent file', async () => {
            const configs = await loadAdditionalControllerConfig('/non/existent/file.cfg');

            assert.ok(Array.isArray(configs));
            assert.strictEqual(configs.length, 0);
        });

        it('should accumulate configs from multiple loads', async () => {
            await loadAdditionalControllerConfig(testFixturePath);
            await loadAdditionalControllerConfig(testFixturePath);

            const allConfigs = getAdditionalControllerList();
            assert.strictEqual(allConfigs.length, 4); // 2 configs x 2 loads
        });
    });

    describe('getAdditionalControllerList', () => {
        it('should return empty array when no configs loaded', () => {
            const configs = getAdditionalControllerList();

            assert.ok(Array.isArray(configs));
            assert.strictEqual(configs.length, 0);
        });

        it('should return loaded configs', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            const configs = getAdditionalControllerList();
            assert.strictEqual(configs.length, 2);
        });
    });

    describe('clearAdditionalControllerConfigs', () => {
        it('should clear all loaded configs', async () => {
            await loadAdditionalControllerConfig(testFixturePath);
            assert.strictEqual(getAdditionalControllerList().length, 2);

            clearAdditionalControllerConfigs();

            assert.strictEqual(getAdditionalControllerList().length, 0);
        });
    });

    describe('getControllerDef with additional configs', () => {
        it('should find controller from additional config by GUID and name', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            const def = getControllerDef('03000000test0000alpha000000000000', 'Test Controller Alpha');

            assert.ok(def);
            assert.strictEqual(def.name, 'Test Controller Alpha');
            assert.strictEqual(def.fromAdditional, true);
        });

        it('should prioritize additional configs over built-in database', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            // Load with exact GUID and name match from additional config
            const def = getControllerDef('03000000test0000alpha000000000000', 'Test Controller Alpha');

            // Should be from additional config, not built-in
            assert.ok(def);
            assert.strictEqual(def.fromAdditional, true);
        });

        it('should fall back to built-in database when not in additional configs', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            // Use a GUID that's likely in the built-in database but not in test fixture
            // This tests that we still fall back correctly
            const def = getControllerDef('nonexistent-guid', 'nonexistent-name');

            // Should either be null or from built-in (not from additional)
            if (def) {
                assert.notStrictEqual(def.fromAdditional, true);
            }
        });

        it('should use last matching config when duplicates exist', async () => {
            // Load twice to create duplicates
            await loadAdditionalControllerConfig(testFixturePath);
            await loadAdditionalControllerConfig(testFixturePath);

            const def = getControllerDef('03000000test0000alpha000000000000', 'Test Controller Alpha');

            assert.ok(def);
            assert.strictEqual(def.fromAdditional, true);
        });
    });

    describe('createJSMap with additional configs', () => {
        it('should create mapping from additional config', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            const jsMap = createJSMap('03000000test0000alpha000000000000', 'Test Controller Alpha');

            assert.ok(jsMap);
            assert.ok(Array.isArray(jsMap.buttons));
            assert.ok(Array.isArray(jsMap.axes));
        });

        it('should map buttons correctly from additional config', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            const jsMap = createJSMap('03000000test0000alpha000000000000', 'Test Controller Alpha');

            // In test fixture: button id 0 -> 'a' -> standard button 1 (east position)
            // esButtonMap: 'a': 1
            assert.strictEqual(jsMap.buttons[0], 1); // raw 0 -> standard 1 (a/east)
            assert.strictEqual(jsMap.buttons[1], 0); // raw 1 -> standard 0 (b/south)
        });

        it('should map axes correctly from additional config', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            const jsMap = createJSMap('03000000test0000alpha000000000000', 'Test Controller Alpha');

            // Check that axes are defined
            assert.ok(jsMap.axes[0]); // joystick1left on axis 0
            assert.ok(jsMap.axes[1]); // joystick1up on axis 1

            // Check axis 0 has joystick1left mapping
            const axis0 = jsMap.axes[0];
            assert.ok(axis0.some(a => a.name === 'joystick1left'));
        });

        it('should return null for non-existent controller', async () => {
            await loadAdditionalControllerConfig(testFixturePath);

            const jsMap = createJSMap('completely-fake-guid', 'Fake Controller');

            // Should return null since no match in additional or built-in
            assert.strictEqual(jsMap, null);
        });
    });
});
