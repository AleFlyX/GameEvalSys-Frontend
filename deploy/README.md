## 在项目根目录下运行

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

## 若拉取docker镜像缓慢，请修改docker镜像源或手动提前下载以下镜像

```
node:20-alpine
nginx:1.27-alpine
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

- 若是用于调试，也可将`npm ci`换成`npm install`
