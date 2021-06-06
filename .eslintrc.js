module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-underscore-dangle': 0,
    'import/no-unresolved': 'off',
  },
  overrides: [
    {
      files: ['*-test.js', '*.spec.js'],
    },
  ],

};
