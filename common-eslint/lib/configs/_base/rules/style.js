module.exports = {
  rules: {
    // 缩进4空格
    indent: [
      'error',
      4,
      {
        SwitchCase: 1,
      },
    ],

    // 要求文件末尾存在空行
    'eol-last': ['error', 'always'],

    // 注释的 `//` 或 `/*` 后必须跟一个空格
    'spaced-comment': ['error', 'always'],

    // 要求尽可能地简化赋值操作
    'operator-assignment': ['error'],

    // 禁用嵌套的三元表达式
    'no-nested-ternary': ['error'],

    // 禁止可表达为更简单结构的三元表达式，如 `isFoo ? true : false`
    'no-unneeded-ternary': ['error'],

    // 不允许多个空行
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
      },
    ],
  },
}
