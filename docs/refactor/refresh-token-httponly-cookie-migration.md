# RefreshToken 迁移方案（HttpOnly + Secure + SameSite Cookie）

## 1. 目标与范围

将当前“`accessToken + refreshToken` 都存 `localStorage`”迁移为：

- `accessToken`：前端内存态（可选短期持久化兜底）
- `refreshToken`：仅后端通过 `Set-Cookie` 写入 `HttpOnly + Secure + SameSite` Cookie
- 刷新接口不再从请求体接收 `refreshToken`，改为从 Cookie 读取

目标：

1. 降低 XSS 导致 refreshToken 泄露风险  
2. 保持现有 `401 -> refresh -> 重试` 体验  
3. 支持灰度与快速回滚

当前仓库落地状态（2026-04-30）：

- 已按最终态切换前端刷新逻辑：refreshToken 不再由前端持久化与传参
- 前端 refresh 请求改为仅传 `sid`，并依赖 Cookie 自动携带 refreshToken
- Axios 已启用 `withCredentials: true`

---

## 2. 现状与风险

现状（前端）：

- `localStorage` 保存 `accessToken/refreshToken/sid/expireTime`
- `401` 时调用 `/auth/refresh`（请求体含 `sid + refreshToken`）

核心风险：

- 一旦页面存在 XSS，攻击脚本可直接读取 refreshToken 并长期维持会话

---

## 3. 目标架构

## 3.1 登录

`POST /auth/login` 成功后：

1. 响应体返回 `accessToken`（和可选 `sid/expireTime/userInfo`）
2. 响应头 `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=...; Path=/api/v1/auth/refresh`

## 3.2 刷新

`POST /auth/refresh`：

1. 前端仅传 `sid`（或不传，由服务端会话定位）
2. 后端从 Cookie 读取 refreshToken
3. 刷新成功后返回新 `accessToken`，并轮换 refreshToken Cookie（重新 `Set-Cookie`）

## 3.3 登出

`POST /auth/logout`：

1. 服务端使 refreshToken 失效
2. 服务端下发清除 Cookie（`Max-Age=0`）
3. 前端清理内存 accessToken 与用户态

---

## 4. 后端改造清单（Spring Boot）

## 4.1 Cookie 策略参数化

新增配置（建议）：

```yaml
auth:
  refresh-cookie:
    name: refreshToken
    path: /api/v1/auth/refresh
    http-only: true
    secure: true
    same-site: None # 生产跨站时用 None；同站可 Lax
    max-age-seconds: 604800 # 7天
```

说明：

- 前后端同域：`SameSite=Lax` 通常足够
- 跨域（前端域名 != API 域名）：通常要 `SameSite=None` 且 `Secure=true`

## 4.2 登录接口改造

`/auth/login`：

1. 生成 refreshToken 后，不再在响应体返回该字段（可灰度期保留）
2. 通过 `ResponseCookie` 或 `HttpServletResponse` 写入 HttpOnly Cookie
3. 响应体保留 `accessToken/sid/expireTime/userInfo`

## 4.3 刷新接口改造

`/auth/refresh`：

1. 删除 `refreshToken` 请求体参数（灰度期可兼容两种来源）
2. 优先从 Cookie 读取 refreshToken
3. 刷新成功后轮换 refreshToken，并重新写 Cookie
4. 刷新失败返回 `401`

## 4.4 登出接口改造

`/auth/logout`：

1. 注销服务端 refreshToken（黑名单/版本号/会话删除）
2. 设置同名 Cookie `Max-Age=0` 立即失效

## 4.5 CORS 与凭据

必须开启：

1. `Access-Control-Allow-Credentials: true`
2. `Access-Control-Allow-Origin` 不能为 `*`，必须明确前端域名
3. 允许 `POST /auth/refresh` 的预检通过

---

## 5. 前端改造清单（Vue + Axios）

## 5.1 Axios 基础配置

在请求实例开启：

```js
withCredentials: true
```

用于让浏览器在 refresh 请求时自动携带 Cookie。

## 5.2 本地存储调整

删除 refreshToken 持久化：

- 不再 `localStorage.setItem("refreshToken", ...)`
- 清理逻辑移除对应 key（保留一次兼容清理）

保留：

- `accessToken`（建议先保持现状，后续再迁移到内存）
- `sid`（若后端刷新仍需）

## 5.3 刷新请求体调整

当前：

```json
{ "sid": "...", "refreshToken": "..." }
```

迁移后：

```json
{ "sid": "..." }
```

或空体（取决于后端是否需要 sid）。

## 5.4 拦截器逻辑保持

继续使用现有：

1. 业务请求 401
2. 调用 `/auth/refresh`
3. 成功后重试原请求
4. 失败则跳登录

你们当前“单飞 refreshPromise”可原样保留。

---

## 6. 分阶段上线（推荐）

## 阶段 A：后端兼容期

1. `/auth/refresh` 同时支持：
   - Cookie refreshToken（新）
   - Body refreshToken（旧）
2. 登录同时返回 body refreshToken + Set-Cookie（仅过渡期）

## 阶段 B：前端切换

1. 前端发布：刷新仅依赖 Cookie，不再读写 localStorage refreshToken
2. 观察登录率、401->refresh 成功率、异常跳登

## 阶段 C：收口

1. 后端移除 body refreshToken 支持
2. 登录响应体移除 refreshToken 字段
3. 文档与 SDK 全量更新

---

## 7. 验收清单

1. 登录后浏览器 `Application -> Cookies` 可见 refreshToken，且 `HttpOnly=true`
2. `localStorage` 中不再出现 refreshToken
3. 手动使 accessToken 过期后，下一次请求可自动刷新并成功重试
4. 登出后 refresh Cookie 被清除，刷新接口返回 401
5. 跨域部署下 refresh 仍成功（`withCredentials + CORS` 正确）

---

## 8. 风险与回滚

主要风险：

1. CORS/凭据配置错误导致 refresh 全量失败
2. SameSite 策略与部署拓扑不匹配导致 Cookie 不携带

回滚策略：

1. 后端暂时恢复 body refreshToken 兼容
2. 前端临时启用旧 refreshToken 读取路径（灰度开关）
3. 保留旧版 1 个发布窗口，确认稳定后再删除

---

## 9. 建议参数（结合当前项目）

1. accessToken：维持 4 小时（当前可接受）
2. refreshToken：7 天轮换
3. SameSite：
   - 同域部署：`Lax`
   - 跨域部署：`None` + `Secure=true`
4. Cookie Path：限制到 `/api/v1/auth/refresh`，减少暴露面

---

## 10. 代码改造定位（你们仓库）

前端重点文件：

1. `src/utils/request.js`：`withCredentials`、refresh 请求体、清理逻辑
2. `src/stores/modules/userStore.js`：移除 refreshToken 持久化
3. `src/api/user.js`：`refreshToken` 接口参数改造

后端重点文件（按你当前命名习惯）：

1. `AuthController`（login/refresh/logout）
2. `AuthService`（refresh 轮换与失效）
3. `CorsConfig`（credentials + origin 白名单）
