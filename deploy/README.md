## 目录说明

- [deploy/cd](cd) - CI/CD 专用部署，直接使用 CI 产物。
- [deploy/manual](manual) - 手动部署，Docker 内执行前端 build。

## CD 专用部署

```bash
cd deploy/cd
docker compose up -d --build --remove-orphans
```

## 手动部署

```bash
cd deploy/manual
docker compose up -d --build --remove-orphans
```

## 若拉取docker镜像缓慢，请修改docker镜像源或手动提前下载以下镜像

```
node:20-alpine
nginx:1.28-alpine
nginxinc/nginx-unprivileged:1.29-alpine
```

## 若npm ci缓慢，可在Dockerfile中切换npm`镜像源`或`官方源`

```dockerfile
# 注释以使用官方源
# RUN npm config set registry https://registry.npmmirror.com

# 腾讯云
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/

# 华为云
RUN npm config set registry https://mirrors.huaweicloud.com/repository/npm/
```

- 若是用于调试，也可将 `npm ci` 换成 `npm install`。

## nginx 可配置项

各子目录中的 [deploy/cd/.env.template](cd/.env.template) 和 [deploy/manual/.env.template](manual/.env.template) 都会通过 `env_file` 读取并把下面这些变量传入容器，由 nginx 模板渲染：

- `NGINX_LISTEN_PORT`
- `NGINX_SERVER_NAME`
- `NGINX_REAL_IP_FROM`
- `NGINX_BACKEND_UPSTREAM`
- `NGINX_GZIP`

如果要改后端地址、监听端口或真实客户端 IP 信任源，请编辑对应目录下的 `.env.template` 或复制一份为 `.env` 后再调整。
