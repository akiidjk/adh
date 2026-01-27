import pluginJs from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';

import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import pluginPromise from 'eslint-plugin-promise';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

const eslintConfig = [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    settings: {
      'import/resolver': {
        typescript: {}
      },
      react: {
        version: 'detect'
      }
    }
  },
  pluginJs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  ...tseslint.configs.recommended,
  pluginPromise.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  eslintConfigPrettier,
  {
    rules: {
      'no-unused-vars': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',
      'import/no-unresolved': 'off',
      'import/no-named-as-default': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    }
  },
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'off'
    }
  },
  {
    ignores: ['.next/*']
  }
];

export default eslintConfig;
