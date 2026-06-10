# 作业提交页面 Spec

## Why

当前系统缺少学生提交 C++ 游戏作品和答辩 PPT 的入口。用户（`normal` 角色）需要一个清晰的上传页面来提交自己的项目文件与答辩 PPT，管理员需要能查看和管理这些提交。大文件上传（项目压缩包可能达数百 MB）需要有独立网关处理，避免阻塞 Java 业务线程。

---

## 系统架构

```
                          文件流 + 进度推送
  ┌───────────┐  分片上传  ┌──────────────────┐  文件落地后转发元数据  ┌──────────────┐
  │   Vue3    │ ─────────→ │  Node.js BFF     │ ───────────────────→  │  Java 后端   │
  │  前端     │ ←───────── │  (上传网关)       │ ←─────────────────── │  Spring Boot │
  └───────────┘  进度/状态  │  port: 3001      │   文件路径+状态       └──────────────┘
                           └──────────────────┘
                                │
                          ┌─────┴─────┐
                          │ 磁盘/OSS  │
                          │ (文件存储) │
                          └───────────┘
```

- **BFF** 独立部署，独立进程，不占用 Tomcat 线程
- 前端的上传/分片/续传接口全部走 BFF
- 业务相关接口（提交记录查询、状态更新）仍走 Java 后端
- BFF 在文件落地后，通过 HTTP 调用 Java 后端的回调接口传递文件路径和元数据

---

## What Changes

- **前端**：新增 `/normal/submission` 页面，允许 `normal` 角色用户提交作业
- **BFF 层**：新建 `upload-bff/` 目录，独立的 Node.js 服务，负责大文件上传的全流程
- **后端**：Java 新增提交记录存储和回调接口
- **入口**：首页快捷入口 + 侧边栏菜单添加"提交作业"导航

---

## Impact

- Affected specs: 普通用户新增"提交作业"功能入口
- Affected code:
  - `src/pages/normal/submission/` — 新页面目录
  - `src/components/business/submission/` — 上传组件（拖拽区、进度条、文件列表）
  - `src/api/submission.js` — 前端调 BFF/后端的 API 模块
  - `src/utils/chunked-upload/` — 前端分片上传工具（含 Web Worker）
  - `src/pages/normal/home/HomePage.vue` — 快捷入口配置
  - `upload-bff/` — Node.js 上传网关服务（新目录）
  - `vite.config.js` — 开发环境代理新增 `/api/upload` 指向 BFF
  - 动态路由菜单 — 后端需添加此菜单项

---

## 目录结构变化

```
GameEvaluate-frontend/
├── upload-bff/                          # 【新增】Node.js 上传网关
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.js                     # 入口，Express 服务器
│   │   ├── routes/
│   │   │   └── upload.js                # 上传/分片/续传路由
│   │   ├── middleware/
│   │   │   ├── auth.js                  # JWT 鉴权（验证前端传来的 token）
│   │   │   └── rateLimit.js             # 上传速率限制
│   │   ├── services/
│   │   │   ├── chunkManager.js          # 分片存储与合并
│   │   │   ├── fileValidator.js         # 文件类型/大小/bMagic Number 校验
│   │   │   └── backendNotifier.js       # 文件落地后通知 Java 后端
│   │   └── config/
│   │       └── index.js                 # 配置（临时目录、分片大小、限速等）
│   └── temp/                            # 分片临时存储（可挂载卷）
└── src/
    ├── api/
    │   └── submission.js                # 【新增】提交相关 API
    ├── utils/
    │   └── chunked-upload/              # 【新增】前端分片上传工具（含 Web Worker）
    │       ├── index.js
    │       └── hash-worker.js
    ├── components/
    │   └── business/
    │       └── submission/              # 【新增】上传组件
    │           ├── FileUploader.vue      # 可复用的分片上传组件
    │           └── SubmitHistory.vue     # 提交记录列表组件
    └── pages/
        └── normal/
            └── submission/              # 【新增】提交页面
                ├── index.vue
                ├── composables/
                │   └── useSubmission.js
                └── config/
                    └── formRules.js
```

---

## 前端并行计算方案（Web Worker）

### 为什么用 Web Worker

计算文件分片哈希属于 CPU 密集型任务，如果在主线程中进行，容易导致页面卡顿/动画掉帧，因此采用 **Web Worker 并行计算分片哈希**。

