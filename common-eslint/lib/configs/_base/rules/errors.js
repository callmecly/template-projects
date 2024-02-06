module.exports = {
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 debugger
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 console
  }
}