# Domain 层 — 动态路由与菜单（简要接口说明）

目的

- 将动态路由/菜单相关的业务边界收口在 `src/domain`，实现职责分离：
  - 持久化（localStorage）
  - 运行时 state（Vue 响应式）
  - 后端节点 -> vue-router RouteRecord 的转换（纯函数，易于测试）

主要文件与导出

- `dynamicRouteMenu.js`
  - `MENU_TREE_STORAGE_KEY`：storage key 常量
  - `readStoredMenuTree()` → Array：从 localStorage 读取并返回菜单数组（解析错误返回 []）
  - `writeStoredMenuTree(tree)` → boolean：写入 localStorage，异常返回 false
  - `clearStoredMenuTree()`：清除 localStorage 中的菜单

- `dynamicRouteState.js`
  - 导出 `menuTree`（ref）和 `routesReady`（ref）两份运行态
  - 方法：
    - `hydrateDynamicMenuTree()`：从 storage 读取并设置 `menuTree`
    - `setDynamicMenuTree(tree)`：设置 `menuTree` 并写入 storage
    - `clearDynamicMenuTree()`：清空 `menuTree` 与 storage
    - `setDynamicRoutesReady(value)`：设置 `routesReady`
    - `resetDynamicRouteState()`：重置运行态并清 storage
  - 说明：模块加载时会从 storage 进行一次读取（请注意 SSR/测试场景的副作用）

- `dynamicRouteConverter.js`
  - 纯函数：`convertBackendNodes(data, mapComponent)` → Array of RouteRecord-like objects
  - contract：
    - `data`：后端返回的节点数组（如果不是数组，返回 []）
    - `mapComponent`：可选，函数：`(componentCode) => VueComponent|factory|null`。若未提供或非函数则回退到 `RouterView`。
  - 输出：每个 record 包含 `path`, `name`, `meta`（含 `title`,`icon`,`hidden`,`roles`），以及 `component`/`children`/`redirect`（若有）
  - 已包含路径/name 正规化、角色解析的启发式规则，且有单元测试覆盖关键场景

设计与使用要点（简洁）

- 职责分离：副作用（storage）、运行态（vue ref）和转换逻辑（纯函数）彼此独立，便于测试与替换实现。
- 导入示例（在业务代码中）：
  - 订阅运行态（侧边栏）：
    - 使用 `menuTree`、`routesReady` 作为响应式来源，不要直接读 localStorage。
  - 注入路由（权限层）：
    - 调用 `convertBackendNodes(data, mapComponent)` 生成 records，再用 router.addRoute/injectRoutes 注入。
  - 登录流程：
    - 登录成功后 fetch 后端菜单 -> `setDynamicMenuTree(data)` -> `convertBackendNodes` -> 注入路由 -> `setDynamicRoutesReady(true)`

示例代码片段

- 生成并注入路由（伪代码）：

```
import { setDynamicMenuTree, setDynamicRoutesReady } from '@/domain/dynamicRouteState';
import { convertBackendNodes } from '@/domain/dynamicRouteConverter';
import { routeMap } from '@/router/routeMap'; // 负责 componentCode -> component

const records = convertBackendNodes(backendData, (code) => routeMap[code]);
router.addRoute(/*...*/); // 注入 records
setDynamicMenuTree(backendData);
setDynamicRoutesReady(true);
```

测试与稳健性建议

- `dynamicRouteConverter` 是纯函数，应持续补充边界单元测试（空数组、无 componentCode、非法 path、role 字段等）。
- 避免模块加载时的副作用影响测试：若需要，可把 `dynamicRouteState` 的初始 hydrate 改为显式 `init()`。

扩展建议（可选）

- 为每个导出添加 JSDoc 或 TypeScript 类型声明（提高可维护性）
- 提供 `src/domain/index.js` 聚合导出，简化上层导入路径

维护注意

- 修改 `convertBackendNodes` 的输出 shape 会影响路由注入和侧边栏渲染，请同时更新对应使用处。

---

快速行动：如需我把 README 合并到项目中的 `src/domain/index.js` 聚合导出，或为 `dynamicRouteMenu/state` 添测试，我可以继续实现。