### 原始方案的问题（参考你的测试页面）

1. ❌ **File 对象不能直接 postMessage 给 Worker**：
   - File 对象是主上下文特定，通过结构化克隆会复制整个文件到 Worker 内存 → 大文件会导致 OOM
   - Worker 中也无法再次读取原 File 对象

2. ❌ **频繁创建/销毁 Worker**：
   - 每个任务新建 Worker 开销大，且没有复用机制

3. ❌ **并发粒度**：
   - 可以用更少 Worker 处理更多任务（复用 Worker 池）

### 优化方案

**核心改进点**：
  1. ✅ **Worker 池复用**：固定数量 Worker（≤ CPU 核心数），避免频繁创建
  2. ✅ **只传 ArrayBuffer**：通过 `file.slice()` 分片后，用 FileReader 读取成 ArrayBuffer，再通过 `transferable objects` 转移所有权给 Worker
  3. ✅ **并发任务调度**：任务队列 + Worker 池并发执行

### 目录结构

```
src/utils/chunked-upload/
├── index.js              # ChunkedUploader 类（主要入口）
└── hash-worker.js        # 哈希计算 Worker
```

### ChunkedUploader 使用示例

```javascript
import { ChunkedUploader } from '@/utils/chunked-upload';

const uploader = new ChunkedUploader({
  file: yourFile,
  chunkSize: 5 * 1024 * 1024, // 5MB per chunk
  concurrent: 3,
  onChunkHashProgress: (percent) => {
    console.log('Hash compute progress:', percent);
  },
  onProgress: (percent) => {
    console.log('Upload progress:', percent);
  },
  onUploadChunkProgress: (index, percent) => {
    console.log(`Chunk ${index} progress:`, percent);
  }
});

// 1. 初始化（计算哈希）
const { fileHash, chunks } = await uploader.init();

// 2. 上传分片
await uploader.start(async (chunk, onProgress) => {
  // 调用你的上传接口
  const form = new FormData();
  form.append('chunk', chunk.blob);
  form.append('index', chunk.index);
  form.append('hash', chunk.hash);
  form.append('fileHash', fileHash);
  await axios.post('/api/upload/chunk', form, {
    onUploadProgress: (e) => onProgress(Math.round((e.loaded / e.total) * 100))
  });
});

// 3. 销毁（释放 Worker）
uploader.destroy();
```

### Worker 内部实现

```javascript
// hash-worker.js
import SparkMD5 from 'spark-md5';

onmessage = function (e) {
  const { action, payload } = e.data;
  if (action === 'hash-chunk') {
    const { buffer, index } = payload;
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(buffer);
    const hash = spark.end();
    self.postMessage({
      action: 'hash-chunk-done',
      payload: { index, hash }
    });
  }
};
```

### 前端依赖

```json
{
  "dependencies": {
    "spark-md5": "^3.0.2"
  }
}
```

---

## ADDED Requirements

### Requirement: Node.js BFF 上传网关

The system SHALL provide a Node.js upload gateway service for handling large file uploads.

#### Scenario: BFF 启动与配置

- **WHEN** BFF 服务启动
- **THEN** 监听端口 3001，注册 `/api/upload/*` 路由
- **THEN** 加载配置：分片大小（默认 5MB）、临时目录路径、Java 后端回调地址

#### Scenario: JWT 鉴权

- **WHEN** BFF 接收到上传请求
- **THEN** 从请求头提取 `Authorization: Bearer <token>`
- **THEN** 验证 token 有效性，无效则返回 401

#### Scenario: 分片接收

- **WHEN** BFF 接收到 `POST /api/upload/chunk`
- **THEN** 将分片写入 `temp/<fileHash>/chunk-<index>` 临时文件
- **THEN** 返回当前已接收的分片索引列表

#### Scenario: 断点续传检测

- **WHEN** BFF 接收到 `GET /api/upload/check?fileHash=<hash>`
- **THEN** 查询临时目录中已存在的分片
- **THEN** 返回 `{ uploadedChunks: number[] }`

#### Scenario: 分片合并

- **WHEN** BFF 接收到 `POST /api/upload/merge`
- **THEN** 按分片索引顺序合并文件到目标目录
- **THEN** 合并完成后清理临时分片文件
- **THEN** 通过 HTTP 回调 Java 后端 `POST /api/v1/submission/callback`，传递文件路径、文件名、大小、用户信息

