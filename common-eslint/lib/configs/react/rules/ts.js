module.exports = {
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended'],
    rules: {
        semi: 'off',
        '@typescript-eslint/semi': ['error'],
        '@typescript-eslint/no-inferrable-types': 'off', // 可以覆盖自动推断的类型
        '@typescript-eslint/ban-types': 'warn', // 可以使用禁止的类型，如Function, {}, object
        '@typescript-eslint/ban-ts-comment': 'warn', // 可以使用如@ts-ignore跳过ts检查
        '@typescript-eslint/no-empty-function': 'warn', // 可以存在空函数
        '@typescript-eslint/no-var-requires': 'off', // 可以使用require
        '@typescript-eslint/no-namespace': 'off', // 可以使用Namespace Modules声明
        "@typescript-eslint/no-empty-interface": "warn" // 空的类型
    },
}