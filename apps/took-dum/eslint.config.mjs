import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import baseConfig from '../../eslint.config.mjs';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...baseConfig,
  ...compat.extends('plugin:@nx/react', 'next', 'next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