#### Scenario: 文件校验

- **WHEN** BFF 校验文件类型
- **THEN** 读取文件前几个字节（Magic Number）验证真实类型
- **THEN** 校验文件大小是否超限，超限则拒绝

#### Scenario: 错误处理

- **WHEN** 分片上传过程中发生 IO 错误
- **THEN** BFF 返回 500 并附带错误描述
- **WHEN** 合并文件时某个分片缺失
- **THEN** BFF 返回 400 + 缺失的分片索引列表

### Requirement: 提交页面基本结构

The system SHALL provide a dedicated submission page under `/normal/submission`.

#### Scenario: 访问提交页面

- **WHEN** 普通用户登录后访问 `/normal/submission`
- **THEN** 页面展示提交表单与历史提交记录列表

#### Scenario: 表单结构

- **WHEN** 用户打开提交页面
- **THEN** 页面应包含以下字段：
  - 项目名称（必填，文本输入）
  - 项目描述（选填，文本域）
  - 项目文件上传（必填，支持 .zip/.rar/.7z，最大 500MB）
  - 答辩 PPT 上传（必填，支持 .ppt/.pptx/.pdf，最大 100MB）
  - 提交按钮（表单校验通过后可用）

### Requirement: 前端大文件上传

The system SHALL support chunked upload in the frontend with Node.js BFF.

#### Scenario: 分片上传流程

- **WHEN** 用户选择文件
- **THEN** 前端在浏览器端计算文件 MD5/SHA256 哈希
- **THEN** 请求 BFF `/api/upload/check` 检测已上传分片
- **THEN** 对未上传的分片逐一通过 BFF `/api/upload/chunk` 上传
- **THEN** 所有分片上传完成后，请求 BFF `/api/upload/merge` 触发合并

#### Scenario: 上传进度

- **WHEN** 文件分片上传中
- **THEN** 页面展示实时进度条（百分比 + 已上传/总大小 + 上传速度估算）

#### Scenario: 直传（小文件）

- **WHEN** 文件小于 10MB
- **THEN** 不走分片，直接通过 `POST /api/upload/direct` 上传

### Requirement: 提交记录查询

The system SHALL let users view their submission history (via Java backend).

#### Scenario: 提交历史

- **WHEN** 用户访问提交页面
- **THEN** 页面底部展示该用户的历史提交记录列表（调用 `GET /api/v1/submission/records`）
- **THEN** 每条记录显示：提交时间、项目名称、文件列表、审核状态（待审核/通过/驳回）

### Requirement: 页面入口

The system SHALL provide navigation entry points for the submission page.

#### Scenario: 首页快捷入口

- **WHEN** 普通用户（`normal` 角色）访问首页
- **THEN** 快捷入口面板中显示"提交作业"入口

#### Scenario: 侧边栏菜单

- **WHEN** 后端动态菜单包含提交页面路由
- **THEN** 侧边栏菜单中显示"提交作业"菜单项

---

## 接口约定

### 前端 → BFF（上传相关）

| 方法 | 路径                 | 请求体                                | 响应                           |
| ---- | -------------------- | ------------------------------------- | ------------------------------ |
| POST | `/api/upload/direct` | `multipart/form-data`（单文件）       | `{ fileId, fileName, size }`   |
| POST | `/api/upload/chunk`  | `multipart/form-data`（分片）         | `{ uploadedChunks: number[] }` |
| GET  | `/api/upload/check`  | Query: `fileHash`                     | `{ uploadedChunks: number[] }` |
| POST | `/api/upload/merge`  | `{ fileHash, fileName, totalChunks }` | `{ fileId, filePath, size }`   |

### BFF → Java 后端（回调）

| 方法 | 路径                          | 请求体                                         | 说明                   |
| ---- | ----------------------------- | ---------------------------------------------- | ---------------------- |
| POST | `/api/v1/submission/callback` | `{ fileId, fileName, filePath, size, userId }` | BFF 文件落地后回调通知 |

### 前端 → Java 后端（业务）

