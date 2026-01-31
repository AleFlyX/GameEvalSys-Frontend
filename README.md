# GameEvaluate-frontend

This template should help get you started developing with Vue 3 in Vite.

## 项目目录结构

```plain text
├── src/
│   ├── pages/         # 按角色分层：admin（管理员）/normal（普通用户/打分用户）/public（公共页面）
│   │   ├── public/    # 所有角色均可访问的公共页面（登录、403、404）
│   │   │   ├── login/
│   │   │   │   └── Login.vue
│   │   │   ├── 403/
│   │   │   │   └── Forbidden.vue
│   │   │   └── 404/
│   │   │       └── NotFound.vue
│   │   ├── admin/     # 仅超级管理员/管理员可访问的页面（用户/项目/统计管理）
│   │   │   ├── user/  # 用户管理模块
│   │   │   │   ├── UserList.vue
│   │   │   │   ├── UserAdd.vue
│   │   │   │   └── UserEdit.vue
│   │   │   ├── project/ # 项目管理模块
│   │   │   │   ├── ProjectList.vue
│   │   │   │   ├── ProjectAdd.vue
│   │   │   │   └── ProjectEdit.vue
│   │   │   └── statistic/ # 数据统计与导出模块
│   │   │       └── StatisticPannel.vue
│   │   └── normal/    # 打分用户/普通用户可访问（仅授权内容，管理员也可访问）
│   │       ├── home/  # 后台首页
│   │       │   └── HomePage.vue
│   │       ├── scoring/ # 打分功能模块
│   │       │   ├── ScoringList.vue # 授权打分项目列表
│   │       │   └── GroupScoring.vue # 小组打分详情页
│   ├── router/
│   │   └── index.js   # 路由配置（核心：权限路由、角色拦截）
│   ├── store/         # Pinia状态管理（用户信息、全局状态）
│   │   ├── modules/
│   │   │   └── userStore.js # 用户信息/登录态管理
│   │   └── index.js
│   ├── utils/
│   │   ├── request.js # 已封装的Axios（之前优化版）
│   │   └── format.js  # 新增：格式化工具（时间/数字）
│   ├── api/           # 接口封装（之前已写user.js，后续补全其他）
│   │   ├── user.js    # 已封装
│   │   ├── project.js # 待开发
│   │   ├── scoring.js # 待开发
│   │   └── statistic.js # 待开发
│   ├── layout/        # 布局组件（后台主布局：侧边栏+头部）
│   │   ├── MainLayout.vue # 核心布局（admin/normal页面共用）
│   │   ├── components/
│   │   │   ├── Sidebar.vue # 侧边栏（按角色渲染菜单）
│   │   │   └── Header.vue  # 头部（退出、用户信息）
│   └── components/    # 全局公共组件
│       ├── common/    # 基础公共组件
│       │   ├── PaginationBar.vue # 分页组件
│       │   ├── SearchInput.vue # 搜索输入框
│       │   └── ConfirmDelete.vue # 删除确认弹窗
│       └── business/  # 业务公共组件
│           ├── ScoringForm.vue # 打分表单（核心业务组件）
│           └── ProjectCard.vue # 项目卡片
```

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

## git提交规范

```
feat : 新功能
fix : 修复bug
docs : 文档改变
style : 代码格式改变
refactor : 某个已有功能重构
perf : 性能优化
test : 增加测试
build : 改变了build工具 如 grunt换成了 npm
revert : 撤销上一次的 commit
chore : 构建过程或辅助工具的变动
```
