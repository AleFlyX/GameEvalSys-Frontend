# 服务监控前端对接说明

## 1. 目标

本说明用于指导前端实现后台服务监控面板。当前监控模块只对 `super_admin` 可见，前端只负责展示和轮询刷新，不做任何写操作。

---

## 2. 接口清单

### 2.1 首屏聚合接口

- `GET /admin/monitor/dashboard`

用途：页面初始化时一次性获取全部监控数据。

建议优先级：最高。

### 2.2 分项接口

- `GET /admin/monitor/overview`
- `GET /admin/monitor/health`
- `GET /admin/monitor/datasource`
- `GET /admin/monitor/redis`
- `GET /admin/monitor/jvm`
- `GET /admin/monitor/os`
- `GET /admin/monitor/config`

用途：卡片局部刷新、失败重试、按需请求。

### 2.3 实时推送接口（建议新增）

- `GET /admin/monitor/stream`

用途：使用 SSE 推送监控卡片的实时变化数据，适合 `health`、`jvm`、`os` 这类变化更频繁的指标。

说明：

- 首屏不依赖 SSE，仍然先走 `dashboard`。
- SSE 只负责首屏后的实时刷新，不负责首次渲染。
- 浏览器或代理不支持 SSE 时，前端应自动降级为轮询 `/admin/monitor/health`、`/admin/monitor/jvm`、`/admin/monitor/os`。

### 2.4 SSE 消息格式建议

建议后端按“事件名 + JSON 载荷”的形式推送，前端只负责按事件名更新对应卡片。

示例：

```text
event: health
data: {"overallStatus":"UP","datasourceStatus":"UP","redisStatus":"UP","message":"数据库和 Redis 均正常"}

event: jvm
data: {"heapUsedBytes":12345678,"heapCommittedBytes":268435456,"heapMaxBytes":536870912,"threadCount":64}

event: os
data: {"systemCpuLoadPercent":12.34,"processCpuLoadPercent":4.56,"memoryUsagePercent":50.0,"diskUsagePercent":50.0}
```

建议事件名固定为：

- `health`
- `jvm`
- `os`
- `datasource`
- `redis`
- `config`

说明：

- `health`、`jvm`、`os` 高频推送。
- `datasource`、`redis`、`config` 低频推送，或者页面进入时推一次即可。

---

## 3. 前端接入流程

### 3.1 页面初始化

1. 登录后确认当前用户角色为 `super_admin`。
2. 进入监控页时先请求 `GET /admin/monitor/dashboard`。
3. 渲染总览卡、状态卡、资源卡和配置卡。
4. 首屏完成后立即建立 `EventSource` 连接到 `/admin/monitor/stream`。
5. 若首屏请求失败，再根据卡片优先级降级请求分项接口。

### 3.2 定时刷新

- SSE 建立成功后，前端不再对实时卡片做高频轮询。
- 建议由后端每 3 秒到 10 秒推送一次变更数据，具体频率按机器负载调整。
- 如果 SSE 断开，前端立即进入轮询降级模式，刷新周期建议 10 秒到 30 秒。
- 建议优先推送：`health`、`jvm`、`os`；`datasource`、`redis`、`config` 可低频推送或只在页面进入时刷新。

### 3.3 连接生命周期

建议前端按以下顺序管理连接：

1. 页面挂载后先拉 `dashboard`。
2. `dashboard` 成功后再创建 `EventSource`。
3. 监听 `onmessage` 或按事件名分发到各个卡片。
4. 监听 `onerror`，达到重连阈值后切换轮询。
5. 页面卸载或路由切换时调用 `close()` 释放连接。

建议重连策略：

- 第一次断线：立即重连。
- 连续失败 3 次：切换轮询，等待 30 秒后再尝试 SSE。
- 当网络恢复或页面重新进入时，重新建立 SSE。

### 3.4 错误处理

- `401`：说明 token 失效，走现有刷新或重新登录流程。
- `403`：说明当前用户不是 `super_admin`，应直接展示无权限提示。
- `5xx`：展示接口失败状态，不影响其它卡片继续渲染。

---

## 4. 页面结构建议

### 4.1 顶部总览区

展示：

- 主机名
- server port
- Java 版本
- 启动时间
- 运行时长

### 4.2 状态区

展示：

- overallStatus
- datasourceStatus
- redisStatus
- message

当状态不为 `UP` 时，建议使用红色或橙色提示。

### 4.3 资源区

展示：

- 数据库连接池状态
- Redis 连接状态
- JVM 堆内存和线程数
- CPU、内存、磁盘占用

### 4.4 配置区

展示脱敏后的配置摘要：

- 数据库地址、端口、库名
- Redis 地址、端口、数据库号
- server.port
- timeZone
- cacheSchedulerEnabled

---

## 5. 前端组件建议

建议按以下组件拆分：

- `MonitorDashboardPage`
- `MonitorOverviewCard`
- `MonitorHealthCard`
- `MonitorDataSourceCard`
- `MonitorRedisCard`
- `MonitorJvmCard`
- `MonitorOsCard`
- `MonitorConfigCard`

组件职责建议：

- 页面组件负责拉取聚合数据和轮询。
- 卡片组件只负责渲染，不直接发请求。

### 5.1 建议的状态管理

建议页面层维护以下状态：

- `dashboardData`：首屏聚合数据
- `realtimeData`：SSE 推送的增量数据
- `connectionStatus`：`connecting` / `open` / `closed` / `fallback`
- `retryCount`：SSE 重连次数
- `lastUpdateAt`：最近一次刷新时间

建议合并规则：

1. `dashboardData` 作为初始数据。
2. `realtimeData` 覆盖同名字段。
3. 卡片渲染时优先使用 `realtimeData`，没有则使用 `dashboardData`。
4. 当 SSE 进入降级状态时，保留最后一次成功数据，不要清空页面。

---

## 6. 数据处理规则

- 所有字段仅展示，不可编辑。
- 不要在前端做敏感信息拼接。
- 密码、token、cookie、session id 不得在页面或日志中明文展示。
- 百分比和字节数建议统一格式化后再展示。

---

## 7. 推荐的对接顺序

1. 先接 `dashboard` 接口完成首屏。
2. 首屏完成后建立 SSE 连接，订阅 `health`、`jvm`、`os` 的实时推送。
3. 再补 `datasource`、`redis` 和 `config` 的低频刷新。
4. 最后补异常态样式、断线重连和加载骨架屏。
5. 如果 SSE 在生产环境受代理限制，再保留轮询兜底逻辑。

---

## 8. 验收标准

- `super_admin` 能正常打开监控页。
- 首屏能展示总览和健康状态。
- 分项卡片能通过 SSE 正常刷新，断线后能自动降级轮询。
- `403` 场景能正确拦截非 `super_admin` 用户。
- 页面上不显示数据库密码和 Redis 密码明文。
