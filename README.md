# GameEvaluate-frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## 快速启动

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Prettierrc自动格式化代码插件

```js
    // 一行最多多少个字符
    "printWidth": 150,
    // 指定每个缩进级别的空格数
    "tabWidth": 2,
    // 使用制表符而不是空格缩进行
    "useTabs": true,
    // 在语句末尾打印分号
    "semi": true,
    // 使用单引号而不是双引号
    "singleQuote": true,
    // 更改引用对象属性的时间 可选值"<as-needed|consistent|preserve>"
    "quoteProps": 'as-needed',
    // 在JSX中使用单引号而不是双引号
    "jsxSingleQuote": false,
    // 多行时尽可能打印尾随逗号。（例如，单行数组永远不会出现逗号结尾。） 可选值"<none|es5|all>"，默认none
    "trailingComma": 'es5',
    // 在对象文字中的括号之间打印空格
    "bracketSpacing": true,
    // jsx 标签的反尖括号需要换行
    "jsxBracketSameLine": false,
    // 在jsx中把'>' 是否单独放一行
    "bracketSameLine": false,
    // 在单独的箭头函数参数周围包括括号 always：(x) => x \ avoid：x => x
    "arrowParens": 'always',
    // 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码
    "rangeStart": 0,
    "rangeEnd": Infinity,
    // 指定要使用的解析器，不需要写文件开头的 @prettier
    "requirePragma": false,
    // 不需要自动在文件开头插入 @prettier
    "insertPragma": false,
    // 使用默认的折行标准 always\never\preserve
    "proseWrap": 'preserve',
    // 指定HTML文件的全局空格敏感度 css\strict\ignore
    "htmlWhitespaceSensitivity": 'css',
    // Vue文件脚本和样式标签缩进
    "vueIndentScriptAndStyle": false,
    // 换行符使用 lf 结尾是 可选值"<auto|lf|crlf|cr>"
    "endOfLine": 'lf'

```
