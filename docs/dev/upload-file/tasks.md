# Tasks
- [ ] Task 1: 搭建 Node.js BFF 上传网关服务
  - 初始化 `upload-bff/` 目录，package.json（Express + multer）
  - 实现入口 `src/index.js`（启动服务器、注册路由、中间件）
  - 实现 JWT 鉴权中间件 `middleware/auth.js`
  - 实现上传速率限制中间件 `middleware/rateLimit.js`
  - 实现分片存储与合并服务 `services/chunkManager.js`
  - 实现文件校验服务 `services/fileValidator.js`（Magic Number 校验）
  - 实现后端回调通知服务 `services/backendNotifier.js`
  - 实现上传路由 `routes/upload.js`（direct/chunk/check/merge）
  - 添加 `config/index.js` 配置管理
  - 添加 Dcokerfile 和 docker-compose 集成配置

- [ ] Task 2: 前端分片上传工具 `src/utils/chunked-upload.js`
  - 实现文件哈希计算（通过 FileReader 分片读取 + Web Crypto API SHA-256）
  - 实现分片上传逻辑（并发控制、失败重试）
  - 实现上传进度回调

- [ ] Task 3: 创建提交 API 模块 `src/api/submission.js`
  - 封装 BFF 上传接口（direct/chunk/check/merge）
  - 封装 Java 后端业务接口（submit/records/file download）

- [ ] Task 4: 创建文件上传组件
  - `FileUploader.vue`：文件拖拽/选择区、进度条、文件校验提示、分片上传状态
  - `SubmitHistory.vue`：提交记录表格列表

- [ ] Task 5: 创建提交页面 `src/pages/normal/submission/`
  - 页面布局：上传表单卡片 + 历史记录卡片
  - Composables：`useSubmission.js` 管理表单状态和提交流程
  - 表单校验配置：`config/formRules.js`

- [ ] Task 6: 添加入口
  - 首页 `HomePage.vue` 快捷入口面板为 `normal` 角色添加"提交作业"
  - 开发环境 `vite.config.js` 新增 `/api/upload` 代理到 BFF（port 3001）
  - 后端动态路由菜单需添加 `/normal/submission` 路由（文档说明供后端参考）

- [ ] Task 7: 部署配置
  - 编写 BFF 的 Dockerfile
  - 更新 `deploy/manual/docker-compose.yml`，增加 BFF 服务定义
  - 更新 `deploy/manual/nginx.conf`，增加 `/api/upload` location
  - 编写 BFF 的 `.env.template` 环境变量模板

# Task Dependencies
- [Task 2] 依赖 [Task 1]（BFF 接口需先确定）
- [Task 3] 依赖 [Task 1]（需要 BFF 的接口地址）
- [Task 4] 依赖 [Task 2], [Task 3]
- [Task 5] 依赖 [Task 4]
- [Task 6] 依赖 [Task 5]
- [Task 7] 依赖 [Task 1]（BFF 代码完成后才能配置构建）