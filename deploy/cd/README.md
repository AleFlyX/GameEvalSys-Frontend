# CD 专用部署

这个目录只负责“CI 产物 + Nginx 打包”流程。

## 用法

1. CD开始执行之前，在运行此服务的linux上创建前端nginx环境配置
   - 将deploy/cd/.env.template的内容复制到刚刚创建的`.env`，并且按需更改

```bash
cp deploy/cd/.env.template /opt/gameevaluate-cd/.env
```

3. 由 CI 把 `build-output` 解压到 [deploy/cd/dist](dist).
4. 进入 [deploy/cd](.) 后执行：

```bash
docker compose up -d --build --remove-orphans
```

## 说明

- 这里的 Dockerfile 不再执行前端 build。
- `deploy/cd/.env` 只负责 Nginx 运行时变量。
- 宿主机端口 `8999` 映射到容器 `8080`。
