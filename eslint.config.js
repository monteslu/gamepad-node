export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                globalThis: 'readonly',
                performance: 'readonly',
                CustomEvent: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                navigator: 'readonly'  // Shimmed by installNavigatorShim()
            }
        },
        rules: {
            // Errors only - catch real problems
            'no-undef': 'error',
            'no-unused-vars': 'off',  // Low threshold - allow unused vars for 0.1.0
            'no-constant-condition': 'warn',
            'no-unreachable': 'warn',

            // No style rules - keep it simple
        }
    },
    {
        // Ignore patterns
        ignores: [
            'node_modules/',
            'sdl/',
            'tmp/',
            '*.min.js'
        ]
    }
];
