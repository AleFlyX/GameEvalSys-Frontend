# 课题项目打分系统前端

![Vue](https://img.shields.io/badge/Vue-3.5.26-42B883?style=flat-square&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=flat-square&logo=vite&logoColor=white)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.13.1-409EFF?style=flat-square&logo=element&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0.4-F7DF1E?style=flat-square&logo=pinia&logoColor=black)
![Node](https://img.shields.io/badge/Node-%5E20.19.0%20%7C%7C%20%3E%3D22.12.0-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-black?style=flat-square)

基于 Vue 3 + Vite + Pinia + Element Plus 的课题项目打分管理前端，支持多角色权限控制、项目管理、评审打分与统计分析。

## 功能概览

- 登录与鉴权：JWT 登录、请求自动携带 `Authorization`、401 自动清理登录态并跳转登录页
- RBAC 权限控制：基于路由 `meta.roles` 的页面访问控制
- 角色体系：`super_admin`、`admin`、`scorer`、`normal`
- 管理功能：用户管理、评审队伍管理、项目管理、项目受审队伍管理、打分标准管理
- 业务功能：项目打分、项目统计、平台统计
- 部署支持：本地开发代理、Nginx 历史路由兼容、Docker Compose 一键部署

## 技术栈

- Vue 3
- Vue Router 4
- Pinia
- Element Plus
- Axios
- ECharts
- Vite 7
- ESLint 9 + Prettier

## 运行要求

- Node.js: `^20.19.0 || >=22.12.0`
- npm: 建议与 Node LTS 配套版本

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认端口为 `5173`，并会自动打开浏览器。

### 3. 生产构建

```bash
npm run build
```

当前构建输出目录为 `deploy/dist`（见 `vite.config.js`）。

### 4. 预览构建结果

```bash
npm run preview
```

### 5. 代码检查与格式化

```bash
npm run lint
npm run format
```

## 环境变量

可在项目根目录按需创建 `.env.development`、`.env.production`。

| 变量名                  | 说明                            | 默认值    |
| ----------------------- | ------------------------------- | --------- |
| `VITE_API_BASE_URL`     | 接口基础路径                    | `/api/v1` |
| `VITE_SHOW_TEST_ROUTES` | 是否显示测试路由（`true` 启用） | `false`   |
| `VITE_DELAY_REQUEST`    | 是否启用请求延迟（`true` 启用） | `false`   |

示例：

```env
VITE_API_BASE_URL=/api/v1
VITE_SHOW_TEST_ROUTES=false
VITE_DELAY_REQUEST=false
```

## 路由与权限

### 公共路由

- `/login` 登录页
- `/about` 关于页
- `/403` 无权限页
- `/404` 未找到页

### 业务路由（历史静态示例）

主框架路由为 `/`，默认重定向到 `/home`。注意：仓库已在 2026-05-28 将业务路由的主定义移除，生产环境中业务路由应由后端 `GET /auth/routes` 提供。本节列出的路由为历史/参考示例，建议以后端下发的菜单树与前端 `routeMap` 为准：

- `/home`
- `/scoring`
- `/scoring/:projectId`

管理后台（历史示例）

- `/admin/user`
- `/admin/project`
- `/admin/project/edit/:id`
- `/admin/project/statistic`
- `/admin/project/statistic/:projectId`
- `/admin/scoring-stds`
- `/admin/project-groups`
- `/admin/reviewer-groups`
- `/admin/reviewer-groups/add`
- `/admin/reviewer-groups/edit/:id`
- `/admin/statistic`

超级管理员（历史示例）

- `/super-admin/monitor/server`
- `/super-admin/monitor/online`

## 接口约定

- 前缀：`/api/v1`
- 认证头：`Authorization: Bearer <token>`
- 统一响应结构：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

前端已在 `src/utils/request.js` 中完成：

- 请求拦截：自动注入 token、GET 请求附加防缓存参数
- 响应拦截：统一错误提示
- 401 处理：清理 token 并跳转登录

## 项目结构

```text
.
├─ src
│  ├─ api                  # 接口模块
│  ├─ components           # 通用组件与业务组件
│  ├─ composables          # 组合式函数
│  ├─ layouts              # 主布局与侧边栏/头部
│  ├─ pages                # 页面（public/normal/admin/super-admin）
│  ├─ router               # 路由与权限配置
│  ├─ stores               # Pinia 状态管理
│  └─ utils                # 请求、工具函数
├─ deploy
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  └─ nginx.conf
└─ docs                    # 开发文档与规范
```

## Docker 部署

在项目根目录执行：

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

默认映射端口：`8999 -> 80`。

说明：

- 镜像构建阶段会执行 `npm ci` 和 `npm run build`
- Nginx 会将 `/api/v1/*` 转发到 `http://host.docker.internal:8899`
- Vue Router 使用 history 模式，已通过 `try_files` 处理刷新 404 问题

## 开发约定

- API 调用统一放在 `src/api`，页面中不直接写裸 Axios
- 角色权限通过路由 `meta.roles` 控制，统一由全局前置守卫拦截
- 业务公共组件优先沉淀到 `src/components/business`
- 通用逻辑优先沉淀到 `src/composables`

## 常见问题

1. 接口 401
   - 检查 token 是否存在且未过期
   - 检查后端服务是否可用
2. 刷新页面 404
   - 检查 Nginx 是否配置 `try_files $uri $uri/ /index.html;`
3. 本地跨域
   - 开发环境使用 `vite.config.js` 的 `server.proxy`，无需在组件中处理跨域

## 相关文档

- `docs/basic/课题项目打分系统 - 前端项目说明.md`
- `docs/basic/api-call.md`
- `docs/dev/README.md`
- `deploy/README.md`

## 路由迁移说明（2026-05-28）

自 2026-05-28 起，仓库已调整路由加载策略：前端不再维护完整的业务路由静态模块（`normalRoutes`/`adminRoutes`/`superAdminRoutes`），这些业务路由由后端接口 `GET /auth/routes` 提供。前端仅保留：

- `publicRoutes`（登录、404、403、layout 等基础路由）
- `testRoutes`（仅用于测试，受 `VITE_SHOW_TEST_ROUTES` 控制）
- `routeMap`（`componentCode -> 本地组件` 映射表）

开发者对接要点：

1. 后端应实现 `GET /auth/routes`，返回当前用户可访问的菜单/路由树（参见 `docs/dev/dynamic-route-plan.md`）。
2. 前端在登录或启动时调用该接口，持久化 `menuTree`（localStorage），并使用 `src/domain/dynamicRouteConverter.js` 将其转换为 `RouteRecord[]` 注入到 `mainLayout` 下。注入逻辑位于 `src/router/permission.js`。
3. 新增页面时：先在前端实现页面并在 `src/router/routeMap.js` 注册对应的 `componentCode`，然后在后端的菜单管理中使用相同的 `componentCode` 下发路由。若后端返回的 `componentCode` 未命中映射，前端会使用 404/兜底组件作为备选。

如需回滚到前端静态路由（开发期快速验证），可参考历史示例文档，但生产环境应以后端为唯一业务路由来源以避免冲突与刷新问题。
