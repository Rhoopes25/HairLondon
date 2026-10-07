import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const BROWSER_GLOBALS_IN_SRC = [
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'navigator',
  'location',
  'history',
  'alert',
  'confirm',
].map((name) => ({
  name,
  message: 'src/ is backend-shaped: no browser globals. Put browser code in app/ and inject it.',
}));

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'md', 'hair-by-london-design-system'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },

  // ---------- app/: frontend ----------
  {
    files: ['app/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      // Host and environment details must go through app/config.ts.
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'Only app/config.ts may read import.meta.env. Import { config } instead.',
        },
      ],
    },
  },
  { files: ['app/**/*.tsx'], ...jsxA11y.flatConfigs.recommended },
  {
    files: ['app/config.ts', 'app/config.test.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  // ui/ may use domain types and formatters only; never features, shell, or data.
  {
    files: ['app/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/features/*', '@app/shell/*', '@app/services/*', '@app/services'],
              message: 'ui/ is below features and shell.',
            },
            { group: ['@src/data/*'], message: 'ui/ may import @src/domain only.' },
          ],
        },
      ],
    },
  },
  // A feature never reaches into another feature's internals.
  {
    files: ['app/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/features/*/*'],
              message:
                "Import another feature through its index.ts public API, e.g. '@app/features/booking'.",
            },
            { group: ['@app/shell/*'], message: 'features sit below the shell.' },
            {
              group: ['../../*'],
              message: 'Do not import across feature folders with relative paths.',
            },
          ],
        },
      ],
    },
  },

  // ---------- src/: backend-shaped, no React, no DOM ----------
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.es2022 },
    rules: {
      'no-restricted-globals': ['error', ...BROWSER_GLOBALS_IN_SRC],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@app/*', '**/app/*'], message: 'src/ never imports from app/.' },
            {
              group: [
                'react',
                'react/*',
                'react-dom',
                'react-dom/*',
                'react-router',
                'react-router/*',
              ],
              message: 'src/ has no React.',
            },
          ],
        },
      ],
    },
  },
  {
    // Time is injected through Clock so tests are deterministic.
    files: ['src/**/*.ts'],
    ignores: ['src/domain/clock.ts', 'src/**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'Use the injected Clock instead of new Date().',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'Use the injected Clock instead of Date.now().',
        },
      ],
    },
  },

  // ---------- tooling ----------
  {
    files: ['scripts/**/*.ts', 'vite.config.ts', 'vitest.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
);