| 方法 | 路径                               | 请求体/参数                                              | 说明             |
| ---- | ---------------------------------- | -------------------------------------------------------- | ---------------- |
| POST | `/api/v1/submission/submit`        | `{ projectName, description, projectFileId, pptFileId }` | 提交作业元数据   |
| GET  | `/api/v1/submission/records`       | Query: `page, size`                                      | 查询提交记录     |
| GET  | `/api/v1/submission/files/:fileId` | 路径参数                                                 | 下载已上传的文件 |

---

## 部署方案

### 当前生产环境拓扑

```
公网服务器
    └─ frp
        └─ WAF（另一台 CT）
            └─ 服务 CT
                ├── Nginx（反向代理 + 静态文件服务）
                ├── Java Spring Boot（:8080）
                └── 前端 dist（Nginx serve）
```

### 引入 BFF 后的拓扑

BFF 部署在同一台**服务 CT** 中，不新增 CT：

```
公网服务器
    └─ frp
        └─ WAF（另一台 CT）
            └─ 服务 CT
                ├── Nginx（根据路径分发）
                │   ├── /api/v1/*       → Java :8080（已有）
                │   ├── /api/upload/*   → Node BFF :3001（新增）
                │   └── /*              → 前端静态文件（已有）
                ├── Java Spring Boot（:8080）
                ├── Node.js BFF（:3001）（新增）
                └── 前端 dist（Nginx serve）
```

### Nginx 配置

在现有 `nginx.conf` 基础上，增加 `/api/upload/` 的 location 块：

```nginx
# 已有：Java 后端代理
location /api/v1/ {
    proxy_pass http://localhost:8080;
    # ... 已有配置保持不变
}

# 【新增】BFF 上传网关代理
location /api/upload/ {
    proxy_pass http://localhost:3001;
    client_max_body_size 0;              # 禁止 Nginx 拦截大文件请求体
    proxy_request_buffering off;         # 关闭缓冲，流式传输到 BFF
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# 已有：前端静态文件
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

### BFF 进程管理

非 Docker 部署时，使用 `pm2` 管理 BFF 进程：

```bash
# 安装 pm2
npm install -g pm2

# 启动 BFF
pm2 start upload-bff/src/index.js --name "upload-bff"

# 设置开机自启
pm2 startup
pm2 save
```

或使用 systemd service（以 `/var/www/game-evaluate/upload-bff` 为例）：

```ini
# /etc/systemd/system/upload-bff.service
[Unit]
Description=Game Evaluate Upload BFF
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/game-evaluate/upload-bff
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=JAVA_BACKEND_URL=http://localhost:8080
Environment=UPLOAD_DIR=/var/data/uploads
Environment=TEMP_DIR=/var/data/temp

[Install]
WantedBy=multi-user.target
```

### Docker Compose 方案（已有）

在现有 `deploy/manual/docker-compose.yml` 中增加 BFF 服务定义：

```yaml
version: "3.8"
services:
  # 已有服务保持不变
  java-backend:
    # ... 已有配置

  # 【新增】BFF 上传网关
  upload-bff:
    build:
      context: ./upload-bff
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - JAVA_BACKEND_URL=http://java-backend:8080
      - UPLOAD_DIR=/data/uploads
      - TEMP_DIR=/data/temp
    volumes:
      - upload-data:/data/uploads
      - upload-temp:/data/temp
    restart: unless-stopped
    depends_on:
      - java-backend

  # 已有 nginx 服务
  nginx:
    # ... 已有配置

volumes:
  upload-data:
  upload-temp:
```

### BFF 环境变量说明

| 环境变量               | 默认值                  | 说明                     |
| ---------------------- | ----------------------- | ------------------------ |
| `PORT`                 | `3001`                  | BFF 监听端口             |
| `JAVA_BACKEND_URL`     | `http://localhost:8080` | Java 后端回调地址        |
| `UPLOAD_DIR`           | `./uploads`             | 合并后文件的存储目录     |
| `TEMP_DIR`             | `./temp`                | 分片临时文件目录         |
| `MAX_FILE_SIZE`        | `524288000`（500MB）    | 单文件最大字节数         |
| `CHUNK_SIZE`           | `5242880`（5MB）        | 分片大小（字节）         |
| `RATE_LIMIT_WINDOW_MS` | `60000`                 | 速率限制时间窗口（毫秒） |
| `RATE_LIMIT_MAX`       | `60`                    | 时间窗口内最大请求数     |

---

## REMOVED Requirements

无
