## 动态路由标准分层

### 结论

> 变更注记（2026-05-28）：代码库中原有的 `normalRoutes`、`adminRoutes`、`superAdminRoutes` 等前端静态业务路由
> 模块已被移除，业务路由由后端 `/auth/routes` 提供；本页内容为标准建议与当前实现说明。

当前项目已经有后端动态路由支撑时，前端不应再保留一套完整的业务路由作为主来源。标准做法是：

- 前端保留公共路由和布局壳
- 后端负责返回业务路由树
- 前端只负责把后端路由元数据映射成可注入的 `RouteRecord`
- 侧边栏继续使用“菜单树”，不是注入后的扁平路由数组

### 前端必须保留的路由

这些路由属于前端基础设施，不应交给后端动态下发：

- `/login`
- `/403`
- `/404`
- `/about` 或其他公共说明页
- `mainLayout` 这种布局壳路由
- `/:pathMatch(.*)*` 兜底路由

### 前端不应再保留的内容

这些应尽量收口到后端动态路由（下列为历史前端静态模块，已从仓库移除）：

- `adminRoutes`（历史，已移除）
- `normalRoutes`（历史，已移除）
- `superAdminRoutes`（历史，已移除）
- 业务页面的静态主路由定义

它们最多只能保留为：

- 开发期 fallback
- 测试页
- 本地组件映射参考

### 路由注入的标准数据流

推荐的数据流是：

1. 登录后调用后端 `GET /auth/routes`
2. 后端返回菜单树/路由树元数据
3. 前端根据 `routeMap` 把 `componentCode` 映射成本地组件
4. 前端把结果扁平化为 `RouteRecord[]`
5. 将扁平路由注入到 `mainLayout` 下

这条链路里，前端只负责“渲染和挂载”，不负责“决定有哪些业务页面”。

### 侧边栏用什么数据

侧边栏不直接用扁平 routes，而是用后端返回的**非扁平菜单树**。

原因：

- 侧边栏需要父子层级关系来展开/折叠
- 需要隐藏目录节点或只展示某些叶子节点
- 需要根据当前路由计算 active path 和展开态

因此当前项目里应该区分两份数据：

- `menuTree`：给侧边栏用，保持树结构
- `routes`：给 router 用，扁平化后注入

### 当前项目里的职责边界

- `src/router/permission.js`
  - 负责拉取后端路由树
  - 负责把树转成扁平可注入路由
  - 负责把结果注入 `mainLayout`

- `src/domain/dynamicRouteConverter.js`
  - 负责把后端节点转成 `RouteRecord[]`
  - 这里应该只关心“路由注入需要什么形状”

- `src/domain/dynamicRouteState.js`
  - 负责保存菜单树和路由就绪状态

- `src/layouts/components/side-bar/**`
  - 负责消费树形 `menuTree`
  - 不应该直接消费扁平 routes

- `src/router/routeMap.js`
  - 只做 `componentCode -> 本地组件` 映射

### 最小化建议

如果要继续收口，建议按这个优先级：

1. 删除业务路由在前端的主定义来源，只保留 `publicRoutes`
2. 后端返回完整菜单树
3. 前端仅保留 `routeMap`
4. 侧边栏继续用 `menuTree`

这样可以避免：

- 路由重复注册
- 父子路径冲突
- 刷新时 404
- `params` 丢失或路由名冲突
