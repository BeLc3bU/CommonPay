import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
        supabase: 'readonly',
        CalculationsModule: 'writable',
        StorageModule: 'writable',
        Chart: 'readonly',
        XLSX: 'readonly',
        html2pdf: 'readonly',
        lucide: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'avoidEscape': true }]
    }
  }
];
