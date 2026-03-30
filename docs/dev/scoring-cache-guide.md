# 评分模块缓存说明（Pinia + Map + localStorage）

## 1. 目标

评分模块缓存主要解决三个问题：

1. 页面跳转后重复请求过多，影响评分操作速度。
2. 刷新页面后缓存丢失，用户体验不稳定。
3. 同一数据并发请求时，浪费网络和后端资源。

当前实现采用 **两层缓存**：

1. **L1（内存）**：Pinia Store 内的 `Map`，读取最快。
2. **L2（持久化）**：`localStorage`，用于页面刷新后恢复数据。

---

## 2. 缓存对象与 TTL

### 2.1 projectStore

缓存对象：项目详情（`projectId -> projectDetail`）  
默认 TTL：5 分钟

### 2.2 scoreStore

缓存对象：

1. 打分标准详情（`standardId -> standardDetail`）  
默认 TTL：60 分钟
2. 评分记录详情（`projectId:groupId -> scores/totalScore`）  
默认 TTL：5 分钟

---

## 3. key 设计（按用户隔离）

为了避免不同账号互相污染缓存，`localStorage` key 带用户维度：

1. `game-evaluate:project-cache:v1:{userId}:project-details`
2. `game-evaluate:score-cache:v1:{userId}:score-standards`
3. `game-evaluate:score-cache:v1:{userId}:scoring-records`

`v1` 是缓存 schema 版本，后续结构变化可通过升级版本整体失效旧缓存。

---

## 4. 读写策略

### 4.1 读取（get/fetch）

1. 先 `ensureHydrated()`：确认当前用户的 L2 数据已加载到 L1。
2. 读 L1 Map：命中且未过期直接返回。
3. 若过期则惰性删除（读到过期才删），并回写 L2。
4. 未命中时再发起 API 请求。

### 4.2 写入（set）

1. 先写 L1 Map（带 `fetchedAt/expiredAt`）。
2. 再同步写入 L2（`localStorage`）。

### 4.3 并发去重（fetch）

对相同 key 的并发请求，复用同一个 Promise（`requestMap`），避免重复打接口。

---

## 5. 失效策略

### 5.1 主动失效

提交评分成功后：

1. 清理当前 `projectId + groupId` 的评分详情缓存。
2. 触发父组件刷新。
3. 父组件可按项目清理该项目下全部评分记录缓存后再拉新数据。

### 5.2 被动失效

读取缓存时如果发现过期：

1. 删除过期 entry。
2. 回写 localStorage。
3. 下次自然走网络请求刷新。

---

## 6. 业务页面如何使用缓存

### 6.1 评分列表页 `useScoringList`

列表请求成功后，预热项目详情缓存（仅在关键字段完整时写入）。

### 6.2 列表操作 `useHandleTable`

点击“开始打分”时，先预取：

1. 项目详情
2. 对应打分标准

最多等待 300ms，再跳转路由，避免卡点击。

### 6.3 评分表单 `ScoringForm`

初始化时按链路读取：

1. `projectDetail`（拿 `standardId`）
2. `standardDetail`（拿 `indicators`）

提交成功后执行评分记录缓存失效。

### 6.4 小组评分页 `groups/index`

1. 拉取项目评分记录列表后，批量预热每个小组的评分详情缓存。
2. 查看评分详情时优先命中缓存，未命中再请求并回填。

---

## 7. 调试建议

可在浏览器控制台查看 localStorage：

1. `localStorage.getItem('game-evaluate:project-cache:v1:{userId}:project-details')`
2. `localStorage.getItem('game-evaluate:score-cache:v1:{userId}:score-standards')`
3. `localStorage.getItem('game-evaluate:score-cache:v1:{userId}:scoring-records')`

建议重点验证：

1. 首次进入评分页（冷启动）。
2. 刷新页面后再次进入（L2 回填）。
3. 提交评分后立即查看（失效是否生效）。
4. 切换账号后缓存是否隔离。

---

## 8. 后续可扩展点

1. 增加 LRU 上限，控制 localStorage 体积。
2. 接入 `updatedAt`/`etag` 做更精细的后台校验。
3. 在登录/登出时显式清理当前用户缓存。
