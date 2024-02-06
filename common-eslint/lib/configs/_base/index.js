const {
  join
} = require('path')

module.exports = {
  parserOptions: {
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  extends: [
    join(__dirname, './rules/import'),
    join(__dirname, './rules/errors'),
    join(__dirname, './rules/style'),
  ],
}