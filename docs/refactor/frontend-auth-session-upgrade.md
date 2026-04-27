# 前端改动说明（JWT + Redis 会话中心）

## 1. 登录与本地存储

### 登录接口

- `POST /auth/login`
- 响应新增字段：
  - `token`：access token
  - `refreshToken`
  - `sid`
  - `expireTime`（字符串时间）

### 前端存储建议

- 本地保存：`accessToken`、`refreshToken`、`sid`、`expireTime`
- 请求头统一：`Authorization: Bearer <accessToken>`

## 2. 刷新流程（强制）

### 刷新接口

- `POST /auth/refresh`
- 请求体：`{ "sid": "...", "refreshToken": "..." }`
- 响应：返回新的 `token` 和新的 `refreshToken`（轮换）

### 刷新策略

- `401` 时触发 refresh（若存在 `sid + refreshToken`）
- 刷新成功后更新本地 `accessToken` 与 `refreshToken`
- 刷新失败或返回 `401`，清空本地凭证并跳转登录页

## 3. 登出

- `POST /auth/logout`
- 仅需 `Authorization` 头
- 退出成功后清空本地凭证

## 4. 在线会话相关页面

### 我的会话列表

- `GET /auth/sessions/me`
- 返回字段：`sid/username/role/loginAt/lastActiveAt/status`

### 管理端在线用户列表

- `GET /admin/online-users`
- 支持参数：`page/size/role/keyWords/isEnabled/onlineOnly`
- 返回字段：
  - `id/username/name/role/isEnabled`
  - `onlineCount`
  - `lastActiveAt`
  - `lastLoginAt`

### 管理端会话操作

- `POST /admin/sessions/{sid}/kick`：踢指定会话
- `POST /admin/users/{userId}/kick-all`：踢该用户全部会话

## 5. 关键注意事项

- access token 4 小时；refresh 7 天
- refresh token 轮换：前端必须使用最新的 refresh token
- `tokenVersion` 强制下线：用户改密/封禁/角色变更后，旧 token 会直接 401
- `lastActiveAt` 为滑动更新（5 分钟窗口），前端不需要主动更新

## 6. 建议的前端拦截器逻辑

1. 发请求前带 `Authorization` 头
2. 响应 401 时尝试刷新
3. 刷新成功后重试原请求
4. 刷新失败则清理凭证并跳转登录
