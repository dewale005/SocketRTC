/** @type {import('eslint').Linter.Config} */
module.exports = [
  // Define language options (globals, parser options, and parser)
  {
    languageOptions: {
      globals: {
        browser: true,
        es2021: true,
      },
      parser: require('@typescript-eslint/parser'), // TypeScript parser
      parserOptions: {
        ecmaVersion: 12, // Specify ECMAScript version
        sourceType: 'module', // Use ES modules
        project: './tsconfig.eslint.json', // Path to TypeScript configuration
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'consistent-return': 'error',
      eqeqeq: 'warn',
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'), // TypeScript ESLint plugin
      prettier: require('eslint-plugin-prettier'), // Prettier plugin
    },
  },

  // Configuration for TypeScript files (TS/TSX)
  {
    files: ['*.ts', '*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },
];
