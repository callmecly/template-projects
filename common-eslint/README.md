# eslint-plugin-common-eslint

common eslint

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-common-eslint`:

```sh
npm install eslint-plugin-common-eslint --save-dev
```

## Usage

Add `common-eslint` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "root": true,
    "plugins": ["common-eslint"],
    "extends": ["plugin:common-eslint/react"],
}
```
