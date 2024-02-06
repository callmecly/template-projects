const {
    join
  } = require('path')

module.exports = {
    env: {
        browser: true,
    },
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        parser: '@typescript-eslint/parser',
    },
    extends: [
        join(__dirname, '../_base/index'),
        join(__dirname, './rules/ts')
    ]
}