module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    es2022: true,
    node: true
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    '.expo/',
    'coverage/',
    'design-reference/',
    '*.config.js',
    '*.config.cjs'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  overrides: [
    {
      files: ['apps/mobile/**/*.tsx', 'apps/web/**/*.tsx'],
      env: {
        browser: true
      }
    },
    {
      files: ['packages/shared/tests/**/*.ts'],
      env: {
        node: true
      }
    }
  ]
};
