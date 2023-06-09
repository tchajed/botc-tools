/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // waiting on TypeScript 5.1 support
    // see https://github.com/typescript-eslint/typescript-eslint/issues/6934
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: ['@typescript-eslint', 'unused-imports'],
  overrides: [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        // ignore these for now, will fix them together later
        "no-var": 'off',
        "prefer-const": 'off',
      },
    }
  ],
  root: true,
};
