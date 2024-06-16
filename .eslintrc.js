module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 15,
  },
  rules: {
    'linebreak-style': 'off',
    'import/no-extraneous-dependencies': 'off',
    'prefer-destructuring': 'off',
    'no-underscore-dangle': 'off',
    'object-curly-newline': 'off',
  },
};
