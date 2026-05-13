# 手动部署

这个目录保留原本的“前端 build 在 Docker 内执行”的部署方式。

## 用法

```bash
cd deploy/manual
cp .env.template .env #复制后按需修改nginx配置项
docker compose up -d --build --remove-orphans
```

## 说明

- Dockerfile 会在镜像构建阶段执行 `npm ci` 和 `npm run build`。
- `deploy/manual/.env` 负责 Nginx 运行时变量。
- 宿主机端口 `8999` 映射到容器 `80`。
